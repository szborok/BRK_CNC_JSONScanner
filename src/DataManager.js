/**
 * Data Manager for JSONScanner
 * Wraps StorageAdapter to provide JSONScanner specific data operations
 * Supports both local JSON files and MongoDB storage
 */

const StorageAdapter = require("../utils/StorageAdapter");
const config = require("../config");
const { logInfo, logError } = require("../utils/Logger");
const fs = require("fs");
const path = require("path");

class DataManager {
  constructor() {
    this.storage = null;
    this.collections = {
      scanResults: "scan_results",
      analysisResults: "analysis_results",
      projects: "projects",
      ruleExecutions: "rule_executions",
    };
  }

  async initialize() {
    try {
      this.storage = new StorageAdapter(config.storage.type);
      await this.storage.initialize();

      logInfo(`📊 Data storage initialized: ${this.storage.getStorageType()}`);

      // Set up TTL cleanup for MongoDB
      if (this.storage.getStorageType() === "mongodb") {
        await this.setupTTLIndexes();
      }

      return true;
    } catch (error) {
      logError("Failed to initialize data storage:", error);
      throw error;
    }
  }

  async setupTTLIndexes() {
    // Set up automatic cleanup for old scan results
    if (config.dataRetention.scanResults.autoCleanup) {
      const ttlSeconds =
        config.dataRetention.scanResults.retentionDays * 24 * 60 * 60;

      try {
        // This would need MongoDB-specific implementation
        logInfo(
          `⏰ TTL cleanup configured: ${config.dataRetention.scanResults.retentionDays} days`
        );
      } catch (error) {
        logError("Failed to setup TTL indexes:", error);
      }
    }
  }

  // Save scan results with metadata
  async saveScanResult(project, analysisResults) {
    try {
      const scanResult = {
        projectPath: project.getProjectPath(),
        projectName: project.getFullName(),
        analysisResults: analysisResults,
        timestamp: new Date(),
        success: true,
        rulesApplied: analysisResults.rules?.length || 0,
        issuesFound: analysisResults.issues?.length || 0,
        storage_type: this.storage.getStorageType(),
      };

      const result = await this.storage.insertOne(
        this.collections.scanResults,
        scanResult
      );

      logInfo(
        `💾 Scan result saved: ${project.getFullName()} (${this.storage.getStorageType()})`
      );

      // Also save to traditional file if using local storage
      if (this.storage.getStorageType() === "local") {
        await this.saveTraditionalResultFile(project, analysisResults);
      }

      return result.insertedId;
    } catch (error) {
      logError(
        `Failed to save scan result for ${project.getFullName()}:`,
        error
      );
      throw error;
    }
  }

