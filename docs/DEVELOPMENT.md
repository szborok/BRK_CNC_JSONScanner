# Development Guidelines

## Code Standards

### 1. JavaScript Style Guide

#### Naming Conventions

```javascript
// Classes: PascalCase
class ProjectAnalyzer {}
class RuleEngine {}

// Functions and variables: camelCase
function analyzeProject() {}
const projectData = {};

// Constants: UPPER_SNAKE_CASE
const MAX_PROCESSING_TIME = 30000;
const DEFAULT_SCAN_INTERVAL = 60000;

// Private methods: leading underscore
class Scanner {
  _validatePath(path) {}
  _processDirectory(dir) {}
}

// File names: PascalCase for classes, camelCase for utilities
// ProjectAnalyzer.js, fileUtils.js
```

#### Code Structure

```javascript
// File header with purpose
/**
 * @fileoverview Project analysis and rule execution coordinator
 * @author Development Team
 * @version 1.0.0
 */

// Imports grouped by type
const fs = require("fs");
const path = require("path");

const Logger = require("../utils/Logger");
const Settings = require("../config/Settings");

// Class definition with JSDoc
/**
 * Coordinates project analysis workflow
 * @class
 */
class Analyzer {
  /**
   * Creates analyzer instance
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.logger = new Logger("Analyzer");
  }

  /**
   * Analyzes project against all applicable rules
   * @param {Project} project - Project to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeProject(project) {
    // Implementation
  }
}

module.exports = Analyzer;
```

### 2. Error Handling

#### Error Types

```javascript
// Base application error
class ApplicationError extends Error {
  constructor(message, code = "GENERIC_ERROR", details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Specific error types
class ValidationError extends ApplicationError {
  constructor(message, field, value) {
    super(message, "VALIDATION_ERROR", { field, value });
  }
}

class ProcessingError extends ApplicationError {
  constructor(message, projectId, stage) {
    super(message, "PROCESSING_ERROR", { projectId, stage });
  }
}

class FileSystemError extends ApplicationError {
  constructor(message, filePath, operation) {
    super(message, "FILESYSTEM_ERROR", { filePath, operation });
  }
}
```

#### Error Handling Patterns

```javascript
// Function-level error handling
async function processProject(project) {
  try {
    const results = await analyzeProject(project);
    return { success: true, data: results };
  } catch (error) {
    logger.error(`Project processing failed: ${project.name}`, {
      error: error.message,
      stack: error.stack,
      projectId: project.name,
    });

    // Transform to application error if needed
    if (!(error instanceof ApplicationError)) {
      throw new ProcessingError(
        `Unexpected error processing ${project.name}`,
        project.name,
        "analysis"
      );
    }

    throw error;
  }
}

// Graceful degradation
function executeRule(rule, project) {
  try {
    return rule.execute(project);
  } catch (error) {
    logger.warn(`Rule ${rule.name} failed for ${project.name}`, error);

    return {
      passed: false,
      violations: [
        {
          type: "execution_error",
          severity: "error",
          message: `Rule execution failed: ${error.message}`,
          context: { ruleName: rule.name },
        },
      ],
    };
  }
}
```

### 3. Logging Standards

#### Log Levels and Usage

```javascript
// ERROR: System errors, processing failures
logger.error("Failed to process project", {
  projectId: "W5270NS01001A",
  error: error.message,
  stack: error.stack,
});

// WARN: Recoverable issues, missing optional data
logger.warn("Optional file not found", {
  filePath: "/path/to/optional.json",
  projectId: "W5270NS01001A",
});

// INFO: Normal system operations, significant events
logger.info("Scan cycle completed", {
  projectsProcessed: 9,
  duration: 1250,
  timestamp: new Date().toISOString(),
});

// DEBUG: Detailed execution flow (development only)
logger.debug("Rule evaluation", {
  ruleName: "M110Contour",
  projectId: "W5270NS01001A",
  shouldRun: true,
});
```

#### Structured Logging

```javascript
// Use structured logging with consistent fields
const logContext = {
  module: "Executor",
  operation: "scanCycle",
  sessionId: generateSessionId(),
  timestamp: new Date().toISOString(),
};

logger.info("Starting scan cycle", logContext);

// Add operation-specific context
logger.info("Project processed", {
  ...logContext,
  projectId: project.name,
  operator: project.operator,
  status: "completed",
  rulePassed: 4,
  rulesFailed: 1,
});
```

## Testing Standards

### 1. Unit Testing

#### Test Structure

