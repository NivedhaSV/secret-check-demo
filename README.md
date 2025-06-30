# Secret Check Demo

This repository includes a pre-commit hook that checks for secrets in staged files using `detect-secrets`. It prevents accidental commits of sensitive information like API keys, passwords, and other secrets.

## Prerequisites

- Node.js
- Python (for detect-secrets)
- Git

## Installation

1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Install detect-secrets:
   ```bash
   pip install detect-secrets
   ```

The pre-commit hook will be automatically installed when you run `npm install` thanks to the `prepare` script.

## How it Works

When you try to make a commit, the pre-commit hook will:
1. Scan all staged files for potential secrets using detect-secrets
2. If any secrets are found, the commit will be blocked
3. Details about the detected secrets will be displayed, including:
   - File path
   - Line number
   - Type of secret detected

## Troubleshooting

If you get an error about `detect-secrets` not being installed, make sure to install it using:
```bash
pip install detect-secrets
```

## Bypassing the Hook

In rare cases where you need to bypass the secret check (NOT RECOMMENDED), you can use:
```bash
git commit --no-verify
```

## Contributing

Please ensure no secrets are committed to this repository. The pre-commit hook is here to help, but it's still your responsibility to review your code before committing.
