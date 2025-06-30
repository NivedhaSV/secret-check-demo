#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
    // Get staged files
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
        .split('\n')
        .filter(Boolean);

    if (stagedFiles.length === 0) {
        console.log('No staged files to check.');
        process.exit(0);
    }

    // Create a temporary file with the list of staged files
    const tempFilePath = path.join(__dirname, 'staged-files.txt');
    fs.writeFileSync(tempFilePath, stagedFiles.join('\n'));

    try {
        // Run detect-secrets on staged files
        const result = execSync(`detect-secrets scan --baseline .secrets.baseline ${stagedFiles.join(' ')}`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Parse the JSON output
        const secretsFound = JSON.parse(result);
        const hasSecrets = Object.keys(secretsFound.results).length > 0;

        if (hasSecrets) {
            console.error('\x1b[31m%s\x1b[0m', '🚫 Secrets detected in staged files!');
            console.error('Please remove the following secrets before committing:');
            
            Object.entries(secretsFound.results).forEach(([file, secrets]) => {
                console.error(`\nFile: ${file}`);
                secrets.forEach(secret => {
                    console.error(`  - Line ${secret.line_number}: ${secret.type}`);
                });
            });
            
            process.exit(1);
        } else {
            console.log('\x1b[32m%s\x1b[0m', '✅ No secrets detected in staged files.');
        }
    } finally {
        // Clean up temporary file
        fs.unlinkSync(tempFilePath);
    }
} catch (error) {
    if (error.message.includes('detect-secrets')) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Error: detect-secrets is not installed.');
        console.error('Please install it using: pip install detect-secrets');
    } else {
        console.log(error);
        
        console.error('\x1b[31m%s\x1b[0m', '❌ Error checking for secrets:');
        console.error(error.message);
    }
    process.exit(1);
} 