```javascript
// tests/unit/rules/M110.test.js
const M110Rule = require("../../../rules/M110");
const { createTestProject } = require("../../helpers/projectFactory");

describe("M110Rule", () => {
  let rule;

  beforeEach(() => {
    rule = new M110Rule();
  });

  describe("shouldRun", () => {
    test("should return true for projects with M110 operations", () => {
      const project = createTestProject({
        compoundJobs: new Map([["job1", { operations: [{ code: "M110" }] }]]),
      });

      expect(rule.shouldRun(project)).toBe(true);
    });

    test("should return false for projects without M110 operations", () => {
      const project = createTestProject({
        compoundJobs: new Map([["job1", { operations: [{ code: "G01" }] }]]),
      });

      expect(rule.shouldRun(project)).toBe(false);
    });
  });

  describe("execute", () => {
    test("should detect contour operations exceeding limits", () => {
      const project = createTestProject({
        compoundJobs: new Map([
          [
            "job1",
            {
              operations: [
                { code: "M110", type: "contour", depth: 15 }, // Exceeds 10mm limit
              ],
            },
          ],
        ]),
      });

      const result = rule.execute(project);

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].type).toBe("depth_exceeded");
      expect(result.violations[0].severity).toBe("error");
    });

    test("should pass for contour operations within limits", () => {
      const project = createTestProject({
        compoundJobs: new Map([
          [
            "job1",
            {
              operations: [{ code: "M110", type: "contour", depth: 8 }],
            },
          ],
        ]),
      });

      const result = rule.execute(project);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });
});
```

#### Test Helpers

```javascript
// tests/helpers/projectFactory.js
function createTestProject(overrides = {}) {
  const defaultProject = {
    name: "TEST_PROJECT",
    operator: "test.operator",
    machine: "TEST_MACHINE",
    position: "A",
    compoundJobs: new Map(),
    tools: new Map(),
    ...overrides,
  };

  return new Project(defaultProject.name, defaultProject);
}

function createTestCompoundJob(operations = []) {
  return {
    name: "TEST_JOB",
    operations,
    duration: 1000,
    tools: [],
  };
}

module.exports = {
  createTestProject,
  createTestCompoundJob,
};
```

### 2. Integration Testing

#### End-to-End Workflow Tests

```javascript
// tests/integration/scanning.test.js
const Executor = require("../../core/executor/Executor");
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
} = require("../helpers/testEnv");

describe("Scanning Integration", () => {
  let executor;
  let testDataPath;

  beforeAll(async () => {
    testDataPath = await setupTestEnvironment();
    executor = new Executor({
      basePath: testDataPath,
      scanIntervalMs: 1000, // Faster for testing
    });
  });

  afterAll(async () => {
    await cleanupTestEnvironment(testDataPath);
  });

  test("should discover and process all test projects", async () => {
    const results = await executor.runScanCycle();

    expect(results.projectsFound).toBeGreaterThan(0);
    expect(results.projectsProcessed).toBe(results.projectsFound);
    expect(results.errors).toHaveLength(0);
  });

  test("should generate result files for processed projects", async () => {
    await executor.runScanCycle();

    const resultFiles = await Results.findResultFiles(testDataPath);
    expect(resultFiles.length).toBeGreaterThan(0);

    // Verify result file structure
    const sampleResult = JSON.parse(fs.readFileSync(resultFiles[0]));
    expect(sampleResult).toHaveProperty("project");
    expect(sampleResult).toHaveProperty("summary");
    expect(sampleResult).toHaveProperty("rules");
  });
});
```

### 3. Performance Testing

#### Benchmark Tests

```javascript
// tests/performance/scanning.perf.js
const { performance } = require("perf_hooks");

describe("Performance Tests", () => {
  test("should complete scan cycle within acceptable time", async () => {
    const start = performance.now();

    await executor.runScanCycle();

    const duration = performance.now() - start;

    // Should complete within 30 seconds for test dataset
    expect(duration).toBeLessThan(30000);
  });

  test("should handle large project sets efficiently", async () => {
    const largeDataset = generateLargeTestDataset(100); // 100 projects

    const start = performance.now();
    await executor.processProjects(largeDataset);
    const duration = performance.now() - start;

    // Should process 100 projects in under 2 minutes
    expect(duration).toBeLessThan(120000);
  });
});
```

## Code Review Guidelines

### 1. Review Checklist

#### Functionality

- [ ] Code fulfills requirements as specified
- [ ] Edge cases are handled appropriately
- [ ] Error conditions are properly managed
- [ ] Performance implications are considered

#### Code Quality

- [ ] Code follows established style guidelines
- [ ] Functions have single responsibility
- [ ] Variable and function names are descriptive
- [ ] Comments explain "why" not "what"
- [ ] No code duplication without justification

#### Testing

- [ ] Unit tests cover main functionality
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Integration points are tested

#### Security

- [ ] Input validation is implemented
- [ ] File path traversal is prevented
- [ ] Sensitive data is not logged
- [ ] External dependencies are validated

### 2. Review Process

#### Pull Request Template

```markdown
## Description

Brief description of changes made

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is documented
- [ ] Tests are included
```

