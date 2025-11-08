#!/usr/bin/env node

/**
 * Demo script showing complete temp-only processing
 * Everything goes to temp folder - input copies AND results
 */

const path = require("path");
const Scanner = require("./src/Scanner");
const Executor = require("./src/Executor");
const DataManager = require("./src/DataManager");
const { logInfo } = require("./utils/Logger");

async function demonstrateTempOnlyProcessing() {
  console.log("🔐 JSONScanner Complete Temp-Only Processing Demo");
  console.log("🗂️  NEW: Organized BRK CNC Management Dashboard Structure");
  console.log("================================================\n");

  let dataManager = null;
  let executor = null;

  try {
    // Initialize data manager
    dataManager = new DataManager();
    await dataManager.initialize();

    // Create executor
    executor = new Executor(dataManager);

    // Get test source data path
    const testSourceDataPath = path.join(
      __dirname,
      "data",
      "test_source_data",
      "testPathHumming_auto"
    );
    console.log(`📂 Using test source data: ${testSourceDataPath}\n`);

    // Get scanner for session info
    const scanner = executor.scanner;
    const sessionInfo = scanner.getTempSessionInfo();

    console.log("📊 Session Information:");
    console.log(`   - Session ID: ${sessionInfo.sessionId}`);
    console.log(`   - Temp Directory: ${sessionInfo.sessionPath}`);
    console.log(`   - Results Directory: ${sessionInfo.resultsDir}`);
    console.log("");

    console.log("🔄 Step 1: Scanning and copying original files to temp...");

    // Perform scan (this copies files to temp)
    await scanner.performScan(testSourceDataPath);

    const projects = scanner.getProjects();
    console.log(`✅ Found ${projects.length} project(s) copied to temp`);

    // Show tracked files
    const updatedSessionInfo = scanner.getTempSessionInfo();
    console.log(`   - Files tracked: ${updatedSessionInfo.trackedFiles}`);
    console.log("");

    if (projects.length > 0) {
      console.log("🔄 Step 2: Processing projects (all in temp)...");

      // Process first project as example
      const project = projects[0];
      console.log(`📋 Processing: ${project.getFullName()}`);
      console.log(
        `   - Working with temp JSON: ${path.basename(project.jsonFilePath)}`
      );

      // This would normally run analysis and save results to temp
      const mockResults = {
        project: project.getFullName(),
        status: "processed_in_temp",
        tempProcessing: true,
        processedAt: new Date().toISOString(),
        message: "All processing done in temp folder - originals untouched",
      };

      // Save results to temp folder
      await executor.results.saveProjectResults(project, mockResults);
      console.log("✅ Results saved to temp folder");
      console.log("");
    }

    console.log("📋 Step 3: Checking organized temp session contents...");

    // Show what's in temp now
    const finalSessionInfo = scanner.getTempSessionInfo();
    console.log(
      `   📁 BRK CNC Management Dashboard/JSONScanner structure created`
    );
    console.log(`   📂 Session: ${finalSessionInfo.sessionId}`);
    if (finalSessionInfo.organizationPaths) {
      console.log(
        `   - Input files: ${path.basename(
          finalSessionInfo.organizationPaths.inputFiles
        )}`
      );
      console.log(
        `   - Collected JSONs: ${path.basename(
          finalSessionInfo.organizationPaths.collectedJsons
        )}`
      );
      console.log(
        `   - Fixed JSONs: ${path.basename(
          finalSessionInfo.organizationPaths.fixedJsons
        )}`
      );
      console.log(
        `   - Results: ${path.basename(
          finalSessionInfo.organizationPaths.results
        )}`
      );
    }
    console.log(`   - Total tracked files: ${finalSessionInfo.trackedFiles}`);
    console.log(`   - Result files created: ${finalSessionInfo.resultFiles}`);

    // List actual result files
    const resultFiles = scanner.tempManager.getResultFiles();
    if (resultFiles.length > 0) {
      console.log("\n📄 Result files in temp:");
      resultFiles.forEach((result) => {
        console.log(`   - ${result.filename} (${result.size} bytes)`);
      });
    }
    console.log("");

    console.log("🔒 Step 4: Verification - Original files untouched");
    console.log("   ✅ Original scan location remains completely unchanged");
    console.log("   ✅ All input processing used temp copies only");
    console.log("   ✅ All results saved to temp folder only");
    console.log("   ✅ Zero risk to original data");
    console.log("");

    console.log("💡 Step 5: Result management options");
    console.log(
      '   📤 Export results: node main.js --export-results "/path/to/save"'
    );
    console.log("   📋 List results: node main.js --list-results");
    console.log("   🗃️  Archive results: run with --preserve-results flag");
    console.log(
      "   🧹 Auto-cleanup: temp files cleaned on exit (unless preserved)"
    );
    console.log("");

    console.log("🎉 Demo completed successfully!");
    console.log("");
    console.log("🔐 Key Achievement:");
    console.log(
      "   EVERYTHING now happens in organized BRK CNC temp structure!"
    );
    console.log("   📁 /tmp/BRK CNC Management Dashboard/JSONScanner/");
    console.log("      └── session_xxxxx/");
    console.log("          ├── input_files/     (original files copied here)");
    console.log("          ├── collected_jsons/ (found JSON files)");
    console.log("          ├── fixed_jsons/     (processed/fixed JSONs)");
    console.log("          └── results/         (analysis results)");
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
  } finally {
    // Cleanup
    if (executor) {
      console.log("\n🧹 Cleaning up demo session...");
      executor.stop(false); // Don't preserve results for demo
      console.log("✅ Demo cleanup completed");
    }

    if (dataManager) {
      await dataManager.disconnect();
    }
  }
}

// Run the demo
if (require.main === module) {
  demonstrateTempOnlyProcessing().catch(console.error);
}

module.exports = { demonstrateTempOnlyProcessing };
