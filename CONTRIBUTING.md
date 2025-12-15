# Contributing to 3D Geometric Search

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the code style and conventions

## Getting Started

### Prerequisites

- Node.js 16+ and npm 7+
- Modern browser with WebGL support
- Git for version control
- Code editor (VS Code recommended)

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/3d-geometric-search.git
cd 3d-geometric-search

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── core/           # Domain logic and models
├── events/         # Event system
├── loaders/        # File format loaders
├── renderer/       # Three.js rendering
├── state/          # State management
├── ui/             # UI components
├── utils/          # Utilities
└── index.js        # Entry point
```

## Development Workflow

### 1. Pick an Issue

- Check [Issues](https://github.com/yourusername/3d-geometric-search/issues)
- Comment to claim an issue
- Ask questions if unclear

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Follow code style (see below)
- Write tests for new features
- Update documentation
- Keep commits atomic and focused

### 4. Test Your Changes

```bash
# Run tests
npm test

# Manual testing
npm run dev
# Test in browser

# Build check
npm run build
```

### 5. Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve bug"
```

**Commit Message Format:**

```
<type>: <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### 6. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style

### JavaScript Style

**Use ES6+ features:**

```javascript
// Good
const model = { id: 1, name: "Model" };
const items = array.map((x) => x * 2);

// Avoid
var model = { id: 1, name: "Model" };
var items = [];
for (var i = 0; i < array.length; i++) {
  items.push(array[i] * 2);
}
```

**Use destructuring:**

```javascript
// Good
const { id, name } = model;
const [first, second] = array;

// Avoid
const id = model.id;
const name = model.name;
```

**Use template literals:**

```javascript
// Good
const message = `Model ${name} loaded`;

// Avoid
const message = "Model " + name + " loaded";
```

**Avoid mutation:**

```javascript
// Good
const newArray = [...array, newItem];
const newObject = { ...object, key: value };

// Avoid
array.push(newItem);
object.key = value;
```

### Naming Conventions

**Variables and functions: camelCase**

```javascript
const modelId = 123;
function loadModel() {}
```

**Classes: PascalCase**

```javascript
class ModelLoader {}
class EventDispatcher {}
```

**Constants: UPPER_SNAKE_CASE**

```javascript
const MAX_FILE_SIZE = 1000000;
const DEFAULT_TIMEOUT = 5000;
```

**Private properties: underscore prefix**

```javascript
class Component {
  constructor() {
    this._internalState = {};
  }
}
```

### Documentation

**Use JSDoc for functions:**

```javascript
/**
 * Loads a 3D model from file
 * @param {File} file - File to load
 * @returns {Promise<Model3D>} Loaded model
 * @throws {Error} If file format is unsupported
 */
async function loadModel(file) {
  // ...
}
```

**Document complex algorithms:**

```javascript
// Calculate bounding box using AABB algorithm
// See: https://en.wikipedia.org/wiki/Minimum_bounding_box
function calculateBounds(vertices) {
  // ...
}
```

### File Organization

**One export per file for classes:**

```javascript
// ModelLoader.js
export class ModelLoader {
  // ...
}
```

**Group related functions:**

```javascript
// utils.js
export function functionA() {}
export function functionB() {}
```

**Imports at top:**

```javascript
import { EventType } from "./events/EventDispatcher.js";
import { createModel } from "./core/types.js";
import * as THREE from "three";
```

## Testing Guidelines

### Unit Tests

Test individual functions and classes in isolation.

```javascript
import { describe, it, expect } from "vitest";
import { createModel } from "../src/core/types.js";

