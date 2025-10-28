// debug.js - Debugging and log viewing utilities
const fs = require('fs');
const path = require('path');
const Logger = require('./utils/Logger');

function showLogFiles() {
  const logsDir = Logger.getLogsDirectory();
  
  if (!fs.existsSync(logsDir)) {
    console.log('📁 No logs directory found.');
    return;
  }
  
  const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
  
  if (logFiles.length === 0) {
    console.log('📝 No log files found.');
    return;
  }
  
  console.log('📝 Available log files:');
  logFiles.forEach((file, index) => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${index + 1}. ${file} (${Math.round(stats.size / 1024)}KB) - ${stats.mtime.toLocaleString()}`);
  });
}

function showLatestLogs(lines = 50) {
  const logFile = Logger.getLogFilePath();
  
  if (!fs.existsSync(logFile)) {
    console.log('📝 No log file found for today.');
    return;
  }
  
  const content = fs.readFileSync(logFile, 'utf8');
  const allLines = content.split('\n').filter(line => line.trim());
  const recentLines = allLines.slice(-lines);
  
  console.log(`📝 Last ${recentLines.length} log entries:`);
  console.log('═'.repeat(80));
  recentLines.forEach(line => console.log(line));
}

function clearLogs() {
  const logsDir = Logger.getLogsDirectory();
  
  if (!fs.existsSync(logsDir)) {
    console.log('📁 No logs directory found.');
    return;
  }
  
  const logFiles = fs.readdirSync(logsDir).filter(file => file.endsWith('.log'));
  
  logFiles.forEach(file => {
    fs.unlinkSync(path.join(logsDir, file));
  });
  
  console.log(`🗑️  Cleared ${logFiles.length} log files.`);
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'list':
    showLogFiles();
    break;
  case 'tail':
    const lines = parseInt(process.argv[3]) || 50;
    showLatestLogs(lines);
    break;
  case 'clear':
    clearLogs();
    break;
  case 'path':
    console.log('📁 Logs directory:', Logger.getLogsDirectory());
    console.log('📝 Today\'s log file:', Logger.getLogFilePath());
    break;
  default:
    console.log('🔍 Debug Utilities for JSON Scanner');
    console.log('');
    console.log('Usage:');
    console.log('  node debug.js list           - Show all log files');
    console.log('  node debug.js tail [lines]   - Show recent log entries (default: 50)');
    console.log('  node debug.js clear          - Clear all log files');
    console.log('  node debug.js path           - Show log file paths');
    console.log('');
    console.log('Examples:');
    console.log('  node debug.js tail 100       - Show last 100 log entries');
    console.log('  node debug.js list           - List all available log files');
}