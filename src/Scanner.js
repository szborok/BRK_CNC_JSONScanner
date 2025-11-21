/**
 * Scanner stub - This service is being refactored to pure file search/indexing
 * Full scanner logic moved to BRK_CNC_JSONAnalyzer
 * 
 * TODO: Implement lightweight file discovery and indexing service
 */

const { logWarn } = require("../utils/Logger");

class Scanner {
  constructor() {
    this.projects = [];
    this.tempManager = null;
    logWarn("Scanner stub - full implementation moved to JSONAnalyzer service");
  }

  start() {
    // Stub method - do nothing
  }

  stop() {
    // Stub method - do nothing
  }

  async performScan() {
    logWarn("Scanner.performScan() - not implemented, use JSONAnalyzer for analysis");
    return [];
  }

  async scanDirectory() {
    logWarn("Scanner.scanDirectory() - not implemented, use JSONAnalyzer for analysis");
    return [];
  }

  async discoverProjects() {
    logWarn("Scanner.discoverProjects() - not implemented, use JSONAnalyzer for analysis");
    return [];
  }

  async scanWithPathResolution() {
    logWarn("Scanner.scanWithPathResolution() - not implemented, use JSONAnalyzer for analysis");
    return [];
  }

  getProjects() {
    return this.projects;
  }

  getTempSessionInfo() {
    return {
      sessionId: "stub",
      trackedFiles: 0
    };
  }

  scanProject(projectPath) {
    logWarn(`Scanner.scanProject() - not implemented, use JSONAnalyzer for analysis`);
  }
}

module.exports = Scanner;
