# Development Guide

## Project Structure

```
geometric-search/
├── src/
│   ├── core/              # Domain models
│   │   ├── Model.js
│   │   ├── Section.js
│   │   ├── Camera.js
│   │   └── Selection.js
│   ├── state/             # State management
│   │   ├── StateManager.js
│   │   └── StateActions.js
│   ├── engine/            # 3D rendering
│   │   ├── Engine.js
│   │   └── SceneManager.js
│   ├── loaders/           # File format loaders
│   │   ├── BaseLoader.js
│   │   ├── GLTFLoader.js
│   │   ├── OBJLoader.js
│   │   ├── STLLoader.js
│   │   ├── STEPLoader.js
│   │   └── LoaderFactory.js
│   ├── events/            # Event orchestration
│   │   └── EventOrchestrator.js
│   ├── ui/                # UI components
│   │   ├── Component.js
│   │   ├── Toolbar.js
│   │   ├── SectionTree.js
│   │   ├── PropertiesPanel.js
│   │   ├── Viewer.js
│   │   └── LoadingOverlay.js
│   ├── utils/             # Utilities
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── styles/            # CSS
│   │   └── main.css
│   ├── Application.js     # Main app class
│   └── index.js           # Entry point
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── ARCHITECTURE.md
└── USER_GUIDE.md
```

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Modern browser with WebGL 2.0 support
- Git

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd geometric-search

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Server

The development server runs on `http://localhost:3000` with:
- Hot module replacement
- Source maps
- Error overlay

## Coding Standards

### JavaScript Style

- ES6+ modules
- Camel case for variables and functions
- Pascal case for classes
- Constants in UPPER_SNAKE_CASE
- Comprehensive JSDoc comments

### File Organization

- One class per file
- File name matches class name
- Index files for exports
- Related files in same directory

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Architecture Patterns

### Domain Models (Core)

Pure business logic with no external dependencies:

```javascript
export class Model {
  constructor(id, name, formatType) {
    this.id = id;
    this.name = name;
    this.formatType = formatType;
  }
  
  addSection(section) {
    // Business logic only
  }
}
```

### State Management

Centralized state with observer pattern:

```javascript
// Subscribe to changes
const unsubscribe = stateManager.subscribe(
  (state) => console.log(state),
  ['model']
);

// Update state
StateActions.setModel(model);
```

### Event Orchestration

All cross-layer communication through events:

```javascript
await eventOrchestrator.emit('section:select', { 
  sectionId: 'section_123' 
});
```

### UI Components

Component lifecycle and state subscription:

```javascript
export class MyComponent extends Component {
  render() {
    return this.createElement('div', 'my-component');
  }
  
  afterMount() {
    this.unsubscribe = stateManager.subscribe(
      this.handleStateChange.bind(this)
    );
  }
  
  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
```

## Adding Features

### New File Format

1. Create loader class:

```javascript
export class MyFormatLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedExtensions = ['myformat'];
  }
  
  async load(file) {
    // Parse file
    // Return Model instance
  }
}
```

2. Register in LoaderFactory:

```javascript
this.loaders = [
  // ... existing loaders
  new MyFormatLoader(),
];
```

### New UI Component

1. Create component class:

```javascript
export class MyComponent extends Component {
  render() {
    return this.createElement('div', 'my-component');
  }
}
```

2. Mount in Application:

```javascript
this.components.myComponent = new MyComponent();
this.components.myComponent.mount(container);
```

### New Event Handler

1. Register handler:

```javascript
this.registerHandler('my:event', this.handleMyEvent.bind(this));
```

2. Implement handler:

```javascript
async handleMyEvent({ payload }) {
  // Handle event
  StateActions.updateState(/* ... */);
}
```

## Testing

### Unit Tests

Test core domain logic and utilities:

```javascript
import { Model } from '../src/core/Model.js';

describe('Model', () => {
  it('should create model with valid properties', () => {
    const model = new Model('id', 'name', 'gltf');
    expect(model.id).toBe('id');
  });
});
```

### Integration Tests

Test layer interactions:

```javascript
describe('EventOrchestrator', () => {
  it('should update state on section selection', async () => {
    await orchestrator.emit('section:select', { sectionId: 'test' });
    const state = stateManager.getState();
    expect(state.selection.has('test')).toBe(true);
  });
});
```

## Debugging

### State Inspection

Access global app instance in console:

```javascript
// Check current state
console.log(window.app.stateManager.getState());

// Check loaded model
console.log(window.app.sceneManager);
```

### Event Tracing

Add logging to event orchestrator:

```javascript
async emit(eventName, payload) {
  console.log(`Event: ${eventName}`, payload);
  // ... rest of implementation
}
```

### Scene Inspection

Access Three.js scene:

```javascript
window.app.engine.scene
window.app.engine.camera
window.app.sceneManager.meshMap
```

## Performance Optimization

### State Updates

- Batch related updates
- Use skipHistory option for transient changes
- Filter subscriptions to specific paths

### Rendering

- Enable material caching
- Limit draw calls
- Use instancing for repeated geometry
- Implement level-of-detail (LOD)

### Memory Management

- Dispose geometries and materials
- Clear mesh map on model unload
- Unsubscribe from state changes
- Remove event listeners

## Build and Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` directory.

### Optimization

- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Deployment

Deploy `dist/` contents to static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Contributing

### Pull Request Process

1. Fork repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request

### Commit Messages

```
type(scope): brief description

Detailed explanation if needed

Closes #issue-number
```

Types: feat, fix, docs, style, refactor, test, chore

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [glTF Specification](https://www.khronos.org/gltf/)
- [Web Graphics Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
