/**
 * Storage abstraction layer for JSONScanner
 * Supports both local JSON files and MongoDB
 * Same pattern as ClampingPlateManagerService
 */

const fs = require("fs").promises;
const path = require("path");

class StorageAdapter {
  constructor(type = "auto") {
    this.type = type; // 'local', 'mongodb', 'auto'
    this.mongoAdapter = null;
    this.localAdapter = null;
    this.activeAdapter = null;
  }

  async initialize() {
    if (this.type === "auto") {
      // Try MongoDB first, fallback to local
      try {
        await this.initializeMongoDB();
        this.type = "mongodb";
        console.log("✅ Using MongoDB storage");
      } catch (error) {
        console.log("⚠️  MongoDB not available, using local storage");
        await this.initializeLocal();
        this.type = "local";
      }
    } else if (this.type === "mongodb") {
      await this.initializeMongoDB();
    } else {
      await this.initializeLocal();
    }
  }

  async initializeMongoDB() {
    this.mongoAdapter = new MongoDBAdapter();
    await this.mongoAdapter.connect();
    this.activeAdapter = this.mongoAdapter;
  }

  async initializeLocal() {
    this.localAdapter = new LocalJSONAdapter();
    await this.localAdapter.initialize();
    this.activeAdapter = this.localAdapter;
  }

  // Delegate all operations to active adapter
  async findAll(collection, filter = {}) {
    return this.activeAdapter.findAll(collection, filter);
  }

  async findOne(collection, filter) {
    return this.activeAdapter.findOne(collection, filter);
  }

  async insertOne(collection, document) {
    return this.activeAdapter.insertOne(collection, document);
  }

  async updateOne(collection, filter, update) {
    return this.activeAdapter.updateOne(collection, filter, update);
  }

  async deleteOne(collection, filter) {
    return this.activeAdapter.deleteOne(collection, filter);
  }

  async createBackup() {
    return this.activeAdapter.createBackup();
  }

  async healthCheck() {
    return this.activeAdapter.healthCheck();
  }

  getStorageType() {
    return this.type;
  }

  async disconnect() {
    if (this.activeAdapter) {
      await this.activeAdapter.disconnect();
    }
  }
}

class MongoDBAdapter {
  constructor() {
    this.database = null;
  }

  async connect() {
    const { MongoClient } = require("mongodb");
    const config = require("../config");

    this.client = new MongoClient(config.mongodb.uri, config.mongodb.options);
    await this.client.connect();
    this.database = this.client.db(config.mongodb.database);
  }

  async findAll(collection, filter = {}) {
    const coll = this.database.collection(collection);
    return await coll.find(filter).toArray();
  }

  async findOne(collection, filter) {
    const coll = this.database.collection(collection);
    return await coll.findOne(filter);
  }

  async insertOne(collection, document) {
    const coll = this.database.collection(collection);
    return await coll.insertOne(document);
  }

  async updateOne(collection, filter, update) {
    const coll = this.database.collection(collection);
    return await coll.updateOne(filter, { $set: update });
  }

  async deleteOne(collection, filter) {
    const coll = this.database.collection(collection);
    return await coll.deleteOne(filter);
  }

  async createBackup() {
    // Simple backup - copy collections with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const collections = ["scan_results", "analysis_results", "projects"];

    for (const collName of collections) {
      const sourceData = await this.findAll(collName);
      const backupCollName = `${collName}_backup_${timestamp}`;

      if (sourceData.length > 0) {
        const backupColl = this.database.collection(backupCollName);
        await backupColl.insertMany(sourceData);
      }
    }

    return {
      success: true,
      timestamp: new Date(),
      collections: collections.length,
    };
  }

  async healthCheck() {
    return {
      status: "connected",
      type: "mongodb",
      connected: !!this.database,
    };
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
    }
  }
}

class LocalJSONAdapter {
  constructor() {
    this.dataDir = path.join(process.cwd(), "data");
    this.collections = new Map();
  }

  async initialize() {
    // Create data directory
    await fs.mkdir(this.dataDir, { recursive: true });

    // Load existing collections
    await this.loadCollections();
  }

  async loadCollections() {
    try {
      const files = await fs.readdir(this.dataDir);

      for (const file of files) {
        if (file.endsWith(".json")) {
          const collectionName = file.replace(".json", "");
          const filePath = path.join(this.dataDir, file);

          try {
            const content = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(content);
            this.collections.set(collectionName, data);
          } catch (error) {
            console.warn(
              `⚠️  Could not load collection ${collectionName}:`,
              error.message
            );
            this.collections.set(collectionName, []);
          }
        }
      }
    } catch (error) {
      console.log("📁 Creating new data directory");
    }
  }

  async saveCollection(collectionName) {
    const data = this.collections.get(collectionName) || [];
    const filePath = path.join(this.dataDir, `${collectionName}.json`);

    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  getCollection(collectionName) {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, []);
    }
    return this.collections.get(collectionName);
  }

  async findAll(collection, filter = {}) {
    const data = this.getCollection(collection);

    if (Object.keys(filter).length === 0) {
      return data;
    }

    // Simple filtering for JSONScanner needs
    return data.filter((item) => {
      return Object.keys(filter).every((key) => {
        if (key.includes(".")) {
          // Handle nested properties
          const parts = key.split(".");
          let value = item;
          for (const part of parts) {
            value = value?.[part];
          }
          return value === filter[key];
        }
        return item[key] === filter[key];
      });
    });
  }

  async findOne(collection, filter) {
    const results = await this.findAll(collection, filter);
    return results[0] || null;
  }

  async insertOne(collection, document) {
    const data = this.getCollection(collection);

    // Add timestamps and ID
    document.createdAt = document.createdAt || new Date();
    document.updatedAt = new Date();
    document._id = document._id || Date.now().toString();

    data.push(document);
    await this.saveCollection(collection);

    return { insertedId: document._id };
  }

  async updateOne(collection, filter, update) {
    const data = this.getCollection(collection);
    const index = data.findIndex((item) => {
      return Object.keys(filter).every((key) => item[key] === filter[key]);
    });

    if (index !== -1) {
      Object.assign(data[index], update, { updatedAt: new Date() });
      await this.saveCollection(collection);
      return { modifiedCount: 1 };
    }

    return { modifiedCount: 0 };
  }

  async deleteOne(collection, filter) {
    const data = this.getCollection(collection);
    const index = data.findIndex((item) => {
      return Object.keys(filter).every((key) => item[key] === filter[key]);
    });

    if (index !== -1) {
      data.splice(index, 1);
      await this.saveCollection(collection);
      return { deletedCount: 1 };
    }

    return { deletedCount: 0 };
  }

  async createBackup() {
    const backupDir = path.join(this.dataDir, "backups");
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(backupDir, `backup-${timestamp}`);

    // Copy all collection files
    const collections = Array.from(this.collections.keys());
    for (const collection of collections) {
      const sourcePath = path.join(this.dataDir, `${collection}.json`);
      const targetPath = path.join(backupPath, `${collection}.json`);

      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      try {
        await fs.copyFile(sourcePath, targetPath);
      } catch (error) {
        console.warn(`Could not backup ${collection}:`, error.message);
      }
    }

    return {
      success: true,
      backupPath,
      collections: collections.length,
      timestamp: new Date(),
    };
  }

  async healthCheck() {
    return {
      status: "connected",
      type: "local",
      dataDir: this.dataDir,
      collections: Array.from(this.collections.keys()),
    };
  }

  async disconnect() {
    // Save all collections before disconnect
    for (const collection of this.collections.keys()) {
      await this.saveCollection(collection);
    }
  }
}

module.exports = StorageAdapter;
