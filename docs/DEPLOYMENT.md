# Deployment Guide

## Overview

This guide covers deployment strategies for the JSON Scanner system across different environments (development, staging, production) and platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Installation](#installation)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Windows Service Deployment](#windows-service-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum Requirements:**

- Node.js 14.x or higher
- Windows 10/Server 2016 or higher
- 2GB RAM
- 10GB available disk space
- Network access to CAD file locations

**Recommended Requirements:**

- Node.js 18.x LTS
- Windows 11/Server 2022
- 4GB RAM
- 50GB available disk space (for logs and results)
- SSD storage for better I/O performance

### Software Dependencies

```bash
# Node.js (Download from nodejs.org)
node --version  # Should be 14.x or higher
npm --version   # Should be 6.x or higher

# Git (for deployment from repository)
git --version

# Optional: PM2 for process management
npm install -g pm2
```

### Network Requirements

- Read access to network drives containing CAD files
- Write access to result storage location
- Optional: Database connectivity (for future versions)
- Optional: External API access (for monitoring services)

## Environment Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Application Environment
NODE_ENV=production
LOG_LEVEL=info

# Scanning Configuration
SCAN_INTERVAL_MS=60000
SCAN_PATH=D:\Manufacturing\Projects
RECURSIVE_SCAN=true
AUTO_SCAN_ENABLED=true

# Logging Configuration
LOG_FILE=./logs/json-scanner.log
LOG_MAX_SIZE=10mb
LOG_MAX_FILES=5

# Performance Settings
MAX_CONCURRENT_PROJECTS=4
PROCESSING_TIMEOUT=300000

# Monitoring (Optional)
HEALTH_CHECK_PORT=3001
METRICS_ENABLED=true

# Future API Configuration
API_PORT=3000
API_RATE_LIMIT=1000
```

### Configuration by Environment

#### Development

```bash
NODE_ENV=development
LOG_LEVEL=debug
SCAN_INTERVAL_MS=10000
SCAN_PATH=./test_data/testPathHumming_auto
AUTO_SCAN_ENABLED=true
```

#### Staging

```bash
NODE_ENV=staging
LOG_LEVEL=info
SCAN_INTERVAL_MS=30000
SCAN_PATH=\\staging-server\projects
AUTO_SCAN_ENABLED=true
HEALTH_CHECK_PORT=3001
```

#### Production

```bash
NODE_ENV=production
LOG_LEVEL=warn
SCAN_INTERVAL_MS=60000
SCAN_PATH=\\production-server\projects
AUTO_SCAN_ENABLED=true
HEALTH_CHECK_PORT=3001
METRICS_ENABLED=true
```

## Installation

### Standard Installation

```powershell
# 1. Clone repository
git clone https://github.com/company/json-scanner.git
cd json-scanner

# 2. Install dependencies
npm install --production

# 3. Create required directories
New-Item -ItemType Directory -Force -Path logs
New-Item -ItemType Directory -Force -Path data

# 4. Copy environment configuration
Copy-Item .env.example .env
# Edit .env with your specific settings

# 5. Validate installation
npm run validate

# 6. Test configuration
npm run test:config
```

### Automated Installation Script

```powershell
# install.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$InstallPath,

    [Parameter(Mandatory=$true)]
    [string]$ScanPath,

    [string]$Environment = "production"
)

Write-Host "Installing JSON Scanner to: $InstallPath"

# Create installation directory
New-Item -ItemType Directory -Force -Path $InstallPath

# Clone repository
Set-Location $InstallPath
git clone https://github.com/company/json-scanner.git .

# Install dependencies
npm install --production

# Create directories
New-Item -ItemType Directory -Force -Path logs
New-Item -ItemType Directory -Force -Path data

# Configure environment
@"
NODE_ENV=$Environment
SCAN_PATH=$ScanPath
SCAN_INTERVAL_MS=60000
LOG_FILE=$InstallPath\logs\json-scanner.log
"@ | Out-File -FilePath .env -Encoding UTF8

