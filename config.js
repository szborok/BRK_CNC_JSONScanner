// config.js
/**
 * Unified application configuration.
 * Contains all settings, paths, and rule-specific data.
 */

const path = require("path");

const config = {
  // Application settings
  app: {
    testMode: true, // true = use test data paths, false = use production paths
    autorun: true, // true = automatic scanning and execution, false = manual mode
    scanIntervalMs: 60000, // How often the autorun scanner checks for new JSONs (60 seconds)
    logLevel: "info", // can be: 'debug', 'info', 'warn', 'error'
    enableDetailedLogging: true,
    forceReprocess: false, // true = reprocess even if result file exists, false = skip processed files
  },

  // Web app settings (for future web service)
  webApp: {
    port: 3000,
    enableAuth: true,
    sessionSecret: "your-secret-key-here", // Change in production
    maxFileSize: "10MB",
    allowedOrigins: ["http://localhost:3000"],
  },

  // User roles and permissions
  permissions: {
    admin: {
      canUseAutoMode: true,
      canUseManualMode: true,
      canViewAllProjects: true,
      canModifySettings: true
    },
    user: {
      canUseAutoMode: false,
      canUseManualMode: true,
      canViewAllProjects: false, // Only own projects
      canModifySettings: false
    }
  },

  // Paths
  paths: {
    // Test mode paths (for development and testing)
    test: {
      testDataPathAuto: path.join(__dirname, "data", "testPathHumming_auto"),
      testDataPathManual: path.join(__dirname, "data", "testPathOne_manual"),
    },
    // Production mode paths (for live operation)
    production: {
      productionDataPath: path.join(__dirname, "data", "production"), // Will be created if doesn't exist
      manualPath: null, // Will be provided by user in manual mode
    },
    // General paths
    dataRoot: path.join(__dirname, "data"),
  },

  // File naming
  files: {
    jsonExtension: ".json",
    fixedSuffix: "BRK_fixed",
    resultSuffix: "BRK_result",
  },

  // Tool categories for rules
  toolCategories: {
    gundrill: [
      "GUH-1865", "GUH-3032", "GUH-3033", "GUH-3035", "GUH-5639", 
      "GUH-5640", "GUH-5641", "GUH-5688", "GUH-5691", "GUH-49298", 
      "TUN-AF", "TOO-AF"
    ],
    endmill_finish: [
      "FRA-P15250", "FRA-P15251", "FRA-P15254", "FRA-P8521"
    ],
    endmill_roughing: [
      "GUH-6736", "GUH-6961", "FRA-P8420"
    ],
    jjtools: ["JJ"],
    tgt: ["TGT"],
    xfeed: [
      "FRA-X7600", "FRA-X7604", "FRA-X7620", "FRA-X7624"
    ],
    cleaning: [
      "G12R6-tisztito_H63Z12L120X"
    ],
    touchprobe: [
      "DMG-TAP75_H63-Renishaw-taszter-HSC75",
      "DMG-TAP85_H63TASZTER-DMU85",
      "DMG-TAP100P_H63TASZTER-DMU100P",
      "DMG-TAP100P4_H63-Renishaw-taszter-DMU100P4"
    ]
  },

  // Rule configuration - defines which rules run under what conditions
  rules: {
    'GunDrill60MinLimit': {
      description: 'Gundrill tools should not exceed 60 minutes per NC file',
      failureType: 'ncfile',
      logic: (project) => {
        // Always run for all projects
        return true;
      }
    },

    'SingleToolInNC': {
      description: 'Each NC file should use only one tool',
      failureType: 'ncfile',
      logic: (project) => {
        // Always run except for AutoCorrection compound jobs
        return true; // Rule will internally skip AutoCorrection jobs
      }
    },

    'M110Helical': {
      description: 'M110 command required for helical drilling operations',
      failureType: 'ncfile',
      logic: (project) => {
        // Run if project uses endmill finish, xfeed, or tgt tools with helical drilling
        return (project.hasToolCategory('endmill_finish') || 
                project.hasToolCategory('xfeed') || 
                project.hasToolCategory('tgt')) &&
               project.hasOperationType('helical drilling');
      }
    },

    'M110Contour': {
      description: 'M110 contour operations must have RL compensation',
      failureType: 'ncfile',
      logic: (project) => {
        // Run if project has 2D contour operations
        return project.hasOperationType('2d contour') || 
               project.hasOperationType('contour milling');
      }
    },

    'ReconditionedTool': {
      description: 'Validate reconditioned tool usage',
      failureType: 'tool',
      logic: (project) => {
        // Only run on specific machines that don't allow reconditioned tools
        const restrictedMachines = [
          "DMU 100P duoblock Minus",
          "DMU 85 monoblock MINUS"
        ];
        
        const isRestrictedMachine = restrictedMachines.some(machine => 
          project.machine?.includes(machine)
        );
        
        // Only run if project uses tools that can be reconditioned AND is on restricted machine
        return isRestrictedMachine && 
               (project.hasToolCategory('endmill_finish') || 
                project.hasToolCategory('endmill_roughing'));
      }
    },

    'AutoCorrectionContour': {
      description: 'Auto correction validation for contour operations',
      failureType: 'project',
      logic: (project) => {
        // Only run on specific machines that require auto correction
        const restrictedMachines = [
          "DMU 100P duoblock Minus",
          "DMU 85 monoblock MINUS"
        ];
        
        const isRestrictedMachine = restrictedMachines.some(machine => 
          project.machine?.includes(machine)
        );
        
        // Only run for restricted machines with contour operations
        return isRestrictedMachine &&
               project.hasOperationType('contour');
      }
    },

    'AutoCorrectionPlane': {
      description: 'Auto correction validation for plane operations',
      failureType: 'project',
      logic: (project) => {
        // Only run on specific machines that require auto correction
        const restrictedMachines = [
          "DMU 100P duoblock Minus",
          "DMU 85 monoblock MINUS"
        ];
        
        const isRestrictedMachine = restrictedMachines.some(machine => 
          project.machine?.includes(machine)
        );
        
        // Only run for restricted machines with plane operations
        return isRestrictedMachine &&
               project.hasOperationType('plane');
      }
    }
  }
};

/**
 * Helper function to get the correct scanning path based on current mode settings
 * @param {string|null} manualPath - Path provided by user in manual mode (optional)
 * @returns {string} The path to scan for JSON files
 */
config.getScanPath = function(manualPath = null) {
  const { testMode, autorun } = this.app;
  
  if (autorun) {
    // Auto mode: use predefined paths
    return testMode ? this.paths.test.testDataPathAuto : this.paths.production.productionDataPath;
  } else {
    // Manual mode: use provided path or fallback to test manual path
    if (manualPath) {
      return manualPath;
    }
    return testMode ? this.paths.test.testDataPathManual : null;
  }
};

/**
 * Helper function to check if we need to ask user for a path
 * @returns {boolean} True if user input is required for path selection
 */
config.requiresUserPath = function() {
  const { testMode, autorun } = this.app;
  
  // Only require user path in manual mode when not in test mode
  return !autorun && !testMode;
};

module.exports = config;