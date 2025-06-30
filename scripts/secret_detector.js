const fs = require('fs');
const { execSync } = require('child_process');

// Regex patterns for common secrets
const SECRET_PATTERNS = {
    // Cloud Provider Keys
    AWS_ACCESS_KEY: /AKIA[0-9A-Z]{16}/,
    AWS_SECRET_KEY: /[0-9a-zA-Z/+]{40}/,
    AZURE_KEY: /[0-9a-zA-Z]{32}-[0-9a-zA-Z]{16}-[0-9a-zA-Z]{24}/,
    
    // Authentication & API Keys
    API_KEY: /(api[_-]?key|apikey|api[_-]?secret)[\s=:]+["']?[\w-]{16,}["']?/i,
    JWT_TOKEN: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/,
    PRIVATE_KEY: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY(?:\s+BLOCK)?-----/,
    
    // Database Connection Strings
    MONGODB_URI: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@[^/]+\/[\w-]+/i,
    POSTGRES_URI: /postgres(?:ql)?:\/\/[^:]+:[^@]+@[^/]+\/[\w-]+/i,
    
    // OAuth & Platform Keys
    GITHUB_TOKEN: /gh[ps]_[0-9a-zA-Z]{36}/,
    GOOGLE_API_KEY: /AIza[0-9A-Za-z-_]{35}/,
    STRIPE_KEY: /(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]{24}/
};

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
        for (const [secretType, pattern] of Object.entries(SECRET_PATTERNS)) {
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