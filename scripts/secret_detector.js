const fs = require('fs');
const { execSync } = require('child_process');

// Regex patterns for common secrets
const SECRET_PATTERNS = [
    // AWS Keys
    /AKIA[0-9A-Z]{16,40}/, // AWS Access Key
  
    // Google Cloud Keys
    /AIza[0-9A-Za-z-_]{35}/, // Google API Key
  
    // Azure Keys
    /([A-Za-z0-9]{32})\-([A-Za-z0-9]{16})\-([A-Za-z0-9]{24})/, // Azure Storage Account Key
  
    // GitHub Token Patterns
    /ghp_[A-Za-z0-9]{36}/, // GitHub Personal Access Token
  
    // Slack Tokens
    /xox[baprs]-([0-9A-Za-z]{10,48})/, // Slack OAuth token
  
    // Twilio API Keys
    /SK[0-9a-fA-F]{32}/, // Twilio API Key
  
    // Stripe Secret Keys
    /sk_live_[0-9a-zA-Z]{24}/, // Stripe API Secret Key
  
    // Firebase API Keys
    /AIza[0-9A-Za-z-_]{35}/, // Firebase API Key
  
    // Docker Hub Token
    // /[A-Za-z0-9]{30}/, // Docker Hub Access Token
  
    // Generic Base64 encoded secrets (e.g., tokens)
    // /[A-Za-z0-9+\/=]{32,}/, // Base64 Token Pattern
  
    // Miscellaneous sensitive data (e.g., passwords, JWTs)
    /(?:eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/, // JWT Token Pattern
    /password[\s]*=[\s]*['"][^'"]{8,}['"]/i, // Password Pattern
  
    // OAuth tokens
    // /[A-Za-z0-9_-]{35,}/, // Generic OAuth Token
  ];

function getStagedFiles() {
    try {
        const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACMR')
            .toString()
            .trim()
            .split('\n')
            .filter(Boolean);
        return stagedFiles;
    } catch (error) {
        console.error('Error getting staged files:', error.message);
        process.exit(1);
    }
}

function checkFileForSecrets(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const findings = [];

        // Check each pattern
        for (const [secretType, pattern] of SECRET_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
                findings.push({
                    type: secretType,
                    line: content.substring(0, matches.index).split('\n').length
                });
            }
        }

        return findings;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }
}

function main() {
    const stagedFiles = getStagedFiles();
    if (stagedFiles.length === 0) {
        console.log('No staged files to check.');
        process.exit(0);
    }

    console.log('🔍 Checking staged files for secrets...\n');
    let secretsFound = false;

    for (const file of stagedFiles) {
        const findings = checkFileForSecrets(file);
        
        if (findings.length > 0) {
            console.log(`⚠️  Potential secrets found in ${file}:`);
            findings.forEach(finding => {
                console.log(`   - ${finding.type} at line ${finding.line}`);
            });
            console.log('');
            secretsFound = true;
        }
    }

    if (secretsFound) {
        console.error('❌ Secrets were found in staged files. Please remove them and try again.');
        process.exit(1);
    } else {
        console.log('✅ No secrets found in staged files.');
    }
}

main(); 