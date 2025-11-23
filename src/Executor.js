// path: src/Executor.js
/**
 * The Executor orchestrates the full process:
 * scanning, analyzing, applying rules, and writing results.
 */

const config = require("../config");
const { logInfo, logWarn, logError } = require("../utils/Logger");
const Scanner = require("./Scanner");
const Analyzer = require("./Analyzer");
const Results = require("./Results");

class Executor {
  constructor(dataManager = null) {
    this.scanner = new Scanner();
    this.analyzer = new Analyzer();
    this.results = new Results(dataManager, this.scanner.tempManager);
    this.dataManager = dataManager;
    this.isRunning = false;
    this.manualQueue = [];
  }

  /**
   * Start the entire process (autorun or manual).
   * @param {Object} options - Command line options
   */
  async start(options = {}) {
    if (this.isRunning) {
      logWarn("Executor already running.");
      return;
    }

    this.isRunning = true;

    logInfo(
      `Executor started (${config.app.autorun ? "AUTO" : "MANUAL"} mode).`
    );

    // Scanner is stub - skip start call
    if (this.scanner && typeof this.scanner.start === 'function') {
      this.scanner.start();
    }

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

      logInfo(
        `🔄 Auto Scan #${scanCount} - Starting at ${scanStartTime.toLocaleTimeString()}`
      );

      // Clear previous projects and scan with temp file management
      this.scanner.projects = [];
      await this.scanner.performScan();

      const projects = this.scanner.getProjects();
      const scanEndTime = new Date();
      const scanDuration = scanEndTime.getTime() - scanStartTime.getTime();

      logInfo(
        `✅ Auto Scan #${scanCount} - Completed at ${scanEndTime.toLocaleTimeString()} (took ${scanDuration}ms)`
      );

      // Log temp session info
      const tempInfo = this.scanner.getTempSessionInfo();
      logInfo(
        `📁 Temp session: ${tempInfo.sessionId} (${tempInfo.trackedFiles} files tracked)`
      );

      if (projects.length > 0) {
        logInfo(
          `📊 Processing ${projects.length} project(s) found in scan #${scanCount}`
        );
      } else {
        logInfo(`📭 No new projects found in scan #${scanCount}`);
      }

      for (const project of projects) {
        if (project.status === "ready") {
          await this.processProject(project);
        }
      }

      // Trigger downstream services if new files were found
      if (projects.length > 0) {
        logInfo(`🔗 Triggering downstream services for ${projects.length} new project(s)...`);
        await this.triggerDownstreamServices();
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
  /**
   * Process a single project through the full pipeline
   * @param {import('./Project')} project - Project instance to process
   * @returns {Promise<void>}
   */
  async processProject(project) {
    if (!project || typeof project.getFullName !== 'function') {
      throw new Error(`Invalid project object passed to processProject: ${typeof project}`);
    }
    
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
        logError(
          `❌ Project has fatal errors and cannot be processed: ${project.getFullName()}`
        );
        return;
      }

      // Step 2: Save scanner results (metadata only - no rules)
      this.results.saveProjectResults(project, project.getAnalysisResults());

      logInfo(
        `Project completed: ${project.getFullName()} - Status: copied`
      );
      project.status = "completed";
    } catch (err) {
      logError(`Project processing failed: ${err.message}`);

      // Check if this is a critical error that should mark project as fatal
      if (
        err.message.includes("JSON") ||
        err.message.includes("parse") ||
        err.message.includes("corrupt")
      ) {
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
   */
  async runManualProject(projectPath) {
    logInfo(`Manual run requested for: ${projectPath}`);

    if (config.app.autorun) {
      logWarn("Autorun active — will pause after current project.");
      config.app.autorun = false;
    }

    this.manualQueue.push({ path: projectPath });

    // Wait for any running project to finish
    while (this.isRunning) await new Promise((res) => setTimeout(res, 1000));

    try {
      this.scanner.scanProject(projectPath);
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
    await this.start();
  }

  /**
   * Run manual mode with automatic path resolution (test mode or user input).
   */
  async runManualMode() {
    try {
      logInfo(
        `Starting manual mode (${config.app.testMode ? "TEST" : "PRODUCTION"})`
      );

      // Use the scanner's path resolution method with async support
      await this.scanner.scanWithPathResolution();

      const projects = this.scanner.getProjects();

      if (projects.length === 0) {
        logWarn("No projects found to process.");
        return;
      }

      logInfo(`Found ${projects.length} project(s) to process in manual mode.`);

      // Log temp session info
      const tempInfo = this.scanner.getTempSessionInfo();
      logInfo(
        `📁 Temp session: ${tempInfo.sessionId} (${tempInfo.trackedFiles} files tracked)`
      );

      // Process all projects
      for (const project of projects) {
        if (project.status === "ready") {
          logInfo(`📋 Processing project: ${project.getFullName()}`);
          await this.processProject(project);
        }
      }

      logInfo("✅ Manual mode processing completed.");
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

    logInfo(
      `⏱️  Waiting ${totalSeconds} seconds until next scan (#${
        scanCount + 1
      }) at ${nextScanTime.toLocaleTimeString()}`
    );

    // Show countdown at milestone intervals only (50s, 30s, 10s)
    if (totalSeconds >= 30) {
      const milestones = [50, 30, 10].filter(m => m < totalSeconds);
      let lastMilestone = totalSeconds;
      
      for (const milestone of milestones) {
        const waitTime = (lastMilestone - milestone) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        
        if (!this.isRunning || !config.app.autorun) return;
        
        logInfo(`⏳ ${milestone} seconds remaining until scan #${scanCount + 1}...`);
        lastMilestone = milestone;
      }
      
      // Wait remaining time to 0
      const finalWait = lastMilestone * 1000;
      await new Promise((resolve) => setTimeout(resolve, finalWait));
    } else {
      // For shorter intervals, just wait without countdown
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    if (this.isRunning && config.app.autorun) {
      logInfo(`🎯 Starting scan #${scanCount + 1} now...`);
    }
  }

  /**
   * Logs a concise summary of project processing results.
   * @param {Project} project - The processed project
   * @param {Object} ruleResults - Rule execution results
   */
  // logProjectSummary removed - rule analysis moved to JSONAnalyzer service

  /**
   * Trigger downstream services (Analyzer and ToolManager) via API
   * Runs sequentially: Analyzer first, then ToolManager
   * The API endpoints block until processing completes, ensuring sequential execution
   */
  async triggerDownstreamServices() {
    try {
      // Step 1: Trigger JSONAnalyzer and WAIT for completion (endpoint blocks)
      logInfo('📡 Calling JSONAnalyzer...');
      
      // Retry logic for Analyzer (may not be ready yet on first scan)
      let analyzerSuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const analyzerResponse = await fetch('http://localhost:3005/api/trigger-scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (analyzerResponse.ok) {
            const analyzerResult = await analyzerResponse.json();
            logInfo(`✅ JSONAnalyzer completed: ${analyzerResult.processed || 0} project(s)`);
            analyzerSuccess = true;
            break;
          } else {
            logWarn(`⚠️ JSONAnalyzer returned status ${analyzerResponse.status} (attempt ${attempt}/3)`);
          }
        } catch (fetchError) {
          if (attempt < 3) {
            logWarn(`⚠️ JSONAnalyzer not ready yet, retrying in 3s... (attempt ${attempt}/3)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          } else {
            throw fetchError;
          }
        }
      }
      
      if (!analyzerSuccess) {
        logWarn('⚠️ JSONAnalyzer did not respond after 3 attempts, skipping downstream trigger');
        return;
      }

      // Step 2: Trigger ToolManager AFTER Analyzer completes
      logInfo('📡 Calling ToolManager...');
      const toolResponse = await fetch('http://localhost:3002/api/trigger-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (toolResponse.ok) {
        const toolResult = await toolResponse.json();
        logInfo(`✅ ToolManager completed`);
      } else {
        logWarn(`⚠️ ToolManager returned status ${toolResponse.status}`);
      }
      
      logInfo('🎯 All downstream services completed');
    } catch (error) {
      logError(`Failed to trigger downstream services: ${error.message}`);
    }
  }

  /**
   * Stop after current work is done.
   * @param {boolean} preserveResults - Whether to preserve result files
   */
  stop(preserveResults = false) {
    logWarn("Executor stop requested.");
    this.isRunning = false;
    this.scanner.stop(preserveResults);
  }
}

module.exports = Executor;
