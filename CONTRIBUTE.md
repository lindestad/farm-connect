# FarmConnect Contribution

---

## Getting Started

1. **Clone** the repository on GitHub:
   ```bash
   git clone https://github.com/lindestad/farm-connect.git
   cd farm-connect
   ```
2. **Find an issue/user-story** and assign yourself to it
3. **Create** new branch:
   ```bash
   git checkout -b [branch-name]
   ```
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Install EAS CLI**
   ```bash
   npm install --global eas-cli # Installs the tool globally on your system
   ```
6. **Setup .env**

   **Note:** You need to login first via the CLI: ```eas login```
   ```bash
   eas env:pull # choose development when prompted
   ```
---

## How to Contribute

### Reporting Bugs

Before opening a bug report, please:

- Search [existing issues](https://github.com/lindestad/farm-connect/issues) to avoid duplicates.
- Check that you're on the latest version.

When filing a bug, include:

- A clear, descriptive title
- Steps to reproduce the problem
- Expected vs actual behavior
- Your environment (OS, language version, etc.)
- Any relevant logs or screenshots

### Suggesting Features

Open an issue and:

- Describe the problem your feature would solve
- Explain your proposed solution
- Note any alternatives you've considered

### Submitting Pull Requests

1. **Make your changes**
2. **Write or update tests** as needed.
3. **Run the test suite** and ensure everything passes.
4. **run `./quality-check.sh`** and ensure everything passes without errors
5. **Commit your changes**
6. **Push** your branch and open a Pull Request against `main`.
7. **Fill out the PR Information**, linking any related issues.
8. **Wait for approval** before mergering with main

`A group member will review your PR as soon as possible.`

---

## Commit Messages

Example of a commit message:

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**

```
feat(auth): add OAuth2 login support
fix(api): handle null response from /users endpoint
docs: update setup instructions in README
```

---

## Documentation

- Update the `README.md` if your change affects usage or setup.
- Add or update inline code comments and docstrings.
- Site code used from other sources, even yourself from older assignments as comments
- For significant features, add a section to the project readme.

---
