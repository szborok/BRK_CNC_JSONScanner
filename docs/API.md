# API Documentation

## Overview

This document outlines the current data structures and future API design for the JSON Scanner system.

## Current Data Structures

### Project Object

```javascript
class Project {
  constructor(projectPath) {
    this.projectPath = string;      // Full path to project directory
    this.name = string;             // Project name (e.g., "W5270NS01003")
    this.position = string;         // Position letter (A, B, C, etc.)
    this.machine = string;          // Machine name
    this.operator = string;         // Operator name
    this.jsonFilePath = string;     // Path to source JSON file
    this.compoundJobs = Map;        // NC file operations
    this.tools = Map;               // Tool information
    this.analysisResults = Object;  // Rule execution results
    this.status = string;           // Processing status
    this.isValid = boolean;         // Validation flag
  }
}
```

### Analysis Results Structure

```javascript
{
  project: string,                    // Project identifier
  operator: string,                   // Operator name
  machine: string,                    // Machine type
  position: string,                   // Position (A/B/C)
  hypermillFilePath: string,          // CAD file reference
  summary: {
    overallStatus: string,            // "passed" | "failed" | "warning"
    totalRules: number,               // Total rules evaluated
    rulesRun: number,                 // Rules actually executed
    rulesPassed: number,              // Rules that passed
    rulesFailed: number,              // Rules that failed
    totalViolations: number           // Total violation count
  },
  rules: [
    {
      name: string,                   // Rule identifier
      description: string,            // Human-readable description
      shouldRun: boolean,             // Whether rule should execute
      run: boolean,                   // Whether rule was executed
      passed: boolean,                // Rule result
      failureType: string,            // "project" | "ncfile" | "tool"
      violationCount: number,         // Number of violations found
      failures: Array,                // Detailed failure information
      status: string                  // "passed" | "failed" | "not_applicable"
    }
  ],
  processedAt: string,                // ISO timestamp
  status: string                      // "completed" | "error" | "pending"
}
```

### Rule Interface

```javascript
module.exports = {
  name: string,                       // Unique rule identifier
  description: string,                // Rule description
  
  // Determines if rule should run for this project
  shouldRun: function(project) {
    return boolean;
  },
  
  // Main rule execution logic
  execute: function(project, compoundJobs, tools) {
    return {
      passed: boolean,                // Overall rule result
      violations: [                   // Array of specific violations
        {
          type: string,               // Violation category
          severity: string,           // "error" | "warning" | "info"
          message: string,            // Human-readable message
          context: Object,            // Additional context data
          location: string            // Where violation occurred
        }
      ]
    };
  }
};
```

