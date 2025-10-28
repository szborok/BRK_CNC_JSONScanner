# Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will get you up and running with the JSON Scanner system quickly.

## Prerequisites

- **Node.js** 14.x or higher ([Download here](https://nodejs.org/))
- **Windows** 10 or higher
- **Access** to network drives with CAD project files

## Installation

### 1. Clone and Setup

```powershell
# Clone the repository
git clone https://github.com/your-org/json-scanner.git
cd json-scanner

# Install dependencies
npm install

# Create required directories
mkdir logs
mkdir test_data
```

### 2. Configuration

Copy and edit the configuration file:

```powershell
# Copy example configuration
copy config\Settings.example.js config\Settings.js

# Edit configuration (use your preferred editor)
notepad config\Settings.js
```

**Essential Configuration Options:**

```javascript
module.exports = {
  app: {
    autorun: true, // Enable automatic scanning
    scanIntervalMs: 60000, // Scan every 60 seconds
    testMode: false, // Set to false for production
    logLevel: "info", // Logging detail level
  },

  paths: {
    // Update this path to your actual data location
    productionDataPath: "\\\\server\\projects",
    testDataPath: "./test_data/testPathHumming_auto",
  },
};
```

### 3. First Run

Start the application:

```powershell
# Development mode (with automatic restart)
npm run dev

# OR Production mode
npm start
```

You should see output like:

```
[2025-01-28 14:30:00] INFO: JSON Scanner starting...
[2025-01-28 14:30:01] INFO: Configuration loaded successfully
[2025-01-28 14:30:01] INFO: Starting auto scan cycle (60 second intervals)
[2025-01-28 14:30:01] INFO: Scan cycle started
[2025-01-28 14:30:02] INFO: Found 9 projects to process
[2025-01-28 14:30:03] INFO: Processing project: W5270NS01003A
```

## Verify Installation

### 1. Check Logs

```powershell
# View real-time logs
Get-Content logs\app-2025-01-28.log -Wait

# OR with PowerShell (shows last 20 lines)
Get-Content logs\app-2025-01-28.log -Tail 20
```

### 2. Check Results

Results are saved alongside the original project files:

```
data/
  testPathHumming_auto/
    W5270NS01003/
      W5270NS01003A/
        result.json          ← Generated analysis results
        W5270NS01003A.json   ← Original project file
        ...
```

### 3. Sample Result File

Open a `result.json` file to see the analysis:

```json
{
  "project": "W5270NS01003A",
  "operator": "szborok",
  "machine": "DMU 100P duoblock Minus",
  "position": "A",
  "summary": {
    "overallStatus": "passed",
    "totalRules": 7,
    "rulesRun": 4,
    "rulesPassed": 4,
    "rulesFailed": 0,
    "totalViolations": 0
  },
  "rules": [
    {
      "name": "GunDrill60MinLimit",
      "description": "Gundrill tools should not exceed 60 minutes per NC file",
      "passed": true,
      "violationCount": 0
    }
  ],
  "processedAt": "2025-01-28T13:30:15.123Z"
}
```

## Common First-Time Issues

### Issue: "No projects found"

**Solution:** Check your data path configuration

```javascript
// In config/Settings.js, make sure the path exists and is accessible
paths: {
  productionDataPath: "C:\\Your\\Actual\\Path\\To\\Projects";
}
```

### Issue: "Permission denied" errors

**Solution:** Run as administrator or check folder permissions

```powershell
# Run PowerShell as Administrator, then:
cd C:\path\to\json-scanner
npm start
```

### Issue: Port already in use

**Solution:** The health check port might be in use

```javascript
// In config/Settings.js, change the health check port
healthCheck: {
  enabled: true,
  port: 3002  // Change from default 3001
}
```

## Next Steps

### 1. Configure for Your Environment

Update `config/Settings.js` with your specific:

- Data paths
- Scan intervals
- Logging preferences
- Rule configurations

### 2. Set Up as a Service

For production use, install as a Windows service:

```powershell
# Install PM2 globally
npm install -g pm2

# Start as service
pm2 start main.js --name "json-scanner"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### 3. Monitor Operation

- **Logs**: Check `logs/` directory for operation details
- **Results**: Monitor `result.json` files being created
- **Performance**: Watch scan cycle timing in logs

### 4. Customize Rules

Add your own quality control rules:

1. Create a new file in `rules/` directory
2. Follow the rule template pattern
3. Restart the application to load new rules

**Example Rule Template:**

```javascript
// rules/MyCustomRule.js
module.exports = {
  name: "MyCustomRule",
  description: "Custom quality control check",

  shouldRun: function (project) {
    // Return true if this rule should run for this project
    return project.machine.includes("DMU");
  },

  execute: function (project, compoundJobs, tools) {
    // Your rule logic here
    return {
      passed: true,
      violations: [],
    };
  },
};
```

## Test Mode

For development and testing, use the included test data:

```javascript
// config/Settings.js
module.exports = {
  app: {
    testMode: true, // Uses ./test_data/testPathHumming_auto
    autorun: true,
    scanIntervalMs: 10000, // Faster scanning for testing
  },
};
```

## Getting Help

- 📖 **Full Documentation**: See `/docs` directory
- 🔧 **Development Guide**: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 🚀 **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- 🏗️ **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Summary

You should now have:
✅ JSON Scanner installed and running  
✅ Automatic scanning every 60 seconds  
✅ Results being generated in `result.json` files  
✅ Logs showing system operation

The system will continuously monitor your specified directories and analyze projects according to the configured quality control rules.

**Ready for production?** See the [Deployment Guide](docs/DEPLOYMENT.md) for production installation instructions.
