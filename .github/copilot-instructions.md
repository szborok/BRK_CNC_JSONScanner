# JSONScanner AI Assistant Instructions

## Project Overview

JSONScanner is a Node.js-based quality control system for CNC manufacturing projects. It automatically scans project directories, applies business rules, and generates analysis reports for manufacturing compliance. The system operates in test/production modes with persistent temp file management and supports both local JSON storage and MongoDB.

## Architecture & Core Components

### Component Hierarchy

- **Executor** (`src/Executor.js`) - Main orchestrator, handles auto/manual modes
- **Scanner** (`src/Scanner.js`) - Discovers JSON files in project directories
- **Analyzer** (`src/Analyzer.js`) - Parses project data into structured format
- **RuleEngine** (`src/RuleEngine.js`) - Auto-discovers and executes rules from `/rules/`
- **Project** (`src/Project.js`) - Core domain model with CompoundJobs and ToolInfo
- **DataManager** (`src/DataManager.js`) - Wraps StorageAdapter for JSON/MongoDB persistence
- **Results** (`src/Results.js`) - Manages analysis output and result tracking

### Data Flow Pattern

1. Scanner finds JSON files → 2. Analyzer parses into Project model → 3. RuleEngine applies business rules → 4. Results writes analysis output

### Key Utilities

- **PersistentTempManager** (`utils/`) - Maintains organized temp structure mirroring source
- **ProgressTracker** - Progress reporting for bulk operations
- **Logger** - Structured logging with daily rotation
- **CleanupService** - Manages temp file cleanup and retention

## Critical Configuration

**Test vs Production Mode**: `config.js` has `app.testMode` flag that switches data paths. Always verify this setting.

**Read-Only Processing Settings**:

- `app.usePersistentTempFolder: true` - Use organized temp structure
- `app.userDefinedWorkingFolder: null` - User can override temp location
- `app.tempBaseName: "BRK CNC Management Dashboard"` - Organized folder name

**Auto vs Manual Execution**:

- Auto mode: `npm run auto` (scans every 60s)
- Manual mode: `npm run manual` (processes specific projects)
- Custom temp: `node main.js --working-folder "D:/CNC_Processing"`

## Rule Development Pattern

Rules are auto-discovered from `/rules/` directory. Each rule file exports one function:

```javascript
// Rules follow this pattern in /rules/ExampleRule.js
function exampleRule(project) {
  const violations = [];

  // Access project data via project.compoundJobs Map
  for (const [fileName, compoundJob] of project.compoundJobs) {
    // Business logic here
    if (violationCondition) {
      violations.push({
        type: "violation_type",
        severity: "error|warning|info",
        message: "Human readable description",
        context: { additionalData },
      });
    }
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

module.exports = exampleRule;
```

## Project Data Structure

Projects contain:

- `compoundJobs` (Map): Key=NC filename, Value=operations array
- `tools` (Map): Tool definitions and usage data
- Metadata: operator, machine, position, timestamps

Operations have: programName, toolName, code (G/M codes), depth, feedRate, etc.

## Development Workflows

**Entry Point**: `main.js` - Handles CLI args and mode selection with extensive CLI options

**Quick Test**: `node quick_test.js` - Minimal test runner for development, tests both local and MongoDB storage

**Development Mode**: `npm run dev:scanner` - Auto mode with enhanced logging

**Debug Utilities**:

- `node debug.js` - Log viewing, clearing, and debugging helpers
- `debug.js` provides functions to view recent logs, clear logs, and list log files

**CLI Commands**:

- `npm run auto` - Continuous scanning mode (60s intervals)
- `npm run manual` - Single project processing
- `npm run cleanup` - Remove all generated BRK_fixed/BRK_result files
- `npm run test-readonly` - Test temp operations without side effects
- `node main.js --export-results <dir>` - Export current temp results
- `node main.js --list-results` - List all result files in current session
- `node main.js --working-folder "D:/Custom"` - Use custom temp location

## Persistent Temp Structure

The system uses `PersistentTempManager` to maintain organized temp folders that mirror original project structure. Key for file path resolution and cleanup operations.

## Storage Abstraction

DataManager supports both local JSON files and MongoDB via StorageAdapter. MongoDB config in `config.storage` section - check connection settings when debugging data issues.

## Logging Conventions

Use structured logging with context:

```javascript
const { logInfo, logError } = require("../utils/Logger");
logInfo("Operation completed", {
  projectId: project.name,
  operation: "scan",
  duration: elapsed,
});
```

## Key File Paths

- Entry point: `main.js` (handles CLI args and mode selection)
- Config: `config.js` (all settings, rule conditions, paths)
- Rules: `/rules/` (auto-discovered business rule modules)
- Utils: `/utils/` (shared utilities, file operations, logging)
- Test source data: `/test_source_data/` (sample projects for development)

## Common Debugging

1. **Rule not executing**: Check `config.rules` section for rule conditions
2. **Path issues**: Verify test mode setting and base path configuration
3. **Missing data**: Check Scanner's temp file management and Project parsing
4. **Performance**: Use ProgressTracker for bulk operations monitoring
