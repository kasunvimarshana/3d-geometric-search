# Testing Guide - 3D Geometric Viewer v3.0

## Overview

This guide covers testing strategies, test structure, and examples for the 3D Geometric Viewer application.

## Test Infrastructure

### Framework: Vitest

We use **Vitest** for unit, integration, and E2E testing.

**Why Vitest?**

- Fast execution with smart caching
- Native ES module support
- Compatible with Vite build system
- Built-in coverage reporting
- TypeScript support
- Similar API to Jest

### Test Environment

- **DOM Environment**: happy-dom (lightweight, ES module compatible)
- **Test Runner**: Vitest
- **Coverage**: v8 (native V8 coverage)

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test

# Run tests once (CI/CD)
npm run test:run

# Run with coverage report
npm run test:coverage

# Run with UI (interactive)
npm run test:ui
```

### Configuration

Tests are configured in `vitest.config.js`:

```javascript
export default defineConfig({
  test: {
    globals: true, // Global test APIs
    environment: 'happy-dom', // DOM environment
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['tests/**/*.{test,spec}.js'],
  },
});
```

## Test Structure

### Directory Layout

```
tests/
├── setup.js                 # Global test setup
├── unit/                    # Unit tests
│   ├── domain/             # Domain layer tests
│   │   ├── Model.test.js
│   │   ├── Section.test.js
│   │   ├── Vector3D.test.js
│   │   └── BoundingBox.test.js
│   ├── state/              # State management tests
│   │   ├── EventBus.test.js
│   │   ├── ViewerState.test.js
│   │   └── StateManager.test.js
│   └── services/           # Service tests
│       ├── ModelLoaderService.test.js
│       ├── ExportService.test.js
│       └── SectionManagementService.test.js
├── integration/            # Integration tests
│   ├── loading-workflow.test.js
│   ├── section-management.test.js
│   └── export-workflow.test.js
└── e2e/                    # End-to-end tests
    ├── user-workflows.test.js
    └── ui-interactions.test.js