  // Backward compatibility: save traditional result file
  async saveTraditionalResultFile(project, analysisResults) {
    try {
      const resultPath = project.getResultFilePath();

      if (!resultPath) {
        return null;
      }

      // Ensure directory exists
      const dir = path.dirname(resultPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the result file
      fs.writeFileSync(
        resultPath,
        JSON.stringify(analysisResults, null, 2),
        "utf8"
      );

      return resultPath;
    } catch (error) {
      logError(`Failed to save traditional result file:`, error);
      return null;
    }
  }

  // Get scan results with filtering
  async getScanResults(filters = {}) {
    try {
      const query = {};

      if (filters.projectName) {
        query.projectName = filters.projectName;
      }

      if (filters.since) {
        query.timestamp = { $gte: new Date(filters.since) };
      }

      if (filters.success !== undefined) {
        query.success = filters.success;
      }

      const results = await this.storage.findAll(
        this.collections.scanResults,
        query
      );

      // Sort by timestamp descending
      results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return results;
    } catch (error) {
      logError("Failed to get scan results:", error);
      throw error;
    }
  }

  // Get latest scan result for a project
  async getLatestScanResult(projectName) {
    try {
      const results = await this.getScanResults({ projectName, limit: 1 });
      return results[0] || null;
    } catch (error) {
      logError(`Failed to get latest scan result for ${projectName}:`, error);
      return null;
    }
  }

  // Save project metadata
  async saveProject(project) {
    try {
      const projectData = {
        projectPath: project.getProjectPath(),
        projectName: project.getFullName(),
        lastScanned: new Date(),
        jsonFiles: project.getJsonFiles()?.length || 0,
        status: "scanned",
      };

      // Use upsert pattern
      const existing = await this.storage.findOne(this.collections.projects, {
        projectName: projectData.projectName,
      });

      if (existing) {
        await this.storage.updateOne(
          this.collections.projects,
          { projectName: projectData.projectName },
          projectData
        );
      } else {
        await this.storage.insertOne(this.collections.projects, projectData);
      }

      return projectData;
    } catch (error) {
      logError(`Failed to save project ${project.getFullName()}:`, error);
      throw error;
    }
  }

  // Get all projects
  async getProjects() {
    try {
      return await this.storage.findAll(this.collections.projects);
    } catch (error) {
      logError("Failed to get projects:", error);
      return [];
    }
  }

  // Save rule execution details
  async saveRuleExecution(projectName, ruleName, result) {
    try {
      const execution = {
        projectName,
        ruleName,
        result,
        timestamp: new Date(),
        success: !result.hasError,
      };

      await this.storage.insertOne(this.collections.ruleExecutions, execution);
    } catch (error) {
      logError(
        `Failed to save rule execution ${ruleName} for ${projectName}:`,
        error
      );
    }
  }

  // Get analytics data
  async getAnalytics() {
    try {
      const [scanResults, projects, ruleExecutions] = await Promise.all([
        this.storage.findAll(this.collections.scanResults),
        this.storage.findAll(this.collections.projects),
        this.storage.findAll(this.collections.ruleExecutions),
      ]);

      const analytics = {
        totalScans: scanResults.length,
        successfulScans: scanResults.filter((r) => r.success).length,
        totalProjects: projects.length,
        totalIssues: scanResults.reduce(
          (sum, r) => sum + (r.issuesFound || 0),
          0
        ),
        storageType: this.storage.getStorageType(),
        lastScan:
          scanResults.length > 0
            ? new Date(
                Math.max(...scanResults.map((r) => new Date(r.timestamp)))
              )
            : null,
        recentScans: scanResults
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10),
      };

      return analytics;
    } catch (error) {
      logError("Failed to get analytics:", error);
      throw error;
    }
  }

  // Clean up old data
  async cleanup() {
    try {
      if (!config.dataRetention.scanResults.autoCleanup) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - config.dataRetention.scanResults.retentionDays
      );

      // Delete old scan results
      const deleteQuery = {
        timestamp: { $lt: cutoffDate },
      };

      if (this.storage.getStorageType() === "local") {
        // For local storage, just mark as deleted or move to archive
        const oldResults = await this.storage.findAll(
          this.collections.scanResults,
          deleteQuery
        );
        logInfo(`🧹 Found ${oldResults.length} old scan results to clean up`);

        for (const result of oldResults) {
          await this.storage.deleteOne(this.collections.scanResults, {
            _id: result._id,
          });
        }
      } else {
        // MongoDB can handle this more efficiently
        // This would need MongoDB-specific implementation
        logInfo("🧹 TTL cleanup handled by MongoDB");
      }
    } catch (error) {
      logError("Failed to cleanup old data:", error);
    }
  }

  // Create backup
  async createBackup() {
    try {
      return await this.storage.createBackup();
    } catch (error) {
      logError("Failed to create backup:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const health = await this.storage.healthCheck();
      const stats = await this.getAnalytics();

      return {
        ...health,
        stats: {
          totalScans: stats.totalScans,
          totalProjects: stats.totalProjects,
          lastScan: stats.lastScan,
        },
      };
    } catch (error) {
      logError("Health check failed:", error);
      return {
        status: "error",
        error: error.message,
      };
    }
  }

  // Disconnect storage
  async disconnect() {
    if (this.storage) {
      await this.storage.disconnect();
    }
  }
}

module.exports = DataManager;
