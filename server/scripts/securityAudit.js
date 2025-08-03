const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Security audit and vulnerability assessment script
class SecurityAuditor {
  constructor() {
    this.auditResults = {
      timestamp: new Date().toISOString(),
      vulnerabilities: [],
      recommendations: [],
      score: 0,
      categories: {
        authentication: { score: 0, issues: [] },
        authorization: { score: 0, issues: [] },
        dataProtection: { score: 0, issues: [] },
        inputValidation: { score: 0, issues: [] },
        configuration: { score: 0, issues: [] },
        dependencies: { score: 0, issues: [] },
        logging: { score: 0, issues: [] }
      }
    };
  }

  async runAudit() {
    console.log('🔒 Starting Security Audit...');
    console.log('='.repeat(60));
    
    try {
      // Run all security checks
      await this.checkEnvironmentVariables();
      await this.checkFilePermissions();
      await this.checkDependencies();
      await this.checkDatabaseSecurity();
      await this.checkAuthenticationSecurity();
      await this.checkInputValidation();
      await this.checkLoggingSecurity();
      await this.checkServerConfiguration();
      await this.checkCryptographicSecurity();
      
      // Calculate overall score
      this.calculateSecurityScore();
      
      // Generate report
      await this.generateSecurityReport();
      
      console.log('\n🎉 Security audit completed!');
      console.log(`\n📊 Overall Security Score: ${this.auditResults.score}/100`);
      
      if (this.auditResults.score < 70) {
        console.log('⚠️ Security score is below recommended threshold (70)');
      } else if (this.auditResults.score >= 90) {
        console.log('✅ Excellent security posture!');
      } else {
        console.log('👍 Good security posture with room for improvement');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Security audit failed:', error.message);
      return false;
    }
  }

  async checkEnvironmentVariables() {
    console.log('\n🔍 Checking environment variables...');
    
    const requiredEnvVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'NODE_ENV',
      'BCRYPT_ROUNDS'
    ];
    
    const sensitiveEnvVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'REDIS_PASSWORD',
      'EMAIL_PASSWORD'
    ];
    
    // Check for missing required variables
    requiredEnvVars.forEach(varName => {
      if (!process.env[varName]) {
        this.addVulnerability('configuration', 'high', 
          `Missing required environment variable: ${varName}`);
      }
    });
    
    // Check JWT secret strength
    if (process.env.JWT_SECRET) {
      if (process.env.JWT_SECRET.length < 32) {
        this.addVulnerability('authentication', 'high', 
          'JWT_SECRET is too short (should be at least 32 characters)');
      }
      
      if (!/[A-Z]/.test(process.env.JWT_SECRET) || 
          !/[a-z]/.test(process.env.JWT_SECRET) || 
          !/[0-9]/.test(process.env.JWT_SECRET)) {
        this.addVulnerability('authentication', 'medium', 
          'JWT_SECRET should contain uppercase, lowercase, and numbers');
      }
    }
    
