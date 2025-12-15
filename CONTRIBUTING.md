# Contributing to 3D GeoSearch

Thank you for your interest in contributing to 3D GeoSearch! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in Issues
- Use the bug report template
- Include detailed steps to reproduce
- Include system information and error messages

### Suggesting Features

- Check if the feature has been requested
- Clearly describe the feature and use cases
- Explain why it would be useful

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit with clear messages (`git commit -m 'Add amazing feature'`)
7. Push to your fork (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

### Run Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

## Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript/React**: Use ESLint and Prettier
- Write clear, descriptive variable and function names
- Add comments for complex logic
- Write docstrings for all functions

## Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs

## Testing

- Write unit tests for new features
- Ensure existing tests pass
- Aim for high code coverage
- Test edge cases

## Documentation

- Update README.md if needed
- Add docstrings to new functions
- Update API documentation
- Include code examples

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
