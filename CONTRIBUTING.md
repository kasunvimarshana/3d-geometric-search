/**
 * CONTRIBUTING.md
 * 
 * Guidelines for contributing to the project.
 */

# Contributing to 3D Geometric Search

Thank you for considering contributing to this project! This document provides guidelines and best practices for contributors.

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Basic knowledge of TypeScript and 3D graphics

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/kasunvimarshana/3d-geometric-search.git
cd 3d-geometric-search

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

Follow the project's architecture and coding standards (see below).

### 3. Test Your Changes

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when available)
npm test
```

### 4. Commit Changes

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add support for FBX file format"
git commit -m "fix: resolve section highlighting issue"
git commit -m "docs: update API documentation"
```

Commit message prefixes:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or changes
- `chore:` Build process or tooling changes

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots/videos if applicable

## Coding Standards

### Architecture Principles

Follow Clean Architecture:
- **Domain Layer**: Pure business logic, no dependencies
- **Application Layer**: Use cases and orchestration
- **Infrastructure Layer**: External implementations
- **Presentation Layer**: UI and user interactions

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit types, clear naming
interface ModelMetadata {
  readonly filename: string;
  readonly format: ModelFormat;
  readonly loadedAt: Date;
}

// ❌ Bad: Implicit any, unclear naming
function process(data) {
  // ...
}

// ✅ Good: Explicit return type
function calculateBounds(sections: ModelSection[]): BoundingBox {
  // ...
}

// ❌ Bad: Missing return type
function calculateBounds(sections: ModelSection[]) {
  // ...
}
```

### Naming Conventions

- **Classes**: PascalCase (`ModelService`, `ThreeJSRenderer`)
- **Interfaces**: PascalCase with `I` prefix (`IModelLoader`, `IRenderer`)
- **Functions/Methods**: camelCase (`loadModel`, `selectSection`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_CAMERA_POSITION`)
- **Files**: Match class name (`ModelService.ts`, `IModelLoader.ts`)

### Code Organization

```typescript
// File structure
// 1. Imports (grouped by source)
import { External } from 'external-lib';
import { Domain } from '@domain/models';
import { Application } from '@application/services';

// 2. Interfaces and types
interface LocalInterface {
  // ...
}

// 3. Constants
const CONSTANT_VALUE = 10;

// 4. Class implementation
export class MyClass {
  // Constructor
  constructor() {}
  
  // Public methods
  public publicMethod(): void {}
  
  // Private methods
  private privateMethod(): void {}
}
```

### Error Handling

```typescript
// ✅ Good: Specific error types, meaningful messages
try {
  const result = await this.loader.load(options);
} catch (error) {
  if (error instanceof FileNotFoundError) {
    throw new Error(`File not found: ${options.filename}`);
  }
  throw new Error(`Failed to load model: ${error.message}`);
}

// ❌ Bad: Silent failures, generic errors
try {
  const result = await this.loader.load(options);
} catch (error) {
  console.log('Error');
}
```

### Event Handling

```typescript
// ✅ Good: Type-safe events, clear payload
this.eventBus.publish(new ModelLoadedEvent({
  filename: file.name,
  sectionCount: model.getAllSections().length,
  format: model.metadata.format,
}));

// ❌ Bad: Untyped events
this.eventBus.publish({ type: 'loaded', data: model });
```

### Comments and Documentation

```typescript
/**
 * Loads a 3D model from the specified file.
 * 
 * @param file - The file to load
 * @returns Promise that resolves when loading is complete
 * @throws {Error} If the file format is unsupported
 * 
 * @example
 * ```typescript
 * await modelService.loadModel(file);
 * ```
 */
async loadModel(file: File): Promise<void> {
  // Implementation...
}

// Inline comments for complex logic
// Calculate the center point of the bounding box
const center = new Vector3(
  (box.min.x + box.max.x) / 2,
  (box.min.y + box.max.y) / 2,
  (box.min.z + box.max.z) / 2
);
```

### CSS Guidelines

```css
/* Use CSS custom properties for theming */
:root {
  --color-primary: #3498db;
  --spacing-md: 16px;
}

/* Follow BEM-like naming for clarity */
.tree-node-content {
  /* Block */
}

.tree-node-content.selected {
  /* Modifier */
}

/* Avoid deep nesting */
/* ❌ Bad */
.sidebar .panel .tree .node .content {
}

/* ✅ Good */
.tree-node-content {
}
```

## Testing

### Unit Tests

Test individual components in isolation:

```typescript
describe('ModelService', () => {
  it('should load a valid model', async () => {
    const service = new ModelService(loader, renderer, eventBus);
    await service.loadModel(mockFile);
    expect(service.getCurrentModel()).toBeDefined();
  });
});
```

### Integration Tests

Test interactions between components:

```typescript
describe('Model Loading Flow', () => {
  it('should update UI after model loads', async () => {
    // Test complete workflow
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add JSDoc comments for public APIs
- Include examples in documentation

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows project architecture and style guidelines
- [ ] All tests pass
- [ ] TypeScript compiles without errors
- [ ] Linting passes without errors
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains the changes
- [ ] Related issues are referenced

## Questions or Issues?

- Open an issue on GitHub
- Check existing issues and discussions
- Review architecture documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
