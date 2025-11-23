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
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            scanRecursive(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.json')) {
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
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Extract metadata from path structure
    const parts = jsonFilePath.split(path.sep);
    const fileName = path.basename(jsonFilePath, '.json');
    const machine = parts.find(p => p.includes('DMU') || p.includes('DMC') || p.includes('Trimill')) || null;
    
    // Create Project instance
    const project = new Project();
    project.projectPath = jsonFilePath;
    project.fileName = fileName;
    project.machine = data.machine || machine;
    project.operator = data.operator || data.user || null;
    project.status = "ready";
    
    // Parse JSON structure
    if (data.jobs && Array.isArray(data.jobs)) {
      project.jobs = data.jobs;
    }
    
    // Set basic analysis results (metadata only - no rules)
    project.setAnalysisResults({
      processedAt: new Date().toISOString(),
      summary: {
        totalOperations: data.jobs ? data.jobs.length : 0,
        totalNCFiles: data.jobs ? data.jobs.filter(j => j.type === 'ncFile').length : 0
      },
      rules: new Map() // Empty rules - JSONAnalyzer will add these
    });
    
    // Copy file to temp
    const copiedPath = this.tempManager.copyToTemp(jsonFilePath, "input_json_files");
    logInfo(`📄 Copied: ${fileName}`);
    
    return project;
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
