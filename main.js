// main.js
const Executor = require('./src/Executor');
const Logger = require('./utils/Logger');
const UserManager = require('./utils/UserManager');
const config = require('./config');

// Parse command line arguments
function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    operator: null,
    mode: config.app.autorun ? 'auto' : 'manual',
    projectPath: null,
    forceReprocess: false,
    clearErrors: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--operator':
        options.operator = args[i + 1];
        i++; // Skip next argument
        break;
      case '--mode':
        options.mode = args[i + 1];
        i++; // Skip next argument
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
  --operator <name>    Filter projects by operator name (e.g., aszilagyi)
  --mode <auto|manual> Override config mode setting
  --project <path>     Scan specific project path (manual mode only)
  --force              Force reprocess even if result files exist
  --clear-errors       Clear fatal error markers before processing
  --help               Show this help message

Test Mode Information:
  Test mode is currently ${config.app.testMode ? 'ENABLED' : 'DISABLED'} (configured in config.js)
  
  AUTO mode paths:
    - Test mode: ${config.paths.test.autoPath}
    - Production mode: ${config.paths.production.autoPath}
  
  MANUAL mode paths:
    - Test mode: Uses ${config.paths.test.manualPath}
    - Production mode: Prompts user for path input

Examples:
  node main.js --operator aszilagyi
  node main.js --mode manual --project "path/to/project"
  node main.js --operator aszilagyi --mode auto --force
  node main.js --clear-errors
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
    Logger.logInfo(`🎯 Active scan path: ${config.getScanPath() || 'Will prompt user'}`);
    
    if (options.operator) {
      Logger.logInfo(`👤 Operator filter: "${options.operator}"`);
    }
    
    // Initialize user manager for permission checking
    const userManager = new UserManager();
    
    // Create executor with options
    const executor = new Executor();
    
    // Override config if command line options provided
    if (options.mode === 'manual') {
      config.app.autorun = false;
    } else if (options.mode === 'auto') {
      config.app.autorun = true;
    }
    
    if (options.forceReprocess) {
      config.app.forceReprocess = true;
      Logger.logInfo('🔄 Force reprocess enabled - will reprocess even if result files exist');
    }
    
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

