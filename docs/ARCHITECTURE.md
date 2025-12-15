# Architecture Documentation

## System Overview

The Geometric Search application is built using clean architecture principles with clear separation between layers. This document provides a detailed overview of the system architecture.

## Layer Structure

### 1. Presentation Layer (UI)

**Location**: `src/ui/`

Components responsible for rendering and user interaction:

- **ModelTreeComponent** - Displays hierarchical model structure
- **PropertiesPanelComponent** - Shows properties of selected sections
- **ToolbarComponent** - Manages toolbar buttons and actions

**Responsibilities**:

- Render UI elements
- Handle direct user interactions
- Emit events to the event bus
- Subscribe to state changes for re-rendering

**Dependencies**: Event Bus, State Manager (read-only)

### 2. Application Layer

**Location**: `src/events/`, `src/domain/state-manager.js`

Orchestrates application flow and manages state:

- **EventBus** - Centralized event system for component communication
- **EventHandlers** - Coordinates actions between components
- **StateManager** - Centralized state store with immutable updates

**Responsibilities**:

- Coordinate between layers
- Manage application state
- Handle business workflows
- Enforce state consistency

**Dependencies**: Domain Layer, Infrastructure Layer

### 3. Domain Layer

**Location**: `src/domain/`

Core business logic and entities:

- **Model** - Represents a 3D model with metadata
- **Section** - Represents a part/component of a model
- **CameraState** - Camera position and settings
- **ViewportState** - Viewport configuration
- **SelectionState** - Selection and highlight state

**Responsibilities**:

- Define business entities
- Implement domain logic
- Validate business rules
- Remain framework-agnostic

**Dependencies**: None (pure domain logic)

### 4. Infrastructure Layer

**Location**: `src/rendering/`, `src/loaders/`

External systems and frameworks:

- **RenderEngine** - Three.js rendering abstraction
- **LoaderFactory** - Creates appropriate format loaders
- **GltfLoader, ObjLoader, StlLoader, StepLoader** - Format-specific parsers

**Responsibilities**:

- Interface with external libraries
- Handle file I/O
- Manage 3D rendering
- Parse various file formats

**Dependencies**: Three.js, external libraries

## Data Flow

### Unidirectional Flow

```
User Action
    ↓
UI Component
    ↓
Event Bus (emit event)
    ↓
Event Handlers (handle event)
    ↓
State Manager (dispatch action)
    ↓
State Update (immutable)
    ↓
Notify Subscribers
    ↓
UI Components Re-render
    ↓
Render Engine Updates
```

### Example: Loading a Model

```
1. User clicks "Upload" button
2. ToolbarComponent emits 'toolbar:upload' event
3. EventHandlers.handleFileUpload() executes
4. LoaderFactory selects appropriate loader
5. Loader parses file and creates domain model
6. RenderEngine loads 3D scene
7. StateManager receives 'MODEL_LOADED' action
8. State updates immutably
9. Components receive state change notification
10. UI re-renders with new model
```

## Design Patterns

### 1. Observer Pattern (Event Bus)

- Components observe events without direct coupling
- Allows dynamic subscription/unsubscription
- Supports multiple listeners per event

### 2. Factory Pattern (Loader Factory)

- Encapsulates loader creation logic
- Easy to add new format support
- Single point of format validation

### 3. Strategy Pattern (Loaders)

- Different strategies for different formats
- Common interface (BaseLoader)
- Runtime strategy selection

### 4. Singleton Pattern (State Manager)

- Single source of truth for state
- Prevents state inconsistencies
- Centralized state access

### 5. Facade Pattern (Render Engine)

- Simplifies Three.js complexity
- Provides clean API for rendering
- Hides implementation details

## State Management

### State Structure

```javascript
{
  model: Model | null,
  viewport: {
    width: number,
    height: number,
    fullscreen: boolean,
    camera: CameraState
  },
  selection: {
    selectedSections: string[],
    highlightedSections: string[],
    isolatedSections: string[]
  },
  ui: {
    loading: boolean,
    loadingMessage: string,
    expandedNodes: Set<string>,
    disassembled: boolean
  },
  history: {
    past: State[],
    future: State[]
  }
}
```

### Action Flow

```
Action Created
    ↓
Middleware Processing (optional)
    ↓
Reducer Function
    ↓
New State (immutable)
    ↓
History Recording
    ↓
Listeners Notified
```

### Immutability

State is never mutated directly. All updates create new state objects:

```javascript
// Bad - mutates state
state.selection.selectedSections.push(id);

// Good - creates new state
newState.selection = {
  ...state.selection,
  selectedSections: [...state.selection.selectedSections, id],
};
```

## Component Communication

### Event-Driven Architecture

Components communicate through events, not direct calls:

```javascript
// Component A emits event
eventBus.emit("tree:select", { sectionId: "abc" });

// Component B listens for event
eventBus.on("tree:select", ({ sectionId }) => {
  // Handle selection
});
```

### Benefits

- Loose coupling
- Testability
- Flexibility
- Maintainability

## Error Handling

### Centralized Error Handling

All errors are caught and handled consistently:

1. **Try-Catch Blocks** - Wrap risky operations
2. **Error Logging** - Console logging for debugging
3. **User Feedback** - Clear error messages to user
4. **Graceful Degradation** - Fallback behavior

### Example

```javascript
async handleFileUpload(file) {
  try {
    // Risky operation
    const result = await loader.load(data, file.name);
    // Success path
  } catch (error) {
    // Log for debugging
    console.error('Failed to load model:', error);

    // Update state
    this.stateManager.dispatch({
      type: 'MODEL_ERROR',
      payload: { error: error.message }
    });

    // User feedback
    throw error; // Re-throw for UI handling
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading** - Load modules and assets on demand
2. **Efficient Rendering** - requestAnimationFrame for smooth updates
3. **State Updates** - Batched updates to minimize re-renders
4. **Memory Management** - Proper cleanup and disposal
5. **Event Queue** - Sequential event processing prevents race conditions

### Render Optimization

```javascript
// Animation loop runs at 60 FPS
animate() {
  this.animationFrameId = requestAnimationFrame(() => this.animate());
  this.controls.update(); // Only if needed
  this.renderer.render(this.scene, this.camera);
}
```

## Testing Strategy

### Unit Testing

- Test domain models in isolation
- Test state manager reducer functions
- Test event handlers logic

### Integration Testing

- Test component interactions
- Test event flow
- Test state updates

### End-to-End Testing

- Test complete workflows
- Test file loading
- Test user interactions

## Extensibility

### Adding New Features

The architecture supports easy extension:

1. **New File Format**

   - Create new loader extending BaseLoader
   - Register with LoaderFactory
   - No changes to existing code

2. **New UI Component**

   - Create component class
   - Subscribe to relevant events
   - Emit events for actions
   - Subscribe to state changes

3. **New State Property**
   - Add to ApplicationState
   - Add reducer case
   - Create action creator
   - Components auto-update

## Security Considerations

1. **Input Validation** - Validate all file inputs
2. **XSS Prevention** - Sanitize user-generated content
3. **CORS** - Configure for production deployment
4. **Content Security Policy** - Restrict resource loading

## Deployment

### Build Process

```bash
npm run build
```

Creates optimized production build in `dist/`:

- Minified JavaScript
- Optimized assets
- Source maps for debugging

### Environment Configuration

Use environment variables for configuration:

- API endpoints
- Feature flags
- Analytics keys

### Hosting

Compatible with:

- Static hosting (Netlify, Vercel, GitHub Pages)
- CDN deployment
- Traditional web servers
