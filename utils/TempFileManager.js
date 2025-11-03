// utils/TempFileManager.js
/**
 * Manages temporary file operations for JSONScanner
 * Ensures read-only access to original files by working with copies
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { logInfo, logWarn, logError } = require('./Logger');

class TempFileManager {
  constructor() {
    this.tempBasePath = path.join(os.tmpdir(), 'jsonscanner');
    this.sessionId = this.generateSessionId();
    this.sessionPath = path.join(this.tempBasePath, this.sessionId);
    this.fileHashes = new Map(); // Track file hashes for change detection
    this.copyQueue = new Map(); // Track copy operations
    this.pathMapping = new Map(); // Map temp paths back to original paths
    
    this.ensureSessionDirectory();
  }

  /**
   * Generate unique session ID for this scanning session
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Ensure session directory exists
   */
  ensureSessionDirectory() {
    try {
      if (!fs.existsSync(this.tempBasePath)) {
        fs.mkdirSync(this.tempBasePath, { recursive: true });
        logInfo(`Created temp base directory: ${this.tempBasePath}`);
      }
      
      if (!fs.existsSync(this.sessionPath)) {
        fs.mkdirSync(this.sessionPath, { recursive: true });
        logInfo(`Created session directory: ${this.sessionPath}`);
      }
    } catch (error) {
      logError('Failed to create temp directories:', error);
      throw error;
    }
  }

  /**
   * Copy a file or directory structure to temp location
   * @param {string} sourcePath - Original file/directory path
   * @param {boolean} preserveStructure - Whether to preserve directory structure
   * @returns {string} - Path to temporary copy
   */
  async copyToTemp(sourcePath, preserveStructure = true) {
    try {
      const sourceStats = fs.statSync(sourcePath);
      const relativePath = this.getRelativePath(sourcePath);
      const tempPath = path.join(this.sessionPath, relativePath);

      if (sourceStats.isDirectory()) {
        return await this.copyDirectoryToTemp(sourcePath, tempPath);
      } else {
        return await this.copyFileToTemp(sourcePath, tempPath);
      }
    } catch (error) {
      logError(`Failed to copy ${sourcePath} to temp:`, error);
      throw error;
    }
  }

  /**
   * Copy a single file to temp location
   */
  async copyFileToTemp(sourcePath, tempPath) {
    try {
      // Ensure parent directory exists
      const tempDir = path.dirname(tempPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Calculate file hash for change detection
      const sourceHash = await this.calculateFileHash(sourcePath);
      const sourceStats = fs.statSync(sourcePath);

      // Copy file
      fs.copyFileSync(sourcePath, tempPath);
      
      // Store metadata for change detection
      this.fileHashes.set(sourcePath, {
        hash: sourceHash,
        mtime: sourceStats.mtime,
        tempPath: tempPath,
        originalPath: sourcePath
      });

      // Store reverse mapping
      this.pathMapping.set(tempPath, sourcePath);

      logInfo(`Copied file: ${sourcePath} → ${tempPath}`);
      return tempPath;
    } catch (error) {
      logError(`Failed to copy file ${sourcePath}:`, error);
      throw error;
    }
  }

  /**
   * Copy directory structure to temp location
   */
  async copyDirectoryToTemp(sourcePath, tempPath) {
    try {
      if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath, { recursive: true });
      }

      const items = fs.readdirSync(sourcePath);
      const copiedPaths = [tempPath];

      for (const item of items) {
        const sourceItem = path.join(sourcePath, item);
        const tempItem = path.join(tempPath, item);
        const itemStats = fs.statSync(sourceItem);

        if (itemStats.isDirectory()) {
          const subPaths = await this.copyDirectoryToTemp(sourceItem, tempItem);
          copiedPaths.push(...subPaths);
        } else {
          await this.copyFileToTemp(sourceItem, tempItem);
          copiedPaths.push(tempItem);
        }
      }

      logInfo(`Copied directory: ${sourcePath} → ${tempPath}`);
      return copiedPaths;
    } catch (error) {
      logError(`Failed to copy directory ${sourcePath}:`, error);
      throw error;
    }
  }

  /**
   * Check if any source files have changed since copying
   * @param {string[]} sourcePaths - Array of original file paths to check
   * @returns {Object} - Change detection results
   */
  async detectChanges(sourcePaths = null) {
    const changes = {
      hasChanges: false,
      changedFiles: [],
      newFiles: [],
      deletedFiles: [],
      summary: ''
    };

    try {
      const pathsToCheck = sourcePaths || Array.from(this.fileHashes.keys());

      for (const sourcePath of pathsToCheck) {
        if (!fs.existsSync(sourcePath)) {
          // File was deleted
          changes.deletedFiles.push(sourcePath);
          changes.hasChanges = true;
          continue;
        }

        const storedInfo = this.fileHashes.get(sourcePath);
        if (!storedInfo) {
          // New file
          changes.newFiles.push(sourcePath);
          changes.hasChanges = true;
          continue;
        }

        const currentStats = fs.statSync(sourcePath);
        
        // Quick check: modification time
        if (currentStats.mtime.getTime() !== storedInfo.mtime.getTime()) {
          // File might have changed, verify with hash
          const currentHash = await this.calculateFileHash(sourcePath);
          
          if (currentHash !== storedInfo.hash) {
            changes.changedFiles.push({
              path: sourcePath,
              oldHash: storedInfo.hash,
              newHash: currentHash,
              oldMtime: storedInfo.mtime,
              newMtime: currentStats.mtime
            });
            changes.hasChanges = true;
          }
        }
      }

      // Generate summary
      const total = changes.changedFiles.length + changes.newFiles.length + changes.deletedFiles.length;
      if (total > 0) {
        changes.summary = `${total} changes detected: ${changes.changedFiles.length} modified, ${changes.newFiles.length} new, ${changes.deletedFiles.length} deleted`;
      } else {
        changes.summary = 'No changes detected';
      }

      logInfo(`Change detection: ${changes.summary}`);
      return changes;

    } catch (error) {
      logError('Failed to detect changes:', error);
      throw error;
    }
  }

  /**
   * Update temp copies for changed files
   * @param {Object} changes - Results from detectChanges()
   * @returns {string[]} - Paths of updated temp files
   */
  async updateChangedFiles(changes) {
    const updatedPaths = [];

    try {
      // Update changed files
      for (const changeInfo of changes.changedFiles) {
        const tempPath = await this.copyToTemp(changeInfo.path);
        updatedPaths.push(tempPath);
        logInfo(`Updated temp copy: ${changeInfo.path}`);
      }

      // Copy new files
      for (const newPath of changes.newFiles) {
        const tempPath = await this.copyToTemp(newPath);
        updatedPaths.push(tempPath);
        logInfo(`Copied new file: ${newPath}`);
      }

      return updatedPaths;
    } catch (error) {
      logError('Failed to update changed files:', error);
      throw error;
    }
  }

  /**
   * Calculate MD5 hash of a file for change detection
   */
  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);

      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * Get relative path for organizing temp files
   * Uses hash-based approach for very long paths
   */
  getRelativePath(absolutePath) {
    // Create a safe relative path by replacing path separators
    const safePath = absolutePath
      .replace(/:/g, '_COLON_')
      .replace(/\\/g, '_BACKSLASH_')
      .replace(/\//g, '_SLASH_');
    
    // Check if the resulting safe path would be too long
    const maxLength = 180; // Safe length for most file systems
    
    if (safePath.length > maxLength) {
      const crypto = require('crypto');
      const hash = crypto.createHash('md5').update(absolutePath).digest('hex');
      const fileName = path.basename(absolutePath);
      const dirName = path.basename(path.dirname(absolutePath));
      
      // Create a meaningful but short name: hash_directory_filename
      return `${hash.substring(0, 8)}_${dirName}_${fileName}`;
    }
    
    return safePath;
  }

  /**
   * Get original path from temp path
   */
  getOriginalPath(tempPath) {
    // First check direct mapping
    if (this.pathMapping.has(tempPath)) {
      return this.pathMapping.get(tempPath);
    }
    
    // Fallback to search in fileHashes
    for (const [originalPath, info] of this.fileHashes) {
      if (info.tempPath === tempPath) {
        return originalPath;
      }
    }
    return null;
  }

  /**
   * Get temp path for original file
   */
  getTempPath(originalPath) {
    const info = this.fileHashes.get(originalPath);
    return info ? info.tempPath : null;
  }

  /**
   * Clean up temporary files for this session
   */
  cleanup() {
    try {
      if (fs.existsSync(this.sessionPath)) {
        this.removeDirectory(this.sessionPath);
        logInfo(`Cleaned up session directory: ${this.sessionPath}`);
      }
      
      this.fileHashes.clear();
      this.copyQueue.clear();
      this.pathMapping.clear();
    } catch (error) {
      logWarn(`Failed to cleanup temp directory: ${error.message}`);
    }
  }

  /**
   * Remove directory recursively
   */
  removeDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          this.removeDirectory(itemPath);
        } else {
          fs.unlinkSync(itemPath);
        }
      }
      
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Get session information
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      sessionPath: this.sessionPath,
      tempBasePath: this.tempBasePath,
      trackedFiles: this.fileHashes.size,
      trackedPaths: Array.from(this.fileHashes.keys())
    };
  }

  /**
   * Clean up old temp sessions (older than 24 hours)
   */
  static cleanupOldSessions() {
    try {
      const tempBasePath = path.join(os.tmpdir(), 'jsonscanner');
      
      if (!fs.existsSync(tempBasePath)) {
        return;
      }

      const sessions = fs.readdirSync(tempBasePath);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const session of sessions) {
        if (!session.startsWith('session_')) {
          continue;
        }

        const sessionPath = path.join(tempBasePath, session);
        const stats = fs.statSync(sessionPath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          const manager = new TempFileManager();
          manager.removeDirectory(sessionPath);
          logInfo(`Cleaned up old session: ${session}`);
        }
      }
    } catch (error) {
      logWarn(`Failed to cleanup old sessions: ${error.message}`);
    }
  }
}

module.exports = TempFileManager;