Write-Host "Installation completed successfully!"
Write-Host "Start the service with: npm start"
```

## Production Deployment

### Option 1: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Create PM2 ecosystem file
```

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [
    {
      name: "json-scanner",
      script: "./main.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        SCAN_INTERVAL_MS: 60000,
        LOG_LEVEL: "info",
      },
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

```bash
# Deploy with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Monitor the application
pm2 monit

# View logs
pm2 logs json-scanner

# Restart application
pm2 restart json-scanner

# Stop application
pm2 stop json-scanner
```

### Option 2: Node.js Service Wrapper

**service.js:**

```javascript
const Service = require("node-windows").Service;

// Create a new service object
const svc = new Service({
  name: "JSON Scanner Service",
  description: "Manufacturing Quality Control JSON Scanner",
  script: require("path").join(__dirname, "main.js"),
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
  env: {
    name: "NODE_ENV",
    value: "production",
  },
});

// Listen for the "install" event
svc.on("install", function () {
  svc.start();
});

// Install the service
svc.install();
```

```powershell
# Install as Windows service
node service.js

# Service management commands
sc start "JSON Scanner Service"
sc stop "JSON Scanner Service"
sc delete "JSON Scanner Service"
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S scanner -u 1001

# Create required directories
RUN mkdir -p logs data && chown -R scanner:nodejs logs data

# Switch to non-root user
USER scanner

# Expose health check port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
CMD ["npm", "start"]
```

### Docker Compose

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  json-scanner:
    build: .
    container_name: json-scanner
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - SCAN_INTERVAL_MS=60000
      - LOG_LEVEL=info
    volumes:
      - ./config:/app/config:ro
      - ./logs:/app/logs
      - ./data:/app/data
      - /network/projects:/scan/projects:ro
    ports:
      - "3001:3001"
    networks:
      - json-scanner-network

  # Optional: Log aggregation
  fluentd:
    image: fluentd:v1.14
    container_name: json-scanner-logs
    volumes:
      - ./fluentd:/fluentd/etc
      - ./logs:/var/log/json-scanner
    networks:
      - json-scanner-network

networks:
  json-scanner-network:
    driver: bridge
```

### Docker Deployment Commands

```bash
# Build image
docker build -t json-scanner:latest .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f json-scanner

# Scale (if needed)
docker-compose up -d --scale json-scanner=2

# Update deployment
docker-compose pull
docker-compose up -d

# Stop deployment
docker-compose down
```

## Windows Service Deployment

### Using NSSM (Non-Sucking Service Manager)

```powershell
# Download NSSM from nssm.cc

# Install service
nssm install "JSON Scanner" "C:\Program Files\nodejs\node.exe"
nssm set "JSON Scanner" AppParameters "C:\path\to\json-scanner\main.js"
nssm set "JSON Scanner" AppDirectory "C:\path\to\json-scanner"

# Configure service
nssm set "JSON Scanner" Description "Manufacturing Quality Control Scanner"
nssm set "JSON Scanner" DisplayName "JSON Scanner Service"
nssm set "JSON Scanner" Start SERVICE_AUTO_START

# Configure logging
nssm set "JSON Scanner" AppStdout "C:\path\to\json-scanner\logs\service-stdout.log"
nssm set "JSON Scanner" AppStderr "C:\path\to\json-scanner\logs\service-stderr.log"

# Configure restart behavior
nssm set "JSON Scanner" AppRestartDelay 5000
nssm set "JSON Scanner" AppThrottle 1500

# Start service
nssm start "JSON Scanner"

# Service management
nssm status "JSON Scanner"
nssm stop "JSON Scanner"
nssm restart "JSON Scanner"
nssm remove "JSON Scanner"
```

### PowerShell Service Installation Script

```powershell
# install-service.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$ServicePath,

    [string]$ServiceName = "JSON Scanner",
    [string]$ServiceDescription = "Manufacturing Quality Control JSON Scanner"
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

# Check if Node.js is installed
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Error "Node.js is not installed or not in PATH"
    exit 1
}

# Install NSSM if not present
$nssmPath = "$env:ProgramFiles\nssm\win64\nssm.exe"
if (-not (Test-Path $nssmPath)) {
    Write-Host "Installing NSSM..."
    # Download and install NSSM
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile "nssm.zip"
    Expand-Archive "nssm.zip" -DestinationPath "$env:ProgramFiles\nssm"
    Remove-Item "nssm.zip"
}

# Install service
& $nssmPath install $ServiceName $nodePath.Source
& $nssmPath set $ServiceName AppParameters "$ServicePath\main.js"
& $nssmPath set $ServiceName AppDirectory $ServicePath
& $nssmPath set $ServiceName Description $ServiceDescription
& $nssmPath set $ServiceName Start SERVICE_AUTO_START

# Configure logging
& $nssmPath set $ServiceName AppStdout "$ServicePath\logs\service-stdout.log"
& $nssmPath set $ServiceName AppStderr "$ServicePath\logs\service-stderr.log"

# Start service
& $nssmPath start $ServiceName

Write-Host "Service '$ServiceName' installed and started successfully!"
```

## Monitoring and Maintenance

### Health Monitoring

**health.js:**

```javascript
const http = require("http");
const fs = require("fs");

class HealthMonitor {
  constructor(port = 3001) {
    this.port = port;
    this.server = null;
  }

  start() {
    this.server = http.createServer((req, res) => {
      if (req.url === "/health") {
        this.handleHealthCheck(req, res);
      } else if (req.url === "/metrics") {
        this.handleMetrics(req, res);
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    });

    this.server.listen(this.port, () => {
      console.log(`Health monitor listening on port ${this.port}`);
    });
  }

  handleHealthCheck(req, res) {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: require("./package.json").version,
    };

    // Check disk space
    try {
      const stats = fs.statSync("./logs");
      health.diskAccess = "ok";
    } catch (error) {
      health.status = "unhealthy";
      health.diskAccess = "error";
    }

    const statusCode = health.status === "healthy" ? 200 : 503;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(health, null, 2));
  }

  handleMetrics(req, res) {
    const metrics = {
      // Application metrics would go here
      projectsProcessed: this.getProjectCount(),
      lastScanTime: this.getLastScanTime(),
      errorCount: this.getErrorCount(),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(metrics, null, 2));
  }
}

