/**
 * JSONScanner Configuration
 * Loads from central BRK_CNC_CORE/config
 */

const { getServiceConfig } = require('../BRK_CNC_CORE/config');

// Load service-specific config from central system
const config = getServiceConfig('jsonScanner');

// Export for backward compatibility with existing code
module.exports = config;

// Helper methods for backward compatibility
config.getJsonScanPath = function() {
  return this.paths.jsonFiles;
};

config.getScanPath = function() {
  return this.paths.jsonFiles;
};
