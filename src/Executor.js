// path: src/Executor.js
/**
 * The Executor orchestrates the full process:
 * scanning, analyzing, applying rules, and writing results.
 */

const config = require("../config");
const { logInfo, logWarn, logError } = require("../utils/Logger");
const Scanner = require("./Scanner");
const Analyzer = require("./Analyzer");
const RuleEngine = require("./RuleEngine");
const Results = require("./Results");

class Executor {
  constructor() {
    this.scanner = new Scanner();
    this.analyzer = new Analyzer();
    this.ruleEngine = new RuleEngine();
    this.results = new Results();
    this.isRunning = false;
    this.manualQueue = [];
  }

  /**
   * Start the entire process (autorun or manual).
   * @param {Object} options - Command line options including operator filter
   */
  async start(options = {}) {
    if (this.isRunning) {
      logWarn("Executor already running.");
      return;
    }

    this.isRunning = true;
    this.operatorFilter = options.operator || null;
    
    logInfo(`Executor started (${config.app.autorun ? "AUTO" : "MANUAL"} mode).`);
    
    if (this.operatorFilter) {
      logInfo(`Filtering projects for operator: "${this.operatorFilter}"`);
    }

    this.scanner.start();

    if (config.app.autorun) {
      await this.runAutorunCycle();
    } else if (options.projectPath) {
      // Manual mode with specific project path
      await this.runManualProject(options.projectPath);
    } else {
      // Manual mode - use path resolution (test mode or user input)
      await this.runManualMode();
    }
  }

  /**
   * Runs continuously when autorun is true.
   * Waits for new projects and processes them sequentially.
   */
  async runAutorunCycle() {
    let scanCount = 0;
    
    while (this.isRunning && config.app.autorun) {
      scanCount++;
      const scanStartTime = new Date();
      
      logInfo(`🔄 Auto Scan #${scanCount} - Starting at ${scanStartTime.toLocaleTimeString()}`);
      
      // Clear previous projects and scan with operator filter
      this.scanner.projects = [];
      this.scanner.performScan(this.operatorFilter);
      
      const projects = this.scanner.getProjects();
      const scanEndTime = new Date();
      const scanDuration = scanEndTime.getTime() - scanStartTime.getTime();

      logInfo(`✅ Auto Scan #${scanCount} - Completed at ${scanEndTime.toLocaleTimeString()} (took ${scanDuration}ms)`);
      
      if (projects.length > 0) {
        logInfo(`📊 Processing ${projects.length} project(s) found in scan #${scanCount}`);
      } else {
        logInfo(`📭 No new projects found in scan #${scanCount}`);
      }

      for (const project of projects) {
        if (project.status === "ready") {
          await this.processProject(project);
        }
      }

      // Wait before scanning again with countdown
      if (this.isRunning && config.app.autorun) {
        await this.waitWithCountdown(config.app.scanIntervalMs, scanCount);
      }
    }
  }

  /**
   * Process a project: analyze -> rule check -> results.
   */
  async processProject(project) {
    try {
      logInfo(`Processing project: ${project.getFullName()}`);

      // Step 1: Analyze the JSON file (validate and fix)
      this.analyzer.analyzeProject(project);
      
      if (project.status === "analysis_failed") {
        logError(`Analysis failed for project: ${project.getFullName()}`);
        // Set up minimal analysis results for failed analysis
        project.setAnalysisResults({});
        this.results.saveProjectResults(project, project.getAnalysisResults());
        return;
      }
      
      // Check for fatal errors after analysis
      if (project.status === "fatal_error") {
        logError(`❌ Project has fatal errors and cannot be processed: ${project.getFullName()}`);
        return;
      }

      // Step 2: Execute rules
      const ruleResults = this.ruleEngine.executeRules(project);
      
      // Step 3: Store analysis results in project
      project.setAnalysisResults(ruleResults);
      
      // Step 4: Save results to file
      this.results.saveProjectResults(project, project.getAnalysisResults());

      logInfo(`Project completed: ${project.getFullName()} - Status: ${project.analysisResults.summary.overallStatus}`);
      project.status = "completed";
    } catch (err) {
      logError(`Project processing failed: ${err.message}`);
      
      // Check if this is a critical error that should mark project as fatal
      if (err.message.includes('JSON') || err.message.includes('parse') || err.message.includes('corrupt')) {
        project.markAsFatalError(`Processing failed: ${err.message}`);
        project.status = "fatal_error";
        logError(`❌ Project marked as fatal error due to critical failure`);
      } else {
        // For other errors, mark as failed but still save results to avoid retrying
        project.status = "failed";
        project.setAnalysisResults({}); // Empty results 
        this.results.saveProjectResults(project, project.getAnalysisResults());
        logError(`❌ Project failed but result saved to prevent retry`);
      }
    }
  }

