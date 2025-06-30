# Secret Check Demo

This repository includes a pre-commit hook that checks for secrets in staged files using `detect-secrets`. It prevents accidental commits of sensitive information like API keys, passwords, and other secrets.

## Prerequisites

- Python (for pre-commit and detect-secrets)
- Git

## Installation

1. Install pre-commit and detect-secrets:
   ```bash
   pip install pre-commit detect-secrets
   ```

2. Install the pre-commit hooks:
   ```bash
   pre-commit install
   ```

3. Generate a baseline (if not already present):
   ```bash
   detect-secrets scan > .secrets.baseline
   ```

## How it Works

When you try to make a commit, the pre-commit hook will:
1. Scan all staged files for potential secrets using detect-secrets
2. If any secrets are found, the commit will be blocked
3. Details about the detected secrets will be displayed, including:
   - File path
   - Line number
   - Type of secret detected

## Troubleshooting

If you get an error about `pre-commit` or `detect-secrets` not being installed, make sure to install them using:
```bash
pip install pre-commit detect-secrets
```

## Bypassing the Hook

In rare cases where you need to bypass the secret check (NOT RECOMMENDED), you can use:
```bash
git commit --no-verify
```

## Contributing

Please ensure no secrets are committed to this repository. The pre-commit hook is here to help, but it's still your responsibility to review your code before committing.
