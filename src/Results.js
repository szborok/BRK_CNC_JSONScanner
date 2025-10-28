// path: src/Results.js
/**
 * Handles saving of rule check results and summaries.
 * Creates a result file beside the project's JSON file.
 */

const fs = require("fs");
const path = require("path");
const { logInfo, logError } = require("../utils/Logger");
const config = require("../config");

class Results {
  /**
   * Saves project analysis results to disk beside the original JSON.
   * @param {Project} project - The project instance
   * @param {Object} analysisResults - Analysis results from project.getAnalysisResults()
   */
  saveProjectResults(project, analysisResults) {
    try {
      const resultPath = project.getResultFilePath();
      
      if (!resultPath) {
        logError(`Cannot generate result file path for project: ${project.getFullName()}`);
        return null;
      }

      // Ensure directory exists
      const dir = path.dirname(resultPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write results to file
      fs.writeFileSync(resultPath, JSON.stringify(analysisResults, null, 2), "utf8");

      logInfo(`✅ Result file saved: ${path.basename(resultPath)}`);
      this.printSummary(analysisResults);
      
      return resultPath;
    } catch (err) {
      logError(`❌ Failed to save result file for ${project.getFullName()}: ${err.message}`);
      return null;
    }
  }

  /**
   * Prints a readable summary of the analysis results to the console.
   * @param {Object} analysisResults - Analysis results object
   */
  printSummary(analysisResults) {
    const { project, summary, rules } = analysisResults;

    logInfo(`\n📋 Analysis Summary for ${project}`);
    logInfo(`  Overall Status: ${summary?.overallStatus?.toUpperCase() || 'UNKNOWN'}`);
    
    if (rules && rules.length > 0) {
      const passed = rules.filter(r => r.status === 'passed').length;
      const failed = rules.filter(r => r.status === 'failed').length;
      const skipped = rules.filter(r => r.status === 'not_applicable').length;
      
      logInfo(`  Rules: ${passed} passed, ${failed} failed, ${skipped} not applicable`);
      
      // Show failed rules
      const failedRules = rules.filter(r => r.status === 'failed');
      if (failedRules.length > 0) {
        logInfo(`  Failed Rules:`);
        failedRules.forEach(rule => {
          logInfo(`    ❌ ${rule.name}: ${rule.violationCount} violation(s)`);
        });
      }
    } else {
      logInfo(`  Rules: No rules executed`);
    }
    
    logInfo(`  Project Stats: ${analysisResults.compoundJobs?.length || 0} NC files, ${analysisResults.tools?.length || 0} tools`);
  }
}

module.exports = Results;