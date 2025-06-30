const fs = require('fs');
const { execSync } = require('child_process');

// Regex patterns for common secrets
const SECRET_PATTERNS = {
    AWS_ACCESS_KEY: /(?<![A-Za-z0-9])[A-Z0-9]{20}(?![A-Za-z0-9])/,
    AWS_SECRET_KEY: /(?<![A-Za-z0-9])[A-Za-z0-9+/]{40}(?![A-Za-z0-9])/,
    PRIVATE_KEY: /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY(?:\s+BLOCK)?-----/,
    API_KEY: /(api[_-]?key|apikey|api[_-]?secret|apisecret)(?:[_-]?\s*[:=]\s*|\s+)['"]?[A-Za-z0-9]{16,}['"]?/i,
    AUTH_TOKEN: /(auth[_-]?token|authentication[_-]?token|jwt[_-]?token)(?:[_-]?\s*[:=]\s*|\s+)['"]?[A-Za-z0-9._-]{32,}['"]?/i,
    GITHUB_TOKEN: /(?:github|gh)(?:[_-]?\s*[:=]\s*|\s+)['"]?[0-9a-zA-Z]{40}['"]?/i
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