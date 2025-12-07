# Contributing to Insight Therapy Learn

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to The Everything AI - Insight Therapy Learn. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report.
- **Use a clear and descriptive title.**
- **Describe the exact steps to reproduce the problem.**
- **Provide specific examples to demonstrate the steps.**
- **Describe the behavior you observed after following the steps.**

### Pull Requests

1.  **Fork the repo** and create your branch from `main`.
2.  **Install dependencies**: `npm install`
3.  **Make sure your code lints**: `npm run lint`
4.  **Run the test suite**: `npm test`
5.  **Commit your changes** using descriptive commit messages.
    - We use `husky` to ensure commits meet our standards.
6.  **Push** to your fork and submit a Pull Request.

## Development Workflow

### Style Guide

- **TypeScript**: We use strict TypeScript. No `any` types allowed unless absolutely necessary.
- **Formatting**: We use Prettier. Code is automatically formatted on commit via `lint-staged`.
- **Naming**:
    - Components: PascalCase (`MyComponent.tsx`)
    - Functions/Variables: camelCase (`myFunction`)
    - Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)

### Testing Policy

- **Unit Tests**: Required for all new utility functions and hooks.
- **Component Tests**: Required for complex UI components.
- **Coverage**: We aim for 80% code coverage. Run `npm run coverage` to check.

### Branch name convention

- `feat/`: New features
- `fix/`: Bug fixes
- `docs/`: Documentation changes
- `refactor/`: Code Refactoring
- `test/`: Adding missing tests

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