describe("createModel", () => {
  it("should create a model with default values", () => {
    const model = createModel();
    expect(model.id).toBeDefined();
    expect(model.name).toBe("Untitled Model");
  });

  it("should use provided values", () => {
    const model = createModel({ name: "Test" });
    expect(model.name).toBe("Test");
  });
});
```

### Integration Tests

Test component interactions.

```javascript
describe("Model Loading", () => {
  it("should load and render a glTF file", async () => {
    const loader = new GltfLoader();
    const model = await loader.load(testFile);

    expect(model).toBeDefined();
    expect(model.format).toBe("gltf");
    expect(model.root).toBeDefined();
  });
});
```

### Test Coverage

- Aim for > 80% coverage
- Focus on critical paths
- Test error cases
- Mock external dependencies

## Adding New Features

### New File Format Support

1. **Create Loader**

```javascript
// src/loaders/NewFormatLoader.js
import { BaseLoader } from "./BaseLoader.js";

export class NewFormatLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = ["newformat"];
  }

  async load(file) {
    const data = await this.readAsArrayBuffer(file);
    return this.parse(data, file.name);
  }

  async parse(data, filename) {
    // Parse format
    return convertToModel();
  }
}
```

2. **Register in Factory**

```javascript
// src/loaders/LoaderFactory.js
import { NewFormatLoader } from "./NewFormatLoader.js";

this.loaders = [
  // ...
  new NewFormatLoader(),
];
```

3. **Add Tests**

```javascript
describe("NewFormatLoader", () => {
  it("should load .newformat files", async () => {
    // Test implementation
  });
});
```

4. **Update Documentation**

- README.md - Add to supported formats
- ARCHITECTURE.md - Document format specifics

### New Event Type

1. **Add to EventType enum**

```javascript
// src/events/EventDispatcher.js
export const EventType = {
  // ...
  NEW_FEATURE_EVENT: "feature:new",
};
```

2. **Add validation schema (if needed)**

```javascript
const EventSchemas = {
  [EventType.NEW_FEATURE_EVENT]: ["requiredField"],
};
```

3. **Create action**

```javascript
// src/state/actions.js
export function triggerNewFeature(data) {
  dispatch(EventType.NEW_FEATURE_EVENT, data);
}
```

4. **Handle in Application**

```javascript
on(EventType.NEW_FEATURE_EVENT, (event) => {
  // Handle event
});
```

### New UI Component

1. **Create Component**

```javascript
// src/ui/NewComponent.js
export class NewComponent {
  constructor(container) {
    this.container = container;
  }

  render(data) {
    // Render logic
  }

  clear() {
    this.container.innerHTML = "";
  }
}
```

2. **Add styles**

```css
/* src/styles/main.css */
.new-component {
  /* Styles */
}
```

3. **Integrate**

```javascript
// src/index.js
this.newComponent = new NewComponent(element);
```

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debugger statements
- [ ] Build succeeds
- [ ] No linting errors

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Screenshots

If UI changes, add screenshots

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] Code reviewed
```

### Review Process

1. Automated checks must pass
2. At least one approval required
3. Address review comments
4. Squash commits before merge

## Reporting Issues

### Bug Report Template

```markdown
**Describe the bug**
Clear description

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**

- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 95]
- Version: [e.g. 1.0.0]

**Additional context**
Any other information
```

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description

**Describe the solution**
How you'd like it to work

**Describe alternatives**
Other solutions considered

**Additional context**
Any other information
```

## Release Process

### Versioning

Follow Semantic Versioning (semver):

- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

### Release Checklist

1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Create release branch
5. Build and test production bundle
6. Create GitHub release
7. Publish to npm (if applicable)

## Resources

### Documentation

- [Architecture Guide](ARCHITECTURE.md)
- [API Reference](docs/api.md)
- [Three.js Docs](https://threejs.org/docs/)

### Tools

- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Git](https://git-scm.com/)

### Learning

- [JavaScript Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [ES6 Features](http://es6-features.org/)
- [Three.js Examples](https://threejs.org/examples/)

## Questions?

- Open an issue for bugs/features
- Start a discussion for questions
- Check existing issues first
- Be patient and respectful

Thank you for contributing!