  /**
   * Queue a manual project for execution.
   * Will pause autorun after the current project.
   * @param {string} projectPath - Path to project or URL to process
   * @param {string} operatorFilter - Optional operator filter for manual processing
   */
  async runManualProject(projectPath, operatorFilter = null) {
    logInfo(`Manual run requested for: ${projectPath}`);
    
    if (operatorFilter) {
      logInfo(`Manual run with operator filter: "${operatorFilter}"`);
    }

    if (config.app.autorun) {
      logWarn("Autorun active — will pause after current project.");
      config.app.autorun = false;
    }

    this.manualQueue.push({ path: projectPath, operator: operatorFilter });

    // Wait for any running project to finish
    while (this.isRunning) await new Promise((res) => setTimeout(res, 1000));

    try {
      this.scanner.scanProject(projectPath, operatorFilter);
      const projects = this.scanner.getProjects();
      
      // Process the most recently added project
      const latestProject = projects[projects.length - 1];
      if (latestProject && latestProject.status === "ready") {
        await this.processProject(latestProject);
      } else {
        logWarn(`No valid project found at: ${projectPath}`);
      }
    } catch (err) {
      logError(`Manual project processing failed: ${err.message}`);
    }

    logInfo("Manual project finished. Resuming autorun...");
    config.app.autorun = true;
    await this.start({ operator: this.operatorFilter });
  }

  /**
   * Run manual mode with automatic path resolution (test mode or user input).
   */
  async runManualMode() {
    try {
      logInfo(`Starting manual mode (${config.app.testMode ? 'TEST' : 'PRODUCTION'})`);
      
      // Use the scanner's path resolution method
      await this.scanner.scanWithPathResolution(this.operatorFilter);
      
      const projects = this.scanner.getProjects();
      
      if (projects.length === 0) {
        logWarn("No projects found to process.");
        return;
      }

      logInfo(`Found ${projects.length} project(s) to process in manual mode.`);
      
      // Process all found projects
      for (const project of projects) {
        if (project.status === "ready") {
          await this.processProject(project);
        }
      }
      
      logInfo("Manual mode processing completed.");
      
    } catch (err) {
      logError(`Manual mode failed: ${err.message}`);
    }
  }

  /**
   * Waits for the specified interval with a countdown display.
   * @param {number} intervalMs - Wait time in milliseconds
   * @param {number} scanCount - Current scan number for logging
   */
  async waitWithCountdown(intervalMs, scanCount) {
    const totalSeconds = Math.floor(intervalMs / 1000);
    const nextScanTime = new Date(Date.now() + intervalMs);
    
    logInfo(`⏱️  Waiting ${totalSeconds} seconds until next scan (#${scanCount + 1}) at ${nextScanTime.toLocaleTimeString()}`);
    
    // Show countdown every 10 seconds for intervals >= 30 seconds
    if (totalSeconds >= 30) {
      for (let remaining = totalSeconds; remaining > 0; remaining -= 10) {
        if (remaining <= totalSeconds && remaining > 10) {
          logInfo(`⏳ ${remaining} seconds remaining until scan #${scanCount + 1}...`);
        }
        
        const waitTime = Math.min(10000, remaining * 1000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Check if we should stop
        if (!this.isRunning || !config.app.autorun) {
          return;
        }
      }
    } else {
      // For shorter intervals, just wait without countdown
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    
    if (this.isRunning && config.app.autorun) {
      logInfo(`🎯 Starting scan #${scanCount + 1} now...`);
    }
  }

  /**
   * Stop after current work is done.
   */
  stop() {
    logWarn("Executor stop requested.");
    this.isRunning = false;
    this.scanner.stop();
  }
}

module.exports = Executor;