module.exports = HealthMonitor;
```

### Log Rotation

**logrotate.conf:**

```bash
# Windows equivalent using PowerShell scheduled task
# Create-ScheduledTask for log rotation

# logrotate.ps1
$LogPath = "C:\path\to\json-scanner\logs"
$MaxSize = 50MB
$MaxFiles = 10

Get-ChildItem $LogPath -Filter "*.log" | ForEach-Object {
    if ($_.Length -gt $MaxSize) {
        # Archive old log
        $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
        $archiveName = "$($_.BaseName)_$timestamp$($_.Extension)"
        Move-Item $_.FullName "$LogPath\archive\$archiveName"

        # Create new log file
        New-Item -Path $_.FullName -ItemType File
    }
}

# Clean old archives
Get-ChildItem "$LogPath\archive" | Sort-Object CreationTime -Descending | Select-Object -Skip $MaxFiles | Remove-Item
```

### Backup Strategy

```powershell
# backup.ps1
param(
    [string]$SourcePath = "C:\json-scanner",
    [string]$BackupPath = "\\backup-server\json-scanner-backups"
)

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "$BackupPath\backup-$timestamp"

# Create backup directory
New-Item -ItemType Directory -Force -Path $backupDir

# Backup configuration and logs (exclude node_modules)
robocopy $SourcePath $backupDir /E /XD node_modules data\test /XF *.tmp

# Compress backup
Compress-Archive -Path $backupDir -DestinationPath "$backupDir.zip"
Remove-Item -Recurse -Force $backupDir

# Clean old backups (keep 30 days)
Get-ChildItem $BackupPath -Filter "backup-*.zip" | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-30) } | Remove-Item
```

## Troubleshooting

### Common Issues

#### Issue: Service Won't Start

```powershell
# Check Node.js version
node --version

# Check permissions
icacls "C:\path\to\json-scanner" /grant "SERVICE_ACCOUNT:(OI)(CI)F"

# Check environment variables
Get-ChildItem Env: | Where-Object { $_.Name -like "*NODE*" }

# View service logs
Get-EventLog -LogName Application -Source "JSON Scanner" -Newest 50
```

#### Issue: High Memory Usage

```javascript
// Add memory monitoring to main.js
setInterval(() => {
  const usage = process.memoryUsage();
  if (usage.heapUsed > 500 * 1024 * 1024) {
    // 500MB
    console.warn("High memory usage detected:", usage);
    // Consider garbage collection or restart
  }
}, 60000);
```

#### Issue: Scanning Not Working

```powershell
# Check file permissions
Get-Acl "\\network\path\to\projects"

# Test network connectivity
Test-NetConnection -ComputerName "network-server" -Port 445

# Check scan path in logs
Select-String -Path ".\logs\json-scanner.log" -Pattern "scan"
```

### Performance Tuning

```javascript
// main.js - Add performance monitoring
const config = {
  // Increase Node.js memory limit for large datasets
  maxOldSpaceSize: 4096, // 4GB

  // Optimize garbage collection
  gcInterval: 300000, // 5 minutes

  // Limit concurrent operations
  maxConcurrentProjects: 4,

  // Adjust scan frequency based on load
  adaptiveScanInterval: true,
};
```

### Log Analysis Commands

```powershell
# Find errors in logs
Select-String -Path ".\logs\*.log" -Pattern "ERROR|WARN" | Select-Object -Last 50

# Analyze scan performance
Select-String -Path ".\logs\*.log" -Pattern "Scan cycle completed" | ForEach-Object {
    $line = $_.Line
    # Extract timing information
    if ($line -match "duration: (\d+)") {
        $duration = $matches[1]
        Write-Output "Duration: $duration ms"
    }
}

# Monitor memory usage
Select-String -Path ".\logs\*.log" -Pattern "memory" | Select-Object -Last 20
```

### Emergency Procedures

#### Service Recovery

```powershell
# emergency-restart.ps1
$serviceName = "JSON Scanner"

# Stop service gracefully
Stop-Service $serviceName -Force

# Wait for processes to end
Start-Sleep -Seconds 10

# Clear any stuck processes
Get-Process -Name "node" | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force

# Restart service
Start-Service $serviceName

# Verify startup
Start-Sleep -Seconds 30
$status = Get-Service $serviceName
if ($status.Status -eq "Running") {
    Write-Host "Service restarted successfully"
} else {
    Write-Error "Service failed to restart"
}
```

This deployment guide provides comprehensive instructions for deploying the JSON Scanner system in various environments with proper monitoring and maintenance procedures.