    // Check for default/weak values
    const weakSecrets = ['secret', 'password', '123456', 'admin', 'test'];
    sensitiveEnvVars.forEach(varName => {
      const value = process.env[varName];
      if (value && weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
        this.addVulnerability('configuration', 'critical', 
          `Weak/default value detected for ${varName}`);
      }
    });
    
    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
      this.addVulnerability('configuration', 'medium', 
        'NODE_ENV should be set to either "production" or "development"');
    }
    
    console.log('✅ Environment variables check completed');
  }

  async checkFilePermissions() {
    console.log('\n🔍 Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      '.env.production',
      '.env.local',
      'server.js',
      'ecosystem.config.js'
    ];
    
    for (const fileName of sensitiveFiles) {
      const filePath = path.join(process.cwd(), fileName);
      
      if (fs.existsSync(filePath)) {
        try {
          const stats = fs.statSync(filePath);
          const mode = stats.mode;
          
          // Check if file is readable by others (on Unix systems)
          if (process.platform !== 'win32') {
            if (mode & parseInt('044', 8)) {
              this.addVulnerability('configuration', 'medium', 
                `File ${fileName} is readable by others`);
            }
            
            if (mode & parseInt('022', 8)) {
              this.addVulnerability('configuration', 'high', 
                `File ${fileName} is writable by group/others`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Could not check permissions for ${fileName}`);
        }
      }
    }
    
    console.log('✅ File permissions check completed');
  }

  async checkDependencies() {
    console.log('\n🔍 Checking dependencies...');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check for known vulnerable packages
        const vulnerablePackages = {
          'lodash': '< 4.17.21',
          'moment': '< 2.29.4',
          'axios': '< 0.21.2',
          'express': '< 4.17.3',
          'mongoose': '< 6.0.0'
        };
        
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        Object.entries(vulnerablePackages).forEach(([pkg, minVersion]) => {
          if (allDeps[pkg]) {
            this.addVulnerability('dependencies', 'medium', 
              `Package ${pkg} may be outdated. Ensure version is ${minVersion} or higher`);
          }
        });
        
        // Check for excessive dependencies
        const totalDeps = Object.keys(allDeps).length;
        if (totalDeps > 100) {
          this.addVulnerability('dependencies', 'low', 
            `High number of dependencies (${totalDeps}). Consider reducing attack surface`);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not analyze package.json');
    }
    
    console.log('✅ Dependencies check completed');
  }

  async checkDatabaseSecurity() {
    console.log('\n🔍 Checking database security...');
    
    // Check MongoDB URI
    const mongoUri = process.env.MONGODB_URI;
    if (mongoUri) {
      // Check for authentication
      if (!mongoUri.includes('@') && !mongoUri.includes('localhost')) {
        this.addVulnerability('dataProtection', 'critical', 
          'MongoDB URI appears to lack authentication credentials');
      }
      
      // Check for SSL/TLS
      if (!mongoUri.includes('ssl=true') && !mongoUri.includes('tls=true')) {
        this.addVulnerability('dataProtection', 'high', 
          'MongoDB connection should use SSL/TLS encryption');
      }
      
      // Check for default ports
      if (mongoUri.includes(':27017') && !mongoUri.includes('localhost')) {
        this.addVulnerability('configuration', 'medium', 
          'Using default MongoDB port (27017) may increase attack surface');
      }
    }
    
    // Check for database connection security in code
    try {
      const serverJsPath = path.join(process.cwd(), 'server.js');
      if (fs.existsSync(serverJsPath)) {
        const serverContent = fs.readFileSync(serverJsPath, 'utf8');
        
        // Check for hardcoded credentials
        const credentialPatterns = [
          /mongodb:\/\/\w+:\w+@/,
          /password[\s]*[:=][\s]*['"]\w+['"]/i,
          /secret[\s]*[:=][\s]*['"]\w+['"]/i
        ];
        
        credentialPatterns.forEach(pattern => {
          if (pattern.test(serverContent)) {
            this.addVulnerability('dataProtection', 'critical', 
              'Hardcoded credentials detected in server.js');
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Could not analyze server.js for database security');
    }
    
    console.log('✅ Database security check completed');
  }

  async checkAuthenticationSecurity() {
    console.log('\n🔍 Checking authentication security...');
    
    // Check bcrypt rounds
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    if (bcryptRounds < 12) {
      this.addVulnerability('authentication', 'medium', 
        `Bcrypt rounds (${bcryptRounds}) should be at least 12 for better security`);
    }
    
    // Check JWT expiration
    const jwtExpiry = process.env.JWT_EXPIRES_IN;
    if (!jwtExpiry) {
      this.addVulnerability('authentication', 'medium', 
        'JWT expiration time not configured');
    } else if (jwtExpiry.includes('d') && parseInt(jwtExpiry) > 7) {
      this.addVulnerability('authentication', 'medium', 
        'JWT expiration time is too long (should be <= 7 days)');
    }
    
    console.log('✅ Authentication security check completed');
  }

  async checkInputValidation() {
    console.log('\n🔍 Checking input validation...');
    
    try {
      // Check for validation middleware
      const middlewarePath = path.join(process.cwd(), 'server', 'middleware');
      
      if (fs.existsSync(middlewarePath)) {
        const files = fs.readdirSync(middlewarePath);
        
        const hasValidation = files.some(file => 
          file.includes('validation') || file.includes('sanitize'));
        
        if (!hasValidation) {
          this.addVulnerability('inputValidation', 'high', 
            'No input validation middleware detected');
        }
      }
      
      // Check for common injection vulnerabilities
      const routesPath = path.join(process.cwd(), 'server', 'routes');
      
      if (fs.existsSync(routesPath)) {
        const routeFiles = fs.readdirSync(routesPath);
        
        routeFiles.forEach(file => {
          const filePath = path.join(routesPath, file);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Check for direct query construction
          if (content.includes('req.query') && !content.includes('validate')) {
            this.addVulnerability('inputValidation', 'medium', 
              `Potential unvalidated query parameters in ${file}`);
          }
          
          // Check for eval usage
          if (content.includes('eval(')) {
            this.addVulnerability('inputValidation', 'critical', 
              `Dangerous eval() usage detected in ${file}`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Could not analyze input validation');
    }
    
    console.log('✅ Input validation check completed');
  }

  async checkLoggingSecurity() {
    console.log('\n🔍 Checking logging security...');
    
    // Check if sensitive data might be logged
    const logLevel = process.env.LOG_LEVEL || 'info';
    
    if (logLevel === 'debug' && process.env.NODE_ENV === 'production') {
      this.addVulnerability('logging', 'medium', 
        'Debug logging enabled in production environment');
    }
    
    // Check for log file permissions
    const logsPath = path.join(process.cwd(), 'logs');
    if (fs.existsSync(logsPath)) {
      try {
        const stats = fs.statSync(logsPath);
        if (process.platform !== 'win32') {
          const mode = stats.mode;
          if (mode & parseInt('044', 8)) {
            this.addVulnerability('logging', 'medium', 
              'Log directory is readable by others');
          }
        }
      } catch (error) {
        console.log('⚠️ Could not check log directory permissions');
      }
    }
    
    console.log('✅ Logging security check completed');
  }

  async checkServerConfiguration() {
    console.log('\n🔍 Checking server configuration...');
    
    // Check CORS configuration
    const corsOrigin = process.env.CORS_ORIGIN;
    if (!corsOrigin || corsOrigin === '*') {
      this.addVulnerability('configuration', 'high', 
        'CORS is not properly configured (allows all origins)');
    }
    
    // Check if running as root (Unix systems)
    if (process.platform !== 'win32' && process.getuid && process.getuid() === 0) {
      this.addVulnerability('configuration', 'critical', 
        'Application is running as root user');
    }
    
    // Check for security headers
    try {
      const serverJsPath = path.join(process.cwd(), 'server.js');
      if (fs.existsSync(serverJsPath)) {
        const content = fs.readFileSync(serverJsPath, 'utf8');
        
        if (!content.includes('helmet')) {
          this.addVulnerability('configuration', 'medium', 
            'Security headers middleware (helmet) not detected');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not check server configuration');
    }
    
    console.log('✅ Server configuration check completed');
  }

  async checkCryptographicSecurity() {
    console.log('\n🔍 Checking cryptographic security...');
    
    // Check for weak random number generation
    try {
      const serverPath = path.join(process.cwd(), 'server');
      if (fs.existsSync(serverPath)) {
        const files = this.getAllJSFiles(serverPath);
        
        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf8');
          
          // Check for Math.random() usage
          if (content.includes('Math.random()')) {
            this.addVulnerability('dataProtection', 'medium', 
              `Weak random number generation (Math.random) in ${path.basename(file)}`);
          }
          
          // Check for deprecated crypto methods
          if (content.includes('crypto.createHash("md5")')) {
            this.addVulnerability('dataProtection', 'high', 
              `Weak hash algorithm (MD5) detected in ${path.basename(file)}`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Could not analyze cryptographic security');
    }
    
    console.log('✅ Cryptographic security check completed');
  }

  getAllJSFiles(dir) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllJSFiles(fullPath));
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
    
    return files;
  }

  addVulnerability(category, severity, description) {
    const vulnerability = {
      category,
      severity,
      description,
      timestamp: new Date().toISOString()
    };
    
    this.auditResults.vulnerabilities.push(vulnerability);
    this.auditResults.categories[category].issues.push(vulnerability);
    
    console.log(`  ⚠️ [${severity.toUpperCase()}] ${description}`);
  }

  calculateSecurityScore() {
    let totalScore = 100;
    
    this.auditResults.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          totalScore -= 20;
          break;
        case 'high':
          totalScore -= 10;
          break;
        case 'medium':
          totalScore -= 5;
          break;
        case 'low':
          totalScore -= 2;
          break;
      }
    });
    
    // Calculate category scores
    Object.keys(this.auditResults.categories).forEach(category => {
      const categoryIssues = this.auditResults.categories[category].issues;
      let categoryScore = 100;
      
      categoryIssues.forEach(issue => {
        switch (issue.severity) {
          case 'critical':
            categoryScore -= 30;
            break;
          case 'high':
            categoryScore -= 15;
            break;
          case 'medium':
            categoryScore -= 8;
            break;
          case 'low':
            categoryScore -= 3;
            break;
        }
      });
      
      this.auditResults.categories[category].score = Math.max(0, categoryScore);
    });
    
    this.auditResults.score = Math.max(0, totalScore);
  }

  async generateSecurityReport() {
    console.log('\n📊 Generating security report...');
    
    // Generate recommendations based on vulnerabilities
    this.generateRecommendations();
    
    const reportPath = path.join(process.cwd(), 'security-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.auditResults, null, 2));
    
    // Generate human-readable report
    const readableReportPath = path.join(process.cwd(), 'security-audit-report.md');
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(readableReportPath, markdownReport);
    
    console.log(`\n📋 Security Report Summary:`);
    console.log(`Total Vulnerabilities: ${this.auditResults.vulnerabilities.length}`);
    console.log(`Critical: ${this.auditResults.vulnerabilities.filter(v => v.severity === 'critical').length}`);
    console.log(`High: ${this.auditResults.vulnerabilities.filter(v => v.severity === 'high').length}`);
    console.log(`Medium: ${this.auditResults.vulnerabilities.filter(v => v.severity === 'medium').length}`);
    console.log(`Low: ${this.auditResults.vulnerabilities.filter(v => v.severity === 'low').length}`);
    
    console.log(`\n💾 Reports saved to:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${readableReportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Critical vulnerabilities
    const criticalVulns = this.auditResults.vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      recommendations.push({
        priority: 'immediate',
        action: 'Address all critical vulnerabilities immediately',
        details: criticalVulns.map(v => v.description)
      });
    }
    
    // Authentication recommendations
    const authIssues = this.auditResults.categories.authentication.issues;
    if (authIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Strengthen authentication mechanisms',
        details: [
          'Use strong JWT secrets (32+ characters)',
          'Implement proper password hashing (bcrypt rounds >= 12)',
          'Set appropriate JWT expiration times',
          'Consider implementing 2FA'
        ]
      });
    }
    
    // Configuration recommendations
    const configIssues = this.auditResults.categories.configuration.issues;
    if (configIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Improve security configuration',
        details: [
          'Configure proper CORS settings',
          'Use security headers (helmet)',
          'Set appropriate file permissions',
          'Use environment variables for sensitive data'
        ]
      });
    }
    
    // General recommendations
    recommendations.push({
      priority: 'medium',
      action: 'Implement security best practices',
      details: [
        'Regular security audits',
        'Dependency vulnerability scanning',
        'Input validation and sanitization',
        'Secure logging practices',
        'Regular security training for developers'
      ]
    });
    
    this.auditResults.recommendations = recommendations;
  }

  generateMarkdownReport() {
    const report = `# Security Audit Report

**Generated:** ${this.auditResults.timestamp}
**Overall Score:** ${this.auditResults.score}/100

## Executive Summary

This security audit identified ${this.auditResults.vulnerabilities.length} potential security issues across various categories.

### Vulnerability Breakdown

| Severity | Count |
|----------|-------|
| Critical | ${this.auditResults.vulnerabilities.filter(v => v.severity === 'critical').length} |
| High | ${this.auditResults.vulnerabilities.filter(v => v.severity === 'high').length} |
| Medium | ${this.auditResults.vulnerabilities.filter(v => v.severity === 'medium').length} |
| Low | ${this.auditResults.vulnerabilities.filter(v => v.severity === 'low').length} |

### Category Scores

${Object.entries(this.auditResults.categories).map(([category, data]) => 
  `- **${category}**: ${data.score}/100 (${data.issues.length} issues)`
).join('\n')}

## Detailed Findings

${this.auditResults.vulnerabilities.map((vuln, index) => 
  `### ${index + 1}. ${vuln.description}

- **Category:** ${vuln.category}
- **Severity:** ${vuln.severity.toUpperCase()}
- **Timestamp:** ${vuln.timestamp}
`
).join('\n')}

## Recommendations

${this.auditResults.recommendations.map((rec, index) => 
  `### ${index + 1}. ${rec.action} (Priority: ${rec.priority.toUpperCase()})

${rec.details.map(detail => `- ${detail}`).join('\n')}
`
).join('\n')}

## Next Steps

1. **Immediate Actions:** Address all critical and high-severity vulnerabilities
2. **Short-term:** Implement recommended security configurations
3. **Long-term:** Establish regular security audit schedule
4. **Monitoring:** Set up security monitoring and alerting

---

*This report was generated by the Digital Library Security Auditor*
`;
    
    return report;
  }
}

// Run audit if called directly
if (require.main === module) {
  const auditor = new SecurityAuditor();
  
  auditor.runAudit()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Security audit error:', error);
      process.exit(1);
    });
}

module.exports = SecurityAuditor;