# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is the JSON Scanner system?

**A:** The JSON Scanner is an automated quality control system for manufacturing environments. It continuously monitors directories containing CAD project files (JSON format) and analyzes them against configurable quality control rules. The system helps ensure manufacturing operations meet safety and quality standards by automatically detecting potential issues in machining operations.

### Q: Who should use this system?

**A:** The system is designed for:
- Manufacturing engineers
- Quality control supervisors  
- CAD/CAM operators
- Production managers
- CNC programming teams

### Q: What types of quality checks does it perform?

**A:** The system includes several built-in rules:
- **Time Limits**: Ensure operations don't exceed safe time thresholds
- **Tool Validation**: Check for proper tool usage and reconditioning
- **M110 Operations**: Validate contour and helical drilling parameters
- **Auto-Correction**: Verify plane and contour corrections
- **Process Validation**: Ensure single tool per NC file compliance

## Installation & Setup

### Q: What are the system requirements?

**A:** Minimum requirements:
- Windows 10 or higher
- Node.js 14.x or higher
- 2GB RAM
- 10GB disk space
- Network access to CAD file locations

Recommended for production:
- Windows Server 2019+
- Node.js 18 LTS
- 4GB RAM
- 50GB disk space (for logs/results)
- SSD storage

### Q: How do I install the system?

**A:** Follow these steps:
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Clone the repository: `git clone [repository-url]`
3. Run `npm install` to install dependencies
4. Configure `config/Settings.js` with your paths
5. Run `npm start` to begin scanning

See our [Quick Start Guide](QUICKSTART.md) for detailed instructions.

### Q: Can I run this on Linux or Mac?

**A:** The system is primarily designed for Windows environments where manufacturing CAD systems typically run. While the Node.js application could potentially run on Linux/Mac, file path handling and network drive access are optimized for Windows. For production use, we recommend Windows Server.

### Q: How do I configure the scan paths?

**A:** Edit the `config/Settings.js` file:

```javascript
paths: {
  productionDataPath: "\\\\server\\manufacturing\\projects",
  testDataPath: "./data/test"
}
```

Use UNC paths (`\\server\share`) for network drives or local paths (`C:\local\path`) for local directories.

## Operation & Usage

### Q: How often does the system scan for new projects?

**A:** By default, the system scans every 60 seconds. You can adjust this in the configuration:

```javascript
app: {
  scanIntervalMs: 60000  // 60 seconds
}
```

For high-volume environments, you might increase this to 120000 (2 minutes) or more.

### Q: What happens when a new project is found?

**A:** When the scanner finds a new JSON project file:
1. Loads and validates the project data
2. Determines which quality rules apply
3. Executes all applicable rules
4. Generates a `result.json` file with analysis results
5. Logs the processing status and any issues found

### Q: Where are the results stored?

**A:** Results are stored in `result.json` files alongside the original project files:

```
Projects/
  W5270NS01003/
    W5270NS01003A/
      W5270NS01003A.json    ← Original project
      result.json           ← Analysis results
```

### Q: How do I know if the system is working?

**A:** Check these indicators:
- **Logs**: Active logging in `logs/app-YYYY-MM-DD.log`
- **Console Output**: Real-time status if running in terminal
- **Result Files**: New `result.json` files being created
- **Health Check**: HTTP endpoint at `http://localhost:3001/health` (if enabled)

### Q: What does a "passed" vs "failed" result mean?

**A:** 
- **Passed**: All applicable quality rules passed without violations
- **Failed**: One or more quality rules found violations that need attention
- **Warning**: Non-critical issues detected that should be reviewed

Each rule can also report "not applicable" if it doesn't apply to the specific project.

## Rules & Configuration

### Q: How do I add custom quality rules?

**A:** Create a new JavaScript file in the `rules/` directory:

```javascript
// rules/MyCustomRule.js
module.exports = {
  name: 'MyCustomRule',
  description: 'Custom quality check description',
  
  shouldRun: function(project) {
    // Return true if rule applies to this project
    return project.machine.includes('DMU');
  },
  
  execute: function(project, compoundJobs, tools) {
    // Your validation logic here
    return {
      passed: true,
      violations: []
    };
  }
};
```

The system automatically discovers and loads new rules on restart.

### Q: Can I disable specific rules?

**A:** Yes, modify the rule's `shouldRun` method to return `false`:

```javascript
shouldRun: function(project) {
  return false; // This rule will never run
}
```

Or add conditional logic to disable for specific conditions.

### Q: How do I adjust rule parameters?

**A:** Rule parameters are typically hardcoded in the rule files. For example, in `TimeLimits.js`:

```javascript
const MAX_GUNDRILL_MINUTES = 60; // Change this value
```

Future versions will support external rule configuration files.

### Q: What information is available to rules?

**A:** Rules have access to:
- **Project data**: operator, machine, position, etc.
- **Compound jobs**: NC file operations and commands
- **Tools**: Tool definitions and parameters
- **File paths**: Original file locations

## Troubleshooting

### Q: The system says "No projects found" - what's wrong?

