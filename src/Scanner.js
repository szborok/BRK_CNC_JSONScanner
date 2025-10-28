// path: src/Scanner.js
/**
 * Handles automatic or manual scanning of project directories.
 * Detects new JSON files and initializes Project instances.
 */

const fs = require("fs");
const path = require("path");
const config = require("../config");
const { logInfo, logWarn, logError } = require("../utils/Logger");
const { getDirectories } = require("../utils/FileUtils");
const Project = require("./Project");

class Scanner {
  constructor() {
    this.projects = [];
    this.running = false;
  }

  /**
   * Start the scanner.
   * In AUTO mode, the Executor will control scanning.
   * In MANUAL mode, this enables manual scanning capability.
   */
  start() {
    this.running = true;
    logInfo(`Scanner started in ${config.app.autorun ? "AUTO" : "MANUAL"} mode`);

    // In AUTO mode, the Executor controls scanning timing
    // In MANUAL mode, scanning happens on-demand
  }

  /**
   * Stop scanning after the current cycle.
   */
  stop() {
    this.running = false;
    logWarn("Scanner stopped after finishing current project.");
  }

  /**
   * Perform one scan of the data directory.
   * Detects new project folders matching the naming pattern.
   * @param {string} operatorFilter - Optional operator name to filter projects
   * @param {string} customPath - Custom path for manual mode (optional)
   */
  performScan(operatorFilter = null, customPath = null) {
    try {
      // Get the appropriate scan path based on mode and test settings
      const scanPath = customPath || config.getScanPath();
      
      if (!scanPath) {
        logError("No scan path available. Manual mode requires a custom path.");
        return [];
      }

      logInfo(`🔍 Scanning: ${scanPath}`);

      if (!fs.existsSync(scanPath)) {
        if (config.app.testMode) {
          logWarn(`Test path does not exist: ${scanPath}`);
        } else {
          logError(`Production path does not exist: ${scanPath}. Creating directory...`);
          fs.mkdirSync(scanPath, { recursive: true });
          logInfo(`📁 Created production directory: ${scanPath}`);
        }
        return [];
      }

      const dirs = getDirectories(scanPath);
      
      // Recursively scan all directories to find JSON files
      const allJsonFiles = this.findAllJsonFiles(scanPath);
      
      if (allJsonFiles.length === 0) {
        logWarn("No JSON files found in any subdirectories.");
        return;
      }

      logInfo(`Found ${allJsonFiles.length} JSON file(s) across all subdirectories.`);

      // Group JSON files by project and create Project instances
      const projectGroups = this.groupJsonFilesByProject(allJsonFiles);
      let totalProjectsProcessed = 0;
      
      for (const [projectKey, jsonFiles] of projectGroups) {
        for (const jsonFile of jsonFiles) {
          try {
            // Create a project for each JSON file found
            const projectPath = this.getProjectPathFromJsonFile(jsonFile);
            const project = new Project(projectPath);
            
            // Set the JSON file path directly since we found it
            project.jsonFilePath = jsonFile.fullPath;
            project.machineFolder = path.dirname(jsonFile.fullPath);
            project.position = jsonFile.position;
            
            // Check if project has fatal errors and should be skipped
            if (project.hasFatalErrors()) {
              logWarn(`⚠️  Skipping project "${jsonFile.projectName}" - marked as fatal error`);
              continue;
            }
            
            // Load JSON data directly
            const loaded = project.loadJsonData();
            if (loaded) {
              // Apply operator filter if specified
              if (operatorFilter && project.operator !== operatorFilter) {
                logInfo(`Skipped project "${jsonFile.projectName}" - operator "${project.operator}" doesn't match filter "${operatorFilter}"`);
                continue;
              }
              
              // Check if already processed (unless force reprocessing is enabled)
              if (project.isAlreadyProcessed() && !config.app.forceReprocess) {
                logInfo(`⏭️  Skipping project "${jsonFile.projectName}" - already processed (result file exists)`);
                continue;
              }
              
              project.isValid = true;
              project.status = "ready";
              this.projects.push(project);
              logInfo(`Added project "${jsonFile.projectName}" with ${project.getTotalJobCount()} operations, ${project.compoundJobs.size} NC files`);
              totalProjectsProcessed++;
            }
          } catch (err) {
            logError(`Error processing JSON file ${jsonFile.fileName}: ${err.message}`);
          }
        }
      }

      logInfo(`Successfully processed ${totalProjectsProcessed} project(s) from ${allJsonFiles.length} JSON file(s).`);
    } catch (err) {
      logError(`Scanner failed: ${err.message}`);
    }
  }