```

## Writing Tests

### Unit Test Template

```javascript
/**
 * Unit Tests for [Component Name]
 *
 * @group unit
 * @group [layer] (domain|infrastructure|application|state|controllers)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentToTest } from '@/path/to/component';

describe('ComponentToTest', () => {
  let instance;

  beforeEach(() => {
    // Setup before each test
    instance = new ComponentToTest();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('Method/Feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data';

      // Act
      const result = instance.method(input);

      // Assert
      expect(result).toBe('expected output');
    });

    it('should handle edge cases', () => {
      expect(() => instance.method(null)).toThrow();
    });
  });
});
```

### Test Categories

#### 1. **Unit Tests** (Fast, Isolated)

Test individual components in isolation.

```javascript
describe('Vector3D', () => {
  it('should add two vectors correctly', () => {
    const v1 = new Vector3D({ x: 1, y: 2, z: 3 });
    const v2 = new Vector3D({ x: 4, y: 5, z: 6 });

    const result = v1.add(v2);

    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });

  it('should be immutable', () => {
    const vector = new Vector3D({ x: 1, y: 2, z: 3 });

    expect(Object.isFrozen(vector)).toBe(true);
    expect(() => {
      vector.x = 10;
    }).toThrow();
  });
});
```

#### 2. **Integration Tests** (Medium Speed)

Test interaction between components.

```javascript
describe('Model Loading Workflow', () => {
  let modelLoader;
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    modelLoader = new ModelLoaderService({ eventBus });
  });

  it('should emit events during model loading', async () => {
    const startedHandler = vi.fn();
    const completedHandler = vi.fn();

    eventBus.subscribe('model:load:started', startedHandler);
    eventBus.subscribe('model:load:completed', completedHandler);

    await modelLoader.loadFromURL('test.gltf');

    expect(startedHandler).toHaveBeenCalled();
    expect(completedHandler).toHaveBeenCalledWith(
      expect.objectContaining({ model: expect.any(Object) })
    );
  });
});
```

#### 3. **E2E Tests** (Slower, Full Stack)

Test complete user workflows.

```javascript
describe('User Workflow: Load and Export Model', () => {
  let app;

  beforeEach(() => {
    const canvas = document.createElement('canvas');
    app = new ApplicationController(canvas);
  });

  it('should load model and export it', async () => {
    // Load model
    const model = await app.loadModel('model.gltf', {
      name: 'Test Model',
    });

    expect(model.name).toBe('Test Model');
    expect(app.getState().currentModelId).toBe(model.id);

    // Export model
    const blob = await app.exportModel(model.id, 'glb');

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toContain('model');
  });
});
```

## Mocking

### Mocking Dependencies

```javascript
import { vi } from 'vitest';

// Mock entire module
vi.mock('three', () => ({
  WebGLRenderer: vi.fn(),
  Scene: vi.fn(),
  PerspectiveCamera: vi.fn(),
}));

// Mock specific function
const mockFetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'test' }),
  })
);
global.fetch = mockFetch;
```

### Spy on Methods

```javascript
const eventBus = new EventBus();
const publishSpy = vi.spyOn(eventBus, 'publish');

eventBus.publish('test', { data: 'test' });

expect(publishSpy).toHaveBeenCalledWith('test', { data: 'test' });
```

### Mock Timers

```javascript
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it('should delay execution', () => {
  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();
});
```

## Test Helpers

### Global Helpers (in `tests/setup.js`)

```javascript
// Create mock canvas
global.createMockCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  return canvas;
};

// Create mock file
global.createMockFile = (name, type = 'model/gltf+json') => {
  return new File(['mock content'], name, { type });
};

// Sleep utility
global.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
```

### Usage

```javascript
it('should work with canvas', () => {
  const canvas = createMockCanvas();
  const app = new ApplicationController(canvas);

  expect(app).toBeDefined();
});

it('should load file', async () => {
  const file = createMockFile('test.gltf');
  const model = await loader.loadFromFile(file);

  expect(model.name).toBe('test');
});
```

## Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

### Coverage Output

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.32 |    78.45 |   82.67 |   85.32 |
 domain/models        |   92.15 |    85.33 |   90.12 |   92.15 |
  Model.js            |   94.32 |    88.21 |   92.45 |   94.32 |
  Section.js          |   90.78 |    82.45 |   87.89 |   90.78 |
 domain/values        |   95.43 |    92.11 |   94.56 |   95.43 |
  Vector3D.js         |   96.21 |    93.45 |   95.67 |   96.21 |
  BoundingBox.js      |   94.65 |    90.77 |   93.45 |   94.65 |
----------------------|---------|----------|---------|---------|
```

### Coverage Thresholds

Aim for:

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Best Practices

### 1. **Arrange-Act-Assert (AAA) Pattern**

```javascript
it('should calculate sum correctly', () => {
  // Arrange
  const calculator = new Calculator();
  const a = 5;
  const b = 3;

  // Act
  const result = calculator.add(a, b);

  // Assert
  expect(result).toBe(8);
});
```

### 2. **Test One Thing**

❌ **Bad**: Testing multiple concerns

```javascript
it('should handle everything', () => {
  expect(model.isValid()).toBe(true);
  expect(model.name).toBe('Test');
  expect(model.sections.length).toBe(5);
  expect(model.getBoundingBox()).toBeDefined();
});
```

✅ **Good**: Focused tests

```javascript
it('should validate model correctly', () => {
  expect(model.isValid()).toBe(true);
});

it('should have correct name', () => {
  expect(model.name).toBe('Test');
});
```

### 3. **Descriptive Test Names**

❌ **Bad**: Vague names

```javascript
it('works', () => {
  /* ... */
});
it('test 1', () => {
  /* ... */
});
```

✅ **Good**: Clear intent

```javascript
it('should return null when model not found', () => {
  /* ... */
});
it('should throw error when loading invalid file', () => {
  /* ... */
});
```

### 4. **Test Edge Cases**

```javascript
describe('Vector3D.divide', () => {
  it('should divide by positive number', () => {
    const v = new Vector3D({ x: 10, y: 20, z: 30 });
    const result = v.divide(2);
    expect(result.x).toBe(5);
  });

  it('should throw error when dividing by zero', () => {
    const v = new Vector3D({ x: 10, y: 20, z: 30 });
    expect(() => v.divide(0)).toThrow('Cannot divide by zero');
  });

  it('should handle negative divisor', () => {
    const v = new Vector3D({ x: 10, y: 20, z: 30 });
    const result = v.divide(-2);
    expect(result.x).toBe(-5);
  });
});
```

### 5. **Avoid Test Interdependence**

❌ **Bad**: Tests depend on each other

```javascript
let sharedModel;