**A:** Check these common issues:
1. **Path configuration**: Verify the scan path in `config/Settings.js`
2. **File permissions**: Ensure the application can read the directories
3. **Network connectivity**: Test access to network drives
4. **File format**: Ensure JSON files are valid and contain expected structure

### Q: Why are some projects being skipped?

**A:** Projects may be skipped if:
- They don't contain valid JSON structure
- Required fields (operator, machine, etc.) are missing
- The JSON file is corrupted or unreadable
- File permissions prevent access

Check the logs for specific error messages about skipped projects.

### Q: The system is using too much memory - how do I fix this?

**A:** Try these solutions:
1. **Increase scan interval**: Process fewer projects simultaneously
2. **Reduce concurrent processing**: Limit parallel operations
3. **Clean up old logs**: Remove large log files
4. **Restart periodically**: Schedule regular service restarts

For production environments, monitor memory usage and consider upgrading hardware.

### Q: How do I enable debug logging?

**A:** Change the log level in configuration:

```javascript
app: {
  logLevel: "debug"  // Shows detailed execution information
}
```

Debug logs show rule execution details, file processing steps, and performance timing.

### Q: Results aren't being saved - what's wrong?

**A:** Check these issues:
1. **Write permissions**: Ensure the application can write to result directories
2. **Disk space**: Verify sufficient disk space is available
3. **Path validity**: Check that result paths are valid and accessible
4. **File locks**: Ensure no other processes are locking the directories

## Performance & Scaling

### Q: How many projects can the system handle?

**A:** Performance depends on:
- **Project complexity**: Number of operations and tools
- **Rule complexity**: Computational requirements of quality checks
- **Hardware**: CPU, memory, and storage performance
- **Network speed**: If accessing files over network

Typical performance: 50-100 projects per minute on standard hardware.

### Q: Can I run multiple instances?

**A:** For high-volume environments, you can run multiple instances with different scan paths or use database-backed coordination (future feature). Ensure each instance scans different directories to avoid conflicts.

### Q: How do I optimize performance?

**A:** Consider these optimizations:
1. **Increase scan intervals** for high-volume environments
2. **Use local storage** instead of network drives when possible
3. **Implement result caching** for unchanged projects
4. **Use SSD storage** for better I/O performance
5. **Monitor and tune** rule execution performance

## Integration & Development

### Q: Can I integrate this with other systems?

**A:** Yes, several integration options:
- **File-based**: Monitor result.json files from external systems
- **HTTP API**: Future versions will include REST API
- **Database**: Future versions will support database backends
- **Custom rules**: Add rules that interface with external systems

### Q: How do I backup the system?

**A:** Backup these components:
- **Configuration files**: `config/` directory
- **Custom rules**: Any rules you've added in `rules/`
- **Logs**: `logs/` directory for historical data
- **Results**: Result files if centrally stored

The application code can be restored from the repository.

### Q: Is there a web interface?

**A:** Not currently, but it's planned for future versions. The current system is designed to work automatically in the background. Results can be viewed by examining the generated JSON files or building custom dashboard tools.

### Q: How do I update the system?

**A:** For updates:
1. **Stop the service** if running as a service
2. **Backup configuration** and custom rules
3. **Pull latest code** from repository
4. **Run npm install** to update dependencies
5. **Restore configuration** and custom rules
6. **Restart the service**

Always test updates in a development environment first.

## Security & Compliance

### Q: What security considerations should I be aware of?

**A:** Key security aspects:
- **File access**: System needs read access to project directories
- **Network drives**: Secure network authentication may be required
- **Service account**: Run with minimal required permissions
- **Logging**: May contain sensitive project information
- **Results**: Protect result files from unauthorized access

### Q: Does the system modify original files?

**A:** No, the system only reads original project files and creates separate `result.json` files. Original project data is never modified.

### Q: How is sensitive data handled?

**A:** The system:
- Only processes manufacturing/technical data
- Does not collect personal information
- Stores results locally (no external transmission)
- Can be configured to exclude sensitive file contents from logs

## Support & Maintenance

### Q: How do I get support?

**A:** Support resources:
- **Documentation**: Comprehensive guides in `/docs` directory
- **Logs**: Check application logs for detailed error information
- **Community**: Create issues in the project repository
- **Professional**: Contact your system administrator or development team

### Q: How often should I maintain the system?

**A:** Regular maintenance tasks:
- **Weekly**: Review logs for errors or performance issues
- **Monthly**: Clean up old log files and results
- **Quarterly**: Review and update quality rules as needed
- **Annually**: Update Node.js and dependencies

### Q: What logs should I monitor?

**A:** Key log patterns to watch:
- **ERROR**: Critical failures requiring immediate attention
- **WARN**: Potential issues that should be investigated
- **High processing times**: May indicate performance problems
- **Repeated failures**: Systematic issues with specific projects or rules

### Q: How do I report a bug?

**A:** When reporting issues, include:
- **System information**: OS, Node.js version, application version
- **Configuration**: Relevant configuration settings (sanitized)
- **Log excerpts**: Error messages and surrounding context
- **Steps to reproduce**: How to trigger the issue
- **Expected vs actual behavior**: What should happen vs what happens

This helps developers quickly understand and resolve issues.