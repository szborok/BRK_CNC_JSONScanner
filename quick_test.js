#!/usr/bin/env node
// Simple test for both JSONScanner and ClampingPlateManager storage

console.log("🚀 Quick Storage Tests for CNC Management Tools\n");

async function testJsonScanner() {
  console.log("📊 Testing JSONScanner...");

  try {
    const DataManager = require("./src/DataManager");

    // Test Local Storage
    process.env.STORAGE_TYPE = "local";
    const dm1 = new DataManager();
    await dm1.initialize();

    const testProject = {
      projectName: "test_local",
      fileName: "test.json",
      status: "active",
    };
    await dm1.saveProject(testProject);

    const projects = await dm1.getProjects();
    const health1 = await dm1.healthCheck();
    await dm1.disconnect();

    console.log(
      `  ✅ Local: ${health1.type} storage, ${projects.length} projects`
    );

    // Test MongoDB (auto-fallback)
    process.env.STORAGE_TYPE = "auto";
    const dm2 = new DataManager();
    await dm2.initialize();

    const testProject2 = {
      projectName: "test_mongo",
      fileName: "test2.json",
      status: "active",
    };
    await dm2.saveProject(testProject2);

    const health2 = await dm2.healthCheck();
    await dm2.disconnect();

    console.log(`  ✅ Auto: ${health2.type} storage (${health2.status})`);
    console.log("  ✅ JSONScanner storage tests PASSED\n");

    return true;
  } catch (error) {
    console.log(`  ❌ JSONScanner test FAILED: ${error.message}\n`);
    return false;
  }
}

async function testClampingPlateManager() {
  console.log("📋 Testing ClampingPlateManager...");

  try {
    // Change to ClampingPlateManager directory
    process.chdir("../ClampingPlateManagerService");
    const StorageAdapter = require("./utils/StorageAdapter");

    // Test Local Storage
    const storage1 = new StorageAdapter("local");
    await storage1.initialize();

    const testPlate = {
      plateId: "TEST_001",
      name: "Test Plate",
      status: "available",
      location: "rack_a1",
    };

    await storage1.insertOne("plates", testPlate);
    const plates = await storage1.findAll("plates");
    const health1 = await storage1.healthCheck();
    await storage1.disconnect();

    console.log(`  ✅ Local: ${health1.type} storage, ${plates.length} plates`);

    // Test MongoDB (auto-fallback)
    const storage2 = new StorageAdapter("auto");
    await storage2.initialize();

    const testPlate2 = {
      plateId: "TEST_002",
      name: "Test Plate Auto",
      status: "in_use",
      location: "machine_b2",
    };

    await storage2.insertOne("plates", testPlate2);
    const health2 = await storage2.healthCheck();
    await storage2.disconnect();

    console.log(`  ✅ Auto: ${health2.type} storage (${health2.status})`);
    console.log("  ✅ ClampingPlateManager storage tests PASSED\n");

    return true;
  } catch (error) {
    console.log(`  ❌ ClampingPlateManager test FAILED: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  // Start from JSONScanner directory
  process.chdir(
    "/Users/sovi/Library/Mobile Documents/com~apple~CloudDocs/Data/personal_Fun/Coding/Projects/JSONScanner"
  );

  const jsonResult = await testJsonScanner();
  const plateResult = await testClampingPlateManager();

  console.log("📈 Final Results:");
  console.log(`  JSONScanner: ${jsonResult ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  ClampingPlateManager: ${plateResult ? "✅ PASS" : "❌ FAIL"}`);

  if (jsonResult && plateResult) {
    console.log(
      "\n🎉 All storage tests PASSED! Both tools work with local and MongoDB storage."
    );
  } else {
    console.log("\n⚠️  Some tests failed - check error messages above.");
  }
}

runTests().catch(console.error);
