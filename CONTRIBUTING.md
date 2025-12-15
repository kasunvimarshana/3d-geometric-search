# Contributing Guidelines

Thank you for your interest in contributing to the 3D Geometric Search project!

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the issue, not the person
- Welcome newcomers

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/my-feature`

## Development Process

### Making Changes

1. Follow the coding standards in [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Write tests for new functionality
3. Update documentation as needed
4. Ensure all tests pass: `npm test`
5. Lint your code: `npm run lint`

### Commit Messages

Follow the conventional commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:

```
feat(loader): add STEP format support
fix(renderer): resolve memory leak in dispose
docs(architecture): update component diagram
```

### Pull Requests

1. Update your branch with main: `git rebase main`
2. Push to your fork
3. Open a pull request
4. Fill out the PR template
5. Link related issues
6. Wait for review

## Testing

- Write unit tests for new code
- Maintain code coverage above 80%
- Test edge cases and error conditions
- Run tests before submitting: `npm test`

## Documentation

- Update relevant documentation
- Add JSDoc comments to public APIs
- Include code examples where helpful
- Update CHANGELOG.md

## Architecture

Follow clean architecture principles:

- Keep core layer framework-agnostic
- Depend on abstractions, not concretions
- Follow SOLID principles
- Maintain separation of concerns

## Review Process

1. Automated checks must pass
2. At least one approval required
3. All comments must be resolved
4. Branch must be up-to-date with main

## Questions?

- Check existing documentation
- Search closed issues
- Ask in discussions
- Contact maintainers

Thank you for contributing!
