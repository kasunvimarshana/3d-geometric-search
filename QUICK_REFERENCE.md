# Quick Reference

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run format       # Format code
```

## Key Files

| File | Purpose |
|------|---------|
| `src/index.js` | Application entry point |
| `src/Application.js` | Main application orchestrator |
| `src/core/` | Domain models (Model, Section, Camera, Selection) |
| `src/state/` | State management |
| `src/engine/` | 3D rendering (Engine, SceneManager) |
| `src/loaders/` | File format loaders |
| `src/events/` | Event orchestration |
| `src/ui/` | UI components |

## Architecture Layers

```
UI Components
     ↕ (events)
Event Orchestrator
     ↕
State Manager ←→ Engine (3D) ←→ Scene Manager
     ↕                              ↕
Domain Models                   Three.js
```

## State Management

```javascript
// Get current state
const state = stateManager.getState();

// Subscribe to changes
const unsubscribe = stateManager.subscribe(
  (state) => { /* handle change */ },
  ['model', 'selection']
);

// Update state
StateActions.setModel(model);
StateActions.selectSection(sectionId);
```

## Events

```javascript
// Emit event
await eventOrchestrator.emit('section:select', { sectionId });

// Available events:
// - model:load, model:clear
// - section:select, section:deselect, section:highlight
// - section:focus, section:isolate, section:show-all
// - camera:reset, camera:fit
// - view:fullscreen, view:mode
// - model:disassemble, model:reassemble
// - ui:toggle-sidebar, ui:toggle-properties
```

## Adding New Loader

```javascript
// 1. Create loader
export class MyLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedExtensions = ['ext'];
  }
  
  async load(file) {
    // Parse and return Model
  }
}

// 2. Register in LoaderFactory
this.loaders.push(new MyLoader());
```

## Creating UI Component

```javascript
export class MyComponent extends Component {
  render() {
    return this.createElement('div', 'my-class');
  }
  
  afterMount() {
    // Setup subscriptions
    this.unsubscribe = stateManager.subscribe(...);
  }
  
  beforeUnmount() {
    // Cleanup
    if (this.unsubscribe) this.unsubscribe();
  }
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Fit to screen |
| `R` | Reset camera |
| `Esc` | Deselect / Exit fullscreen |

## Supported Formats

| Format | Extensions | Support Level |
|--------|-----------|---------------|
| glTF/GLB | `.gltf`, `.glb` | ✓ Full |
| OBJ/MTL | `.obj`, `.mtl` | ✓ Full |
| STL | `.stl` | ✓ Full |
| STEP | `.step`, `.stp` | ⚠ Partial |

## Debugging

```javascript
// Access app instance (browser console)
window.app

// Inspect state
window.app.stateManager.getState()

// Access 3D scene
window.app.engine.scene
window.app.engine.camera

// View loaded meshes
window.app.sceneManager.meshMap
```

## Common Tasks

### Load Model Programmatically
```javascript
const file = // File object
await window.app.loadFile(file);
```

### Select Section
```javascript
await window.app.eventOrchestrator.emit('section:select', { 
  sectionId: 'section_123' 
});
```

### Focus on Section
```javascript
await window.app.eventOrchestrator.emit('section:focus', { 
  sectionId: 'section_123' 
});
```

### Clear Model
```javascript
await window.app.eventOrchestrator.emit('model:clear');
```

## Project Structure

```
geometric-search/
├── src/
│   ├── core/           # Domain models
│   ├── state/          # State management
│   ├── engine/         # 3D rendering
│   ├── loaders/        # File loaders
│   ├── events/         # Event system
│   ├── ui/             # Components
│   ├── utils/          # Utilities
│   ├── styles/         # CSS
│   ├── Application.js  # Main app
│   └── index.js        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── *.md                # Documentation
```

## Documentation

| Document | Content |
|----------|---------|
| `README.md` | Quick start guide |
| `ARCHITECTURE.md` | Architecture details |
| `USER_GUIDE.md` | User instructions |
| `DEVELOPMENT.md` | Developer guide |
| `PROJECT_SUMMARY.md` | Complete overview |
| `QUICK_REFERENCE.md` | This file |

## Design Principles

- **SOLID**: Single responsibility, open/closed, etc.
- **DRY**: Don't repeat yourself
- **Separation of Concerns**: Clear layer boundaries
- **Clean Code**: Readable, maintainable, documented

## Performance Tips

- Material caching enabled
- Dispose geometries/materials when done
- Batch state updates when possible
- Use specific state subscriptions
- Limit model complexity (< 10k polygons ideal)

## Browser Requirements

- Chrome 90+, Edge 90+, Firefox 88+, Safari 14+
- WebGL 2.0 support required
- Modern JavaScript (ES6+)

## Code Style

- ES6+ modules
- camelCase for variables/functions
- PascalCase for classes
- UPPER_SNAKE_CASE for constants
- JSDoc comments
- 2-space indentation

## Error Handling

All operations include:
- Input validation
- Try-catch blocks
- Error state in StateManager
- User-friendly error messages
- Console logging for debugging

## Memory Management

Always cleanup:
- `component.unmount()` - removes listeners
- `engine.dispose()` - clears Three.js resources
- `unsubscribe()` - removes state subscriptions
- Material/geometry disposal

## Next Steps

1. Read `README.md` for quick start
2. Run `npm install && npm run dev`
3. Load a test model
4. Explore `USER_GUIDE.md` for features
5. Check `ARCHITECTURE.md` for details
6. See `DEVELOPMENT.md` for extending
