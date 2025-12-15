# Contributing to 3D Geometric Search Engine

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- **Title**: Clear, descriptive title
- **Description**: What happened vs what you expected
- **Steps to reproduce**: Detailed steps
- **Environment**: OS, Node version, browser
- **Screenshots**: If applicable

### Suggesting Features

Feature requests are welcome! Please include:

- **Use case**: Why this feature is needed
- **Description**: How it should work
- **Alternatives**: Other solutions you've considered

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the coding style
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**

   ```bash
   git commit -m "Add: amazing feature description"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Link related issues
   - Wait for review

## Development Guidelines

### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Follow existing patterns
- Run ESLint before committing

### Commit Messages

Use conventional commits:

- `Add: new feature`
- `Fix: bug description`
- `Update: component changes`
- `Refactor: code improvement`
- `Docs: documentation updates`

### Testing

Before submitting:

1. Test your changes locally
2. Verify all existing features work
3. Check browser console for errors
4. Test with different file formats

## Project Structure

```
├── server.js              # Main server
├── package.json           # Dependencies
├── README.md              # Main documentation
├── public/                # Frontend files
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── viewer.js
├── src/
│   ├── parsers/          # File format parsers
│   ├── geometric/        # Feature extraction
│   ├── database/         # Database layer
│   └── utils/            # Utilities
└── uploads/              # Uploaded files
```

## Areas for Contribution

### High Priority

- [ ] Enhanced STEP file parsing (OpenCascade.js integration)
- [ ] Machine learning-based similarity
- [ ] Performance optimization for large models
- [ ] Unit tests and integration tests
- [ ] Mobile responsive design

### Medium Priority

- [ ] Additional file format support (IGES, X3D)
- [ ] Advanced shape descriptors
- [ ] Batch processing API
- [ ] Export functionality
- [ ] Search history

### Low Priority

- [ ] Cloud storage integration
- [ ] User authentication
- [ ] Collaborative features
- [ ] Analytics dashboard
- [ ] API rate limiting

## Code Review Process

1. Maintainer reviews code
2. Feedback provided if needed
3. Changes requested or approved
4. Merge when approved

## Questions?

Open an issue or discussion for:

- Implementation questions
- Architecture decisions
- Feature clarifications

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
