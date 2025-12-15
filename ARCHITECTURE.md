# Architecture Documentation

## Overview

This is a production-grade 3D geometric search application built with clean architecture principles. The system is designed for stability, maintainability, and scalability.

## Core Principles

### SOLID Principles

- **Single Responsibility**: Each module has one clear purpose
- **Open/Closed**: Components are extensible without modification
- **Liskov Substitution**: All loaders implement the same interface
- **Interface Segregation**: Focused, minimal interfaces
- **Dependency Inversion**: Depend on abstractions, not concretions

### Design Patterns

- **Factory Pattern**: LoaderFactory for creating format loaders
- **Observer Pattern**: Event system for loose coupling
- **Singleton Pattern**: StateManager, EventDispatcher
- **Strategy Pattern**: Different loaders for different formats

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│                 Presentation Layer              │
│  (UI Components, User Interactions)             │
│  - SectionTree                                  │
│  - PropertiesPanel                              │
│  - Button handlers                              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│             Application Layer                   │
│  (Orchestration, Event Handling)                │
│  - Application (main.js)                        │
│  - EventDispatcher                              │
│  - StateManager                                 │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│              Domain Layer                       │
│  (Business Logic, Core Models)                  │
│  - Model3D, ModelNode types                     │
│  - GeometricFeatures                            │
│  - Model utilities                              │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│          Infrastructure Layer                   │
│  (External Services, I/O)                       │
│  - Loaders (glTF, OBJ, STL)                     │
│  - SceneRenderer (Three.js)                     │
│  - SearchEngine                                 │
└─────────────────────────────────────────────────┘
```

## Module Structure

### Core (`/src/core`)

Domain models and business logic, independent of UI and infrastructure.

**Files:**

- `types.js` - Core type definitions and factory functions
- `modelUtils.js` - Tree traversal and manipulation utilities
- `geometricFeatures.js` - Shape descriptor extraction

**Responsibilities:**

- Define domain models
- Provide pure functions for model manipulation
- Extract geometric features for search

### Events (`/src/events`)

Centralized event system for decoupled communication.

**Files:**

- `EventDispatcher.js` - Event bus with validation
- `validators.js` - Event payload validation

**Key Features:**

- Type-safe event dispatch
- Payload validation
- Event history tracking
- Prevention of cascading side effects
- Graceful error handling

### State (`/src/state`)

Immutable state management with centralized updates.

**Files:**

- `StateManager.js` - State container with subscription
- `actions.js` - Action creators for state transitions

**Key Features:**

- Single source of truth
- Immutable updates
- State validation
- History tracking
- Reactive UI updates

### Loaders (`/src/loaders`)

Format-specific parsers following Strategy pattern.

**Files:**

- `BaseLoader.js` - Abstract base class
- `GltfLoader.js` - glTF/GLB support
- `ObjLoader.js` - OBJ support
- `StlLoader.js` - STL support
- `StepLoader.js` - STEP placeholder
- `LoaderFactory.js` - Factory for loader selection

**Extension:**
To add a new format:

1. Create new loader extending BaseLoader
2. Implement `load()` and `parse()` methods
3. Register in LoaderFactory

### Renderer (`/src/renderer`)

Three.js integration and 3D visualization.

**Files:**

- `SceneRenderer.js` - Scene management and rendering

**Responsibilities:**

- Initialize Three.js scene
- Handle camera controls
- Apply visual effects (highlighting, isolation)
- Process user interactions (clicking, selecting)

### UI (`/src/ui`)

Presentation components with minimal coupling.

**Files:**

- `SectionTree.js` - Hierarchical model browser
- `PropertiesPanel.js` - Property inspector

**Characteristics:**

- Pure presentation logic
- State-driven rendering
- Event-driven updates

### Utils (`/src/utils`)

Cross-cutting concerns and helpers.

**Files:**

- `InteractionManager.js` - Disassembly, isolation logic
- `SearchEngine.js` - Geometric similarity search

## Event Flow

### Model Loading

```
User uploads file
     ↓
Application.loadModelFile()
     ↓
LoaderFactory.loadModel()
     ↓
dispatch(MODEL_LOAD_SUCCESS)
     ↓
StateManager.setModel()
     ↓
UI components re-render
     ↓
SceneRenderer.loadModel()
```

### Node Selection

```
User clicks node in tree
     ↓
SectionTree.onNodeClick()
     ↓
actions.selectNodes()
     ↓
StateManager.setSelection()
     ↓
dispatch(SELECTION_CHANGE)
     ↓
Application.onSelectionChange()
     ↓
PropertiesPanel.render()
     ↓
SectionTree.highlightNodes()
```

### Disassembly

```
User clicks Disassemble
     ↓
Application.disassemble()
     ↓
InteractionManager.disassemble()
     ↓
dispatch(DISASSEMBLE)
     ↓
StateManager.setDisassembled(true)
     ↓