## Future REST API Design

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```javascript
// Headers for all requests
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

### Endpoints

#### Projects

**GET /projects**
- Description: Get all projects with optional filtering
- Query Parameters:
  - `operator`: Filter by operator name
  - `machine`: Filter by machine type
  - `status`: Filter by processing status
  - `from`: Start date (ISO string)
  - `to`: End date (ISO string)
  - `limit`: Number of results (default: 100)
  - `offset`: Pagination offset (default: 0)

```javascript
// Response
{
  "data": [
    {
      "project": "W5270NS01001A",
      "operator": "szborok",
      "machine": "DMC 105 V Linear",
      "status": "completed",
      "processedAt": "2025-10-28T13:12:42.226Z",
      "summary": {
        "overallStatus": "passed",
        "rulesPassed": 4,
        "rulesFailed": 0
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

**GET /projects/:projectId**
- Description: Get detailed project information
- Parameters:
  - `projectId`: Project identifier (e.g., "W5270NS01001A")

```javascript
// Response
{
  "data": {
    // Full analysis results structure
  }
}
```

**POST /projects/:projectId/reprocess**
- Description: Trigger manual reprocessing of a project
- Parameters:
  - `projectId`: Project identifier

```javascript
// Request body
{
  "force": true,      // Force reprocess even if already processed
  "rules": ["all"]    // Specific rules to run, or "all"
}

// Response
{
  "message": "Project queued for reprocessing",
  "jobId": "uuid-here"
}
```

#### Rules

**GET /rules**
- Description: Get all available rules and their configuration

```javascript
// Response
{
  "data": [
    {
      "name": "GunDrill60MinLimit",
      "description": "Gundrill tools should not exceed 60 minutes per NC file",
      "category": "time_limits",
      "enabled": true,
      "configurable": true,
      "parameters": {
        "maxMinutes": 60
      }
    }
  ]
}
```

**GET /rules/:ruleName/statistics**
- Description: Get rule execution statistics

```javascript
// Response
{
  "data": {
    "ruleName": "GunDrill60MinLimit",
    "totalExecutions": 1250,
    "passRate": 0.94,
    "failureRate": 0.06,
    "avgExecutionTime": 45.2,
    "lastFailures": [
      {
        "project": "W5270NS01002B",
        "timestamp": "2025-10-28T10:30:00Z",
        "violationCount": 2
      }
    ]
  }
}
```

#### Analytics

**GET /analytics/summary**
- Description: Get overall system statistics

```javascript
// Response
{
  "data": {
    "totalProjects": 1250,
    "processedToday": 45,
    "overallPassRate": 0.87,
    "topFailingRules": [
      {
        "rule": "M110Contour",
        "failureCount": 23,
        "failureRate": 0.15
      }
    ],
    "machineStats": {
      "DMC 105 V Linear": {
        "projectCount": 450,
        "passRate": 0.92
      }
    }
  }
}
```

**GET /analytics/trends**
- Description: Get processing trends over time

```javascript
// Query Parameters
{
  "period": "week",     // "day" | "week" | "month"
  "metric": "passRate"  // "passRate" | "volume" | "failures"
}

// Response
{
  "data": {
    "period": "week",
    "dataPoints": [
      {
        "date": "2025-10-21",
        "value": 0.89
      },
      {
        "date": "2025-10-22", 
        "value": 0.91
      }
    ]
  }
}
```

#### System

**GET /system/status**
- Description: Get system health and status

```javascript
// Response
{
  "data": {
    "status": "healthy",
    "uptime": 86400,
    "lastScan": "2025-10-28T13:15:00Z",
    "nextScan": "2025-10-28T13:16:00Z",
    "scanInterval": 60000,
    "activeProjects": 9,
    "processingQueue": 0,
    "version": "1.0.0"
  }
}
```

**POST /system/scan**
- Description: Trigger manual scan cycle

```javascript
// Request body
{
  "path": "/custom/scan/path",  // Optional custom path
  "operator": "john.doe"        // Optional operator filter
}

// Response
{
  "message": "Scan initiated",
  "scanId": "uuid-here"
}
```

#### Users (Future)

**GET /users/:userId/projects**
- Description: Get projects for specific user

**GET /users/:userId/dashboard**
- Description: Get user-specific dashboard data

## Error Responses

All API endpoints return consistent error responses:

```javascript
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project W5270NS01001X not found",
    "details": {
      "projectId": "W5270NS01001X",
      "availableProjects": ["W5270NS01001A", "W5270NS01001B"]
    }
  }
}
```

### Error Codes

- `PROJECT_NOT_FOUND`: Requested project doesn't exist
- `INVALID_RULE`: Rule name not recognized
- `PROCESSING_ERROR`: Error during project processing
- `VALIDATION_ERROR`: Request validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing credentials
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SYSTEM_UNAVAILABLE`: System maintenance or overload

## WebSocket Events (Future)

For real-time updates:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Event types
{
  "type": "scan_started",
  "data": {
    "scanId": "uuid",
    "timestamp": "2025-10-28T13:15:00Z"
  }
}

{
  "type": "project_processed",
  "data": {
    "project": "W5270NS01001A",
    "status": "completed",
    "summary": { /* summary data */ }
  }
}

{
  "type": "scan_completed", 
  "data": {
    "scanId": "uuid",
    "duration": 1250,
    "projectsProcessed": 9
  }
}
```

## Rate Limiting

```javascript
// Response headers
{
  "X-RateLimit-Limit": "1000",
  "X-RateLimit-Remaining": "999", 
  "X-RateLimit-Reset": "1635724800"
}
```

## Pagination

All list endpoints support cursor-based pagination:

```javascript
// Request
GET /projects?limit=50&cursor=eyJpZCI6MTIzfQ

// Response
{
  "data": [...],
  "pagination": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6MTczfQ",
    "limit": 50
  }
}
```