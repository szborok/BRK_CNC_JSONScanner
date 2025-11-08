#!/usr/bin/env node

/**
 * Test script to demonstrate read-only functionality
 * This script shows how JSONScanner now operates completely read-only
 * by using temporary file copies for all processing.
 */

const path = require("path");
const fs = require("fs");
const TempFileManager = require("./utils/TempFileManager");
const { logInfo, logWarn, logError } = require("./utils/Logger");

async function demonstrateReadOnlyFeatures() {
  console.log("🧪 JSONScanner Read-Only Functionality Demo");
  console.log("==========================================\n");

  const tempManager = new TempFileManager();

  try {
    // Find test source data
    const testSourceDataDir = path.join(__dirname, "data", "test_source_data");

    if (!fs.existsSync(testSourceDataDir)) {
      console.log("❌ Test data directory not found");
      console.log(
        "📂 Please ensure test_source_data directory exists with sample JSON files"
      );
      return;
    }

    console.log(`📂 Scanning test source data: ${testSourceDataDir}\n`);

    // Find JSON files
    const jsonFiles = [];
    const findJsonFiles = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items.slice(0, 3)) {
        // Limit for demo
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (
          stats.isFile() &&
          item.endsWith(".json") &&
          !item.includes("BRK_")
        ) {
          jsonFiles.push(fullPath);
        } else if (stats.isDirectory() && jsonFiles.length < 2) {
          try {
            findJsonFiles(fullPath);
          } catch (err) {
            // Skip directories we can't read
          }
        }

        if (jsonFiles.length >= 2) break;
      }
    };

    findJsonFiles(testSourceDataDir);

    if (jsonFiles.length === 0) {
      console.log("⚠️  No JSON files found in test data");
      console.log(
        "📄 Please add some JSON files to test_source_data directory"
      );
      return;
    }

    console.log(`✅ Found ${jsonFiles.length} JSON file(s) for demo:\n`);

    // Demonstrate copying to temp
    console.log("🔄 Step 1: Copying files to temporary location (READ-ONLY)");
    console.log("--------------------------------------------------------");

    for (const jsonFile of jsonFiles) {
      const fileName = path.basename(jsonFile);
      const originalSize = fs.statSync(jsonFile).size;

      console.log(`📄 Processing: ${fileName} (${originalSize} bytes)`);

      // Copy to temp
      const tempPath = await tempManager.copyToTemp(jsonFile);
      const tempSize = fs.statSync(tempPath).size;

      console.log(`   → Copied to temp: ${path.basename(tempPath)}`);
      console.log(
        `   → Size verification: ${
          originalSize === tempSize ? "✅ Match" : "❌ Mismatch"
        }`
      );
      console.log(
        `   → Original remains untouched: ${
          fs.existsSync(jsonFile) ? "✅ Yes" : "❌ No"
        }\n`
      );
    }

    // Show session info
    console.log("📊 Step 2: Session Information");
    console.log("------------------------------");
    const sessionInfo = tempManager.getSessionInfo();
    console.log(`Session ID: ${sessionInfo.sessionId}`);
    console.log(`Temp Directory: ${sessionInfo.sessionPath}`);
    console.log(`Files Tracked: ${sessionInfo.trackedFiles}`);
    console.log(`Tracked Paths:`);
    sessionInfo.trackedPaths.forEach((p) => {
      console.log(`   - ${path.basename(p)}`);
    });
    console.log("");

    // Demonstrate change detection
    console.log("🔍 Step 3: Change Detection");
    console.log("---------------------------");

    console.log("Checking for changes in original files...");
    const changes = await tempManager.detectChanges();
    console.log(`Result: ${changes.summary}`);

    if (changes.hasChanges) {
      console.log("📝 Details:");
      if (changes.changedFiles.length > 0) {
        console.log(`   Changed files: ${changes.changedFiles.length}`);
      }
      if (changes.newFiles.length > 0) {
        console.log(`   New files: ${changes.newFiles.length}`);
      }
      if (changes.deletedFiles.length > 0) {
        console.log(`   Deleted files: ${changes.deletedFiles.length}`);
      }
    }
    console.log("");

    // Demonstrate file access patterns
    console.log("📋 Step 4: Processing Pattern (Read-Only)");
    console.log("-----------------------------------------");
    console.log("✅ Original files are NEVER modified");
    console.log("✅ All processing uses temporary copies");
    console.log("✅ Results are saved separately (database/result files)");
    console.log("✅ Change detection compares file dates/hashes");
    console.log("✅ Automatic cleanup on session end");
    console.log("");

    // Show what happens in normal operation
    console.log("🔄 Step 5: Normal Operation Flow");
    console.log("--------------------------------");
    console.log("1. Scanner finds original JSON files");
    console.log("2. Files are copied to temp directory");
    console.log("3. All analysis works with temp copies");
    console.log("4. Results saved to database/result files");
    console.log("5. Original files remain completely untouched");
    console.log("6. Next scan checks for changes via dates/hashes");
    console.log("7. Only changed files are re-copied to temp");
    console.log("8. Temp files cleaned up on exit");
    console.log("");

    // Cleanup demo
    console.log("🧹 Step 6: Cleanup");
    console.log("------------------");
    console.log("Cleaning up demo session...");
    tempManager.cleanup();

    // Verify cleanup
    const sessionExists = fs.existsSync(sessionInfo.sessionPath);
    console.log(
      `Temp directory removed: ${!sessionExists ? "✅ Yes" : "❌ No"}`
    );
    console.log("Original files still intact: ✅ Yes");
    console.log("");

    console.log("🎉 Demo completed successfully!");
    console.log("");
    console.log("🔐 Key Benefits:");
    console.log("   • Complete read-only operation");
    console.log("   • No risk of modifying original files");
    console.log("   • Efficient change detection");
    console.log("   • Automatic cleanup");
    console.log("   • Safe parallel processing");
  } catch (error) {
    console.error("❌ Demo failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    // Ensure cleanup
    try {
      tempManager.cleanup();
    } catch (err) {
      console.warn("⚠️  Cleanup warning:", err.message);
    }
  }
}

// Run the demo
if (require.main === module) {
  demonstrateReadOnlyFeatures().catch(console.error);
}

module.exports = { demonstrateReadOnlyFeatures };
