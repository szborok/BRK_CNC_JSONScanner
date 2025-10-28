// main.js
const Executor = require('./src/Executor');
const Logger = require('./utils/Logger');
const UserManager = require('./utils/UserManager');
const config = require('./config');

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    mode: config.app.autorun ? 'auto' : 'manual',
    projectPath: null,
    forceReprocess: false,
    clearErrors: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
        options.mode = args[i + 1];
        i++; // Skip next argument
        break;
      case '--manual':
        options.mode = 'manual';
        break;
      case '--auto':
        options.mode = 'auto';
        break;
      case '--project':
        options.projectPath = args[i + 1];
        i++; // Skip next argument
        break;
      case '--force':
        options.forceReprocess = true;
        break;
      case '--clear-errors':
        options.clearErrors = true;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
JSON Scanner Application

Usage: node main.js [options]

Options:
  --mode <auto|manual> Override config mode setting
  --manual             Set mode to manual (shortcut for --mode manual)
  --auto               Set mode to auto (shortcut for --mode auto)
  --project <path>     Scan specific project path (manual mode only)
  --force              Force reprocess even if result files exist
  --clear-errors       Clear fatal error markers before processing
  --help               Show this help message

Test Mode Information:
  Test mode is currently ${config.app.testMode ? 'ENABLED' : 'DISABLED'} (configured in config.js)
  
  AUTO mode paths:
    - Test mode: ${config.paths.test.testDataPathAuto}
    - Production mode: ${config.paths.production.productionDataPath}
  
  MANUAL mode paths:
    - Test mode: Uses ${config.paths.test.testDataPathManual}
    - Production mode: Prompts user for path input

Examples:
  node main.js --manual --project "path/to/project"
  node main.js --auto --force
  node main.js --clear-errors
  node main.js --manual (will prompt for path in production mode)
  `);
}

// Start the JSON scanner application
async function main() {
  try {
    const options = parseArguments();
    
    Logger.logInfo('🚀 Starting JSON Scanner Application...');
    Logger.logInfo(`📝 Log file: ${Logger.getLogFilePath()}`);
    Logger.logInfo(`⚙️  Configuration: ${options.mode.toUpperCase()} mode, ${config.app.logLevel} level`);
    Logger.logInfo(`📁 Data source: ${config.app.testMode ? 'Test data' : 'Production data'}`);
    // Override config if command line options provided
    if (options.mode === 'manual') {
      config.app.autorun = false;
    } else if (options.mode === 'auto') {
      config.app.autorun = true;
    }

    Logger.logInfo(`🎯 Active scan path: ${config.getScanPath() || 'Will prompt user'}`);
    
    if (options.forceReprocess) {
      config.app.forceReprocess = true;
      Logger.logInfo('🔄 Force reprocess enabled - will reprocess even if result files exist');
    }
    
    // Initialize user manager for permission checking
    const userManager = new UserManager();
    
    // Create executor with options
    const executor = new Executor();
    
    await executor.start(options);
    
    Logger.logInfo('✅ Application started successfully');
  } catch (error) {
    Logger.logError(`❌ Application startup failed: ${error.message}`);
    Logger.logError(`Stack trace: ${error.stack}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  Logger.logInfo('🛑 Received shutdown signal (SIGINT)');
  Logger.logInfo('👋 Application shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  Logger.logInfo('🛑 Received shutdown signal (SIGTERM)');
  Logger.logInfo('👋 Application shutting down gracefully...');
  process.exit(0);
});

main().catch((error) => {
  Logger.logError(`💥 Unhandled error in main: ${error.message}`);
  Logger.logError(`Stack trace: ${error.stack}`);
  process.exit(1);
});