it('should create model', () => {
  sharedModel = new Model({
    /* ... */
  });
});

it('should use model', () => {
  expect(sharedModel.name).toBe('Test'); // Fails if first test doesn't run
});
```

✅ **Good**: Independent tests

```javascript
it('should create model', () => {
  const model = new Model({
    /* ... */
  });
  expect(model).toBeDefined();
});

it('should have correct name', () => {
  const model = new Model({ name: 'Test' /* ... */ });
  expect(model.name).toBe('Test');
});
```

## Testing Async Code

### Promises

```javascript
it('should load model from URL', async () => {
  const model = await modelLoader.loadFromURL('test.gltf');
  expect(model).toBeDefined();
});

it('should handle loading errors', async () => {
  await expect(modelLoader.loadFromURL('invalid')).rejects.toThrow();
});
```

### Callbacks

```javascript
it('should call callback on completion', done => {
  loader.load('test.gltf', model => {
    expect(model).toBeDefined();
    done();
  });
});
```

## Testing Events

```javascript
describe('EventBus', () => {
  it('should notify subscribers', () => {
    const handler = vi.fn();
    eventBus.subscribe('test', handler);

    eventBus.publish('test', { data: 'test' });

    expect(handler).toHaveBeenCalledWith({ data: 'test' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should support multiple subscribers', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    eventBus.subscribe('test', handler1);
    eventBus.subscribe('test', handler2);

    eventBus.publish('test', { data: 'test' });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });
});
```

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --reporter=verbose
```

### Debug Specific Test

```javascript
it.only('should debug this test', () => {
  console.log('Debug output');
  expect(true).toBe(true);
});
```

### Skip Tests

```javascript
it.skip('should skip this test', () => {
  // Won't run
});

describe.skip('Skipped suite', () => {
  // All tests skipped
});
```

### Browser DevTools

```bash
npm test -- --inspect-brk
```

Then open `chrome://inspect` in Chrome.

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Performance Testing

### Measure Test Speed

```javascript
import { performance } from 'perf_hooks';

it('should complete within time limit', () => {
  const start = performance.now();

  // Expensive operation
  const result = complexCalculation();

  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100); // Less than 100ms
});
```

## Troubleshooting

### Common Issues

#### 1. **Module Resolution Errors**

```
Error: Cannot find module '@domain/models/Model.js'
```

**Solution**: Check path aliases in `vitest.config.js`

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@domain': path.resolve(__dirname, './src/domain'),
  },
}
```

#### 2. **DOM Not Available**

```
ReferenceError: document is not defined
```

**Solution**: Ensure test environment is set to 'happy-dom'

```javascript
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
});
```

#### 3. **Timeout Errors**

```
Test timeout exceeded
```

**Solution**: Increase timeout

```javascript
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Kent C. Dodds - Testing](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Quick Reference

### Assertions

```javascript
expect(value).toBe(expected); // Strict equality
expect(value).toEqual(expected); // Deep equality
expect(value).toBeTruthy(); // Truthy check
expect(value).toBeFalsy(); // Falsy check
expect(value).toBeNull(); // Null check
expect(value).toBeUndefined(); // Undefined check
expect(value).toBeDefined(); // Defined check
expect(value).toBeInstanceOf(Class); // Instance check
expect(value).toHaveLength(num); // Length check
expect(value).toContain(item); // Contains check
expect(value).toMatch(/regex/); // Regex match
expect(fn).toThrow(); // Throws error
expect(fn).toThrow(Error); // Throws specific error
expect(fn).toThrow('message'); // Throws with message
expect(value).toBeGreaterThan(num); // Greater than
expect(value).toBeLessThan(num); // Less than
expect(value).toBeCloseTo(num, precision); // Float comparison
```

### Mocks

```javascript
const fn = vi.fn(); // Create mock
const fn = vi.fn(() => 'return value'); // With implementation
vi.spyOn(obj, 'method'); // Spy on method
fn.mockReturnValue(value); // Set return value
fn.mockResolvedValue(value); // Async return
fn.mockRejectedValue(error); // Async error
expect(fn).toHaveBeenCalled(); // Called check
expect(fn).toHaveBeenCalledWith(arg); // Called with args
expect(fn).toHaveBeenCalledTimes(num); // Call count
vi.clearAllMocks(); // Clear all mocks
```

---

**Happy Testing!** 🧪✅
