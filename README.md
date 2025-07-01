# Important: Pre-commit Secret Check

⚠️ **REQUIRED**: Before making any commits to this repository, all developers must run:

```bash
npm install
```

## Why?

- This repository has a pre-commit hook that checks for secrets and sensitive information in your code
- The hook prevents accidental commits of secrets, API keys, and credentials
- It works with all programming languages and file types
- **Your commits will fail if you don't install the required npm packages**

## For Non-Node.js Developers

Even if you're not working with Node.js/JavaScript:
1. Make sure you have Node.js installed (download from [nodejs.org](https://nodejs.org))
2. Run `npm install` in the repository root
3. Continue using your preferred programming language

The secret check will run automatically before each commit.