#### Review Comments Format

```javascript
// Good: Specific, actionable feedback
// Consider extracting this logic into a separate function for reusability
function processProject(project) {
  // Complex logic here...
}

// Good: Suggest alternative approach
// This could cause memory issues with large datasets.
// Consider using streaming or pagination.
const allProjects = loadAllProjects();

// Good: Point out potential issues
// This path could be vulnerable to directory traversal attacks.
// Validate the path before use.
const filePath = path.join(basePath, userInput);
```

## Development Workflow

### 1. Git Workflow

#### Branch Naming

```bash
# Feature branches
feature/rule-engine-optimization
feature/new-validation-rule
feature/api-endpoints

# Bug fixes
bugfix/scanner-recursive-issue
bugfix/rule-execution-error

# Hotfixes
hotfix/critical-security-patch
hotfix/production-crash-fix

# Releases
release/v1.1.0
release/v1.2.0
```

#### Commit Messages

```bash
# Format: type(scope): description

# Features
feat(rules): add new time limit validation rule
feat(api): implement project statistics endpoint

# Bug fixes
fix(scanner): resolve recursive directory traversal issue
fix(executor): handle null project data gracefully

# Documentation
docs(readme): update installation instructions
docs(api): add endpoint examples

# Refactoring
refactor(analyzer): extract rule validation logic
refactor(utils): simplify path manipulation functions

# Tests
test(rules): add unit tests for M110 rule
test(integration): add end-to-end scanning tests
```

### 2. Development Environment

#### Setup Script

```bash
# setup.sh
#!/bin/bash

echo "Setting up JSON Scanner development environment..."

# Install dependencies
npm install

# Create required directories
mkdir -p logs
mkdir -p test_data/test
mkdir -p docs

# Set up git hooks
cp scripts/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit

# Run initial tests
npm test

echo "Development environment ready!"
```

#### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
  echo "Linting failed. Please fix errors before committing."
  exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed. Please fix failing tests before committing."
  exit 1
fi

echo "Pre-commit checks passed!"
```

### 3. Package Scripts

```json
{
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "docs:generate": "jsdoc -r -d docs/api src/",
    "clean": "rm -rf logs/* test_data/test/*",
    "validate": "npm run lint && npm run test"
  }
}
```

## Documentation Standards

### 1. Code Documentation

#### JSDoc Standards

```javascript
/**
 * Analyzes project against all applicable rules
 *
 * @async
 * @param {Project} project - Project instance to analyze
 * @param {Object} [options={}] - Analysis options
 * @param {string[]} [options.rules] - Specific rules to run
 * @param {boolean} [options.stopOnFirstFailure=false] - Stop on first failure
 * @returns {Promise<AnalysisResult>} Complete analysis results
 * @throws {ValidationError} When project data is invalid
 * @throws {ProcessingError} When analysis fails
 *
 * @example
 * const analyzer = new Analyzer();
 * const project = new Project(projectData);
 *
 * try {
 *   const results = await analyzer.analyzeProject(project, {
 *     rules: ['M110', 'TimeLimits'],
 *     stopOnFirstFailure: true
 *   });
 *   console.log(results.summary);
 * } catch (error) {
 *   console.error('Analysis failed:', error.message);
 * }
 */
async analyzeProject(project, options = {}) {
  // Implementation
}
```

### 2. README Standards

#### Module README Template

````markdown
# Module Name

Brief description of module purpose and functionality.

## Installation

```bash
npm install
```
````

## Usage

```javascript
const ModuleName = require("./ModuleName");

const instance = new ModuleName(config);
const result = instance.method(parameters);
```

## API Reference

### Constructor

### Methods

### Properties

## Examples

## Testing

## Contributing

## License

````

## Performance Guidelines

### 1. Memory Management

```javascript
// Good: Process one at a time for large datasets
async function processProjects(projects) {
  for (const project of projects) {
    await processProject(project);
    // Allow garbage collection between projects
  }
}

// Avoid: Loading everything into memory
// const allData = projects.map(p => loadProjectData(p));

// Good: Use streaming for large files
function processLargeFile(filePath) {
  const stream = fs.createReadStream(filePath);
  stream.on('data', chunk => {
    // Process chunk
  });
}
````

### 2. I/O Optimization

```javascript
// Good: Batch file operations
const results = await Promise.allSettled([
  fs.promises.readFile(file1),
  fs.promises.readFile(file2),
  fs.promises.readFile(file3),
]);

// Good: Cache frequently accessed data
class ProjectCache {
  constructor() {
    this.cache = new Map();
  }

  getProject(projectId) {
    if (!this.cache.has(projectId)) {
      this.cache.set(projectId, this.loadProject(projectId));
    }
    return this.cache.get(projectId);
  }
}
```

These guidelines ensure consistent, maintainable, and high-quality code across the JSON Scanner system.