UI updates (button states)
```

## Error Handling

### Validation Layers

1. **Event Validation**: Events are validated before dispatch
2. **State Validation**: State updates are validated before commit
3. **Payload Validation**: Required fields are checked
4. **Type Safety**: Runtime type checking where appropriate

### Error Recovery

- Errors don't crash the application
- Invalid operations are rejected gracefully
- User is notified via error overlay
- State remains consistent

### Error Flow

```
Error occurs
     ↓
Try-catch boundary
     ↓
normalizeError()
     ↓
dispatch(ERROR)
     ↓
StateManager.setError()
     ↓
UI shows error overlay
     ↓
User dismisses
     ↓
StateManager.clearError()
```

## State Management

### State Structure

```javascript
{
  model: Model3D | null,
  selectedNodeIds: string[],
  focusedNodeId: string | null,
  highlightedNodeIds: string[],
  isolatedNodeId: string | null,
  isDisassembled: boolean,
  isFullscreen: boolean,
  isLoading: boolean,
  error: string | null,
  searchResults: Array,
  viewMode: string
}
```

### Update Pattern

```javascript
// Read
const state = stateManager.getState();

// Update (immutable)
stateManager.setState({
  selectedNodeIds: [...newSelection],
});

// Subscribe
const unsubscribe = stateManager.subscribe((state) => {
  updateUI(state);
});
```

## Testing Strategy

### Unit Tests

- Core utilities (traversal, bounds calculation)
- Event validation
- State transitions
- Geometric feature extraction

### Integration Tests

- Loader → Model conversion
- Event → State → UI updates
- User interactions → State changes

### E2E Tests

- File upload → Display
- Node selection → Property display
- Disassembly → Visual update

## Performance Considerations

### Optimization Points

1. **Event Queue**: Prevents recursion in event handling
2. **Lazy Rendering**: Components only render when state changes
3. **Tree Virtualization**: (Future) For large hierarchies
4. **Feature Caching**: Geometric features cached after extraction
5. **Three.js Optimization**: Reuse materials, minimize draw calls

### Scalability

- Handles models with 1000+ nodes efficiently
- Search index supports 100+ models
- Event history limited to prevent memory growth
- State history limited to 50 entries

## Security Considerations

1. **File Validation**: Check file types before loading
2. **Event Whitelisting**: Only known event types are processed
3. **State Validation**: Prevent invalid state transitions
4. **Error Sanitization**: Don't expose stack traces to users
5. **XSS Prevention**: No innerHTML with user data

## Extensibility

### Adding New Features

#### New Event Type

```javascript
// 1. Add to EventType enum
export const EventType = {
  // ...
  NEW_EVENT: "new:event",
};

// 2. Add validation schema
const EventSchemas = {
  [EventType.NEW_EVENT]: ["requiredField"],
};

// 3. Listen for event
on(EventType.NEW_EVENT, (event) => {
  // Handle event
});
```

#### New File Format

```javascript
// 1. Create loader
class NewFormatLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = ["newformat"];
  }

  async load(file) {
    // Implementation
  }
}

// 2. Register in factory
const loaders = [
  // ...
  new NewFormatLoader(),
];
```

#### New UI Component

```javascript
export class NewComponent {
  constructor(container) {
    this.container = container;
  }

  render(data) {
    // Render logic
  }
}

// Integrate in Application
this.newComponent = new NewComponent(element);
```

## Future Enhancements

### Planned Features

1. **Undo/Redo**: Event sourcing for time travel
2. **WebWorker Search**: Offload search to background thread
3. **Persistent State**: Save/restore workspace
4. **Collaborative Editing**: Real-time multi-user
5. **Advanced Search**: Filters, tags, metadata
6. **Export Options**: Screenshot, measurements
7. **STEP Support**: Full opencascade.js integration
8. **Annotations**: Add notes to models
9. **Comparison View**: Side-by-side model comparison
10. **Cloud Storage**: Save models to cloud

## Maintenance Guidelines

### Code Quality

- Follow ESLint rules
- Maintain test coverage > 80%
- Document complex algorithms
- Use TypeScript for type safety (future)

### Versioning

- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog for all releases
- Migration guides for breaking changes

### Dependencies

- Keep dependencies up to date
- Audit for security vulnerabilities
- Minimize dependency count
- Lock versions for stability

## Deployment

### Build Process

```bash
npm install
npm run build
npm run preview  # Test production build
```

### Environment Variables

- None required for basic operation
- Optional: API endpoints for cloud features

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Budget

- Initial load: < 3s
- Time to interactive: < 5s
- Bundle size: < 1MB (excluding Three.js)

## Troubleshooting

### Common Issues

**Model not loading**

- Check file format is supported
- Verify file is not corrupted
- Check browser console for errors

**Slow performance**

- Model too large (> 100k vertices)
- Browser hardware acceleration disabled
- Too many nodes in hierarchy

**Selection not working**

- Check event listeners are registered
- Verify state is updating
- Check Three.js raycasting

## Conclusion

This architecture provides a solid foundation for a production 3D application. It's:

- **Maintainable**: Clear structure, separation of concerns
- **Testable**: Decoupled components, pure functions
- **Scalable**: Can handle growth in complexity and data
- **Robust**: Graceful error handling, validated state
- **Extensible**: Easy to add features without breaking existing code