  /**
   * Trigger a manual scan for a single project path (used when autorun is off).
   * @param {string} projectPath - Path to the project to scan.
   * @param {string} operatorFilter - Optional operator name to filter projects
   */
  scanProject(projectPath, operatorFilter = null) {
    try {
      const project = new Project(projectPath);
      const initialized = project.initialize(operatorFilter);
      
      if (initialized && project.isValid) {
        this.projects.push(project);
        logInfo(`Manually added project "${project.name}" with ${project.compoundJobs.size} NC file(s)`);
      } else if (operatorFilter) {
        logInfo(`Project "${project.name}" has no files for operator "${operatorFilter}"`);
      } else {
        logWarn(`Project "${project.name}" has no valid target JSON files`);
      }
    } catch (err) {
      logError(`Manual scan failed: ${err.message}`);
    }
  }

  /**
   * Returns all discovered projects.
   */
  getProjects() {
    return this.projects;
  }

  /**
   * Prompts user for a path in manual mode (when not in test mode).
   * @returns {Promise<string>} The path provided by user
   */
  async promptForPath() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      const currentMode = config.app.testMode ? 'TEST' : 'PRODUCTION';
      logInfo(`\n📂 Manual Mode (${currentMode}) - Please provide a path to scan:`);
      logInfo(`Example: D:\\YourData\\Projects`);
      
      rl.question('Enter path: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * Scan with automatic path resolution or user prompt if needed.
   * @param {string} operatorFilter - Optional operator filter
   * @param {string} providedPath - Optional path provided externally
   * @returns {Promise<void>}
   */
  async scanWithPathResolution(operatorFilter = null, providedPath = null) {
    try {
      let scanPath = providedPath;

      // Check if we need to ask user for path
      if (!scanPath && config.requiresUserPath()) {
        scanPath = await this.promptForPath();
        
        if (!scanPath) {
          logError("No path provided. Cannot proceed with manual scan.");
          return;
        }
      }

      // Perform the scan
      this.performScan(operatorFilter, scanPath);
      
    } catch (err) {
      logError(`Path resolution failed: ${err.message}`);
    }
  }

  /**
   * Recursively finds all JSON files in the given directory tree.
   * @param {string} rootPath - Root directory to start searching
   * @returns {Array} - Array of JSON file objects with metadata
   */
  findAllJsonFiles(rootPath) {
    const jsonFiles = [];
    
    const scanDirectory = (dirPath) => {
      try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Recursively scan subdirectories
            scanDirectory(fullPath);
          } else if (item.isFile() && item.name.endsWith('.json')) {
            // Skip generated files
            if (item.name.includes('BRK_fixed') || item.name.includes('BRK_result')) {
              continue;
            }
            
            // Extract project information from filename and path
            const fileInfo = this.extractProjectInfoFromPath(fullPath, item.name);
            if (fileInfo) {
              jsonFiles.push(fileInfo);
            }
          }
        }
      } catch (err) {
        logWarn(`Cannot scan directory ${dirPath}: ${err.message}`);
      }
    };
    
    scanDirectory(rootPath);
    return jsonFiles;
  }

  /**
   * Extracts project information from JSON file path and name.
   * @param {string} fullPath - Full path to the JSON file
   * @param {string} fileName - Name of the JSON file
   * @returns {Object|null} - Project info object or null if not a valid project file
   */
  extractProjectInfoFromPath(fullPath, fileName) {
    // Match project pattern: W5270NS01003A.json
    const projectMatch = fileName.match(/^(W\d{4}[A-Z]{2}\d{2,})([A-Z]?)\.json$/);
    
    if (projectMatch) {
      const projectBase = projectMatch[1]; // W5270NS01003
      const position = projectMatch[2] || 'A'; // A, B, C, etc. (default to A if not specified)
      const projectName = projectBase + position; // W5270NS01003A
      
      return {
        fullPath: fullPath,
        fileName: fileName,
        projectBase: projectBase,
        projectName: projectName,
        position: position,
        directory: path.dirname(fullPath)
      };
    }
    
    return null;
  }

  /**
   * Groups JSON files by project for organized processing.
   * @param {Array} jsonFiles - Array of JSON file objects
   * @returns {Map} - Map of project groups
   */
  groupJsonFilesByProject(jsonFiles) {
    const groups = new Map();
    
    for (const jsonFile of jsonFiles) {
      const key = jsonFile.projectName;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(jsonFile);
    }
    
    return groups;
  }

  /**
   * Determines the project path from a JSON file location.
   * @param {Object} jsonFile - JSON file object with path information
   * @returns {string} - Project directory path
   */
  getProjectPathFromJsonFile(jsonFile) {
    // Navigate up to find the project root directory
    let currentPath = path.dirname(jsonFile.fullPath);
    
    // Look for a directory that matches the project base pattern
    while (currentPath && currentPath !== path.parse(currentPath).root) {
      const dirName = path.basename(currentPath);
      
      // Check if this directory matches the project pattern
      if (new RegExp(`^${jsonFile.projectBase}$`).test(dirName)) {
        return currentPath;
      }
      
      currentPath = path.dirname(currentPath);
    }
    
    // If no matching project directory found, use the directory containing the JSON file
    return path.dirname(jsonFile.fullPath);
  }
}

module.exports = Scanner;