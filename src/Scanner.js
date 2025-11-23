/**
 * JSONScanner - Master file discovery and copy service
 * Finds JSON files, copies to temp, creates basic metadata (no rules/analysis)
 * Other services (JSONAnalyzer, ToolManager) read from copied files
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const { logInfo, logError, logWarn } = require("../utils/Logger");
const Project = require("./Project");
const TempFileManager = require("../utils/TempFileManager");

class Scanner {
  constructor() {
    this.projects = [];
    this.running = false;
    this.tempManager = new TempFileManager("JSONScanner");
    logInfo("JSONScanner initialized - master file copier");
  }

  start() {
    this.running = true;
    logInfo(`Scanner started in ${config.app.autorun ? "AUTO" : "MANUAL"} mode`);
  }

  stop(preserveResults = false) {
    this.running = false;
    logWarn("Scanner stopped");
    if (config.app.testMode) {
      logInfo("🧪 Test mode: Preserving temp data");
    }
  }

  async performScan(customPath = null) {
    try {
      const jsonScanPath = customPath || config.getJsonScanPath();

      if (!jsonScanPath) {
        logError("No JSON scan path configured");
        return [];
      }

      logInfo(`🔍 Scanning: ${jsonScanPath}`);

      // Find ALL JSON files
      const allJsonFiles = this.findAllJsonFiles(jsonScanPath);
      logInfo(`📂 Found ${allJsonFiles.length} JSON file(s)`);

      if (allJsonFiles.length === 0) {
        return [];
      }

      // Copy to temp + create Project instances
      this.projects = [];
      for (const jsonFile of allJsonFiles) {
        try {
          const project = await this.createProjectFromFile(jsonFile);
          if (project) {
            this.projects.push(project);
          }
        } catch (err) {
          logError(`Failed to process ${path.basename(jsonFile)}: ${err.message}`);
        }
      }

      logInfo(`✅ Processed ${this.projects.length} project(s)`);
      return this.projects;
    } catch (err) {
      logError(`Scanner failed: ${err.message}`);
      return [];
    }
  }

  findAllJsonFiles(basePath) {
    const jsonFiles = [];
    
    const scanRecursive = (dir) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        // Check if this directory has both JSON and NC program files
        const filesInDir = entries.filter(e => e.isFile()).map(e => e.name);
        const hasJson = filesInDir.some(f => f.endsWith('.json'));
        const hasNcFiles = filesInDir.some(f => 
          f.endsWith('.nc') || f.endsWith('.NC') || 
          f.endsWith('.h') || f.endsWith('.H') || // Heidenhain
          f.endsWith('.mpf') || f.endsWith('.MPF') || // Siemens
          f.endsWith('.eia') || f.endsWith('.EIA') // EIA/ISO
        );
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanRecursive(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json') && hasNcFiles) {
            // Skip files we already processed (BRK_ prefix, _fixed, _result suffixes)
            if (entry.name.startsWith('BRK_') || 
                entry.name.includes('_fixed.json') || 
                entry.name.includes('_result.json')) {
              continue;
            }
            // Only include original JSON files if this folder has NC files
            jsonFiles.push(fullPath);
          }
        }
      } catch (err) {
        logWarn(`Cannot read directory ${dir}: ${err.message}`);
      }
    };

    scanRecursive(basePath);
    return jsonFiles;
  }

  async createProjectFromFile(jsonFilePath) {
    if (!jsonFilePath) {
      throw new Error('jsonFilePath is required');
    }
    
    // Extract metadata from path structure
    const parts = jsonFilePath.split(path.sep);
    const fileName = path.basename(jsonFilePath, '.json');
    const machine = parts.find(p => p.includes('DMU') || p.includes('DMC') || p.includes('Trimill')) || null;
    
    // Extract project name (parent folder of part number)
    const jsonFilesIndex = parts.findIndex(p => p === 'json_files');
    const projectName = jsonFilesIndex !== -1 ? parts[jsonFilesIndex + 1] : parts[parts.length - 4] || 'Unknown_Project';
    
    // Check if we need to copy (file is new or modified)
    const brkFileName = `BRK_${fileName}.json`;
    
    if (!this.tempManager || !this.tempManager.sessionPath) {
      logError(`TempFileManager not initialized properly!`);
      throw new Error(`TempFileManager not properly initialized`);
    }
    
    const targetPath = path.join(this.tempManager.sessionPath, projectName, machine || 'Unknown_Machine', brkFileName);
    
    const sourceStats = fs.statSync(jsonFilePath);
    let needsCopy = !fs.existsSync(targetPath);
    
    if (!needsCopy) {
      const targetStats = fs.statSync(targetPath);
      needsCopy = sourceStats.mtime > targetStats.mtime;
    }
    
    if (!needsCopy && !config.app.forceReprocess) {
      logInfo(`⏭️  Skipped (unchanged): ${fileName}`);
      return null; // Skip unchanged files
    }
    
    // Sanitize JSON and copy to temp
    try {
      const rawContent = fs.readFileSync(jsonFilePath, 'utf8');
      
      // Fix NaN values (invalid JSON) before copying
      let sanitized = rawContent.replace(/:\s*NaN\s*,/g, ": null,");
      sanitized = sanitized.replace(/:\s*NaN\s*}/g, ": null}");
      
      // Parse to validate it's valid JSON after sanitization
      const data = JSON.parse(sanitized);
      
      // Copy sanitized version to temp with BRK_ prefix in project/machine folder
      const copiedPath = this.tempManager.saveToTemp(
        brkFileName,
        sanitized,
        "input",
        projectName,
        machine || 'Unknown_Machine'
      );
      
      if (!copiedPath) {
        throw new Error('saveToTemp returned undefined');
      }
      
      // Copy related NC/H files from same directory
      const sourceDir = path.dirname(jsonFilePath);
      const targetDir = path.dirname(copiedPath);
      const relatedExtensions = ['.nc', '.h', '.tls'];
      
      try {
        const filesInSourceDir = fs.readdirSync(sourceDir);
        for (const file of filesInSourceDir) {
          const ext = path.extname(file).toLowerCase();
          if (relatedExtensions.includes(ext)) {
            const sourceFile = path.join(sourceDir, file);
            const brkTargetFile = path.join(targetDir, `BRK_${file}`);
            fs.copyFileSync(sourceFile, brkTargetFile);
          }
        }
      } catch (copyErr) {
        logWarn(`Could not copy related files for ${fileName}: ${copyErr.message}`);
      }
      
      // Create Project instance with the copied path
      const project = new Project(copiedPath);
      project.fileName = fileName;
      project.machine = data.machine || machine;
      project.operator = data.operator || data.user || null;
      project.status = "ready";
      
      // Set basic analysis results
      project.setAnalysisResults({
        processedAt: new Date().toISOString(),
        summary: {
          totalOperations: data.operations ? data.operations.length : 0,
          totalNCFiles: 0 // Will be calculated by Analyzer
        },
        rules: new Map()
      });
      
      logInfo(`📄 Copied & sanitized: ${fileName}`);
      return project;
    } catch (parseError) {
      logError(`Failed to sanitize ${fileName}: ${parseError.message}`);
      throw parseError;
    }
  }

  getProjects() {
    return this.projects;
  }

  getTempSessionInfo() {
    return {
      sessionId: this.tempManager.sessionId || "default",
      trackedFiles: this.projects.length
    };
  }
}

module.exports = Scanner;
