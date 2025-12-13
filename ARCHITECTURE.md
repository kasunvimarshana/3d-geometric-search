# Architecture Documentation

## Overview

The 3D Geometric Search application follows clean architecture principles with clear separation of concerns. The codebase is organized into distinct layers, each with a single responsibility.

## Architecture Layers

### 1. Domain Layer (`geometryAnalyzer.js`)
**Responsibility**: Core business logic for 3D geometry analysis

- Analyzes geometric features (vertices, faces, volume, bounding box)
- Calculates geometric properties
- Finds similar models based on feature comparison
- Pure functions with no external dependencies

### 2. Infrastructure Layer

#### `modelLoader.js`
- Loads 3D model files (glTF/GLB, OBJ/MTL, STL)
- Handles file parsing and format conversion
- Creates model thumbnails
- Integrates with Three.js loaders

#### `exportManager.js`
- Exports analysis data to JSON/CSV
- Generates HTML reports
- Handles file downloads
- Formats data for external use

### 3. Presentation Layer

#### `viewer.js`
- Manages Three.js 3D viewport
- Handles camera controls and interactions
- Implements lighting and rendering
- Provides visualization controls (zoom, rotate, wireframe, etc.)
- Manages object selection and highlighting

#### `app.js`
- Main application controller
- Coordinates between modules
- Manages application state (model library, current model, results)
- Orchestrates model loading and analysis workflow

#### `eventHandler.js`
- Centralized event management
- Maps UI events to application actions
- Handles keyboard shortcuts
- Implements drag-and-drop file upload

### 4. Utilities

#### `eventBus.js`
- Global event bus for cross-component communication
- Supports event wildcards and namespacing
- Includes EventHandlerManager for DOM event tracking
- Automatic cleanup to prevent memory leaks

#### `sectionManager.js`
- Manages UI section visibility
- Handles section loading state
- Provides section lifecycle hooks
- Supports lazy loading patterns

#### `utils.js`
- Common utility functions
- Toast notifications
- File validation
- Format helpers

#### `config.js`
- Centralized configuration
- Viewer settings
- Lighting configuration
- Analysis parameters

## Data Flow

```
User Input (File Upload)
    ↓
EventHandler (handles upload event)
    ↓
App (coordinates loading)
    ↓
ModelLoader (loads 3D file)
    ↓
GeometryAnalyzer (analyzes features)
    ↓
App (stores in library, updates UI)
    ↓
Viewer3D (displays model)
    ↓
GeometryAnalyzer (finds similar models)
    ↓
App (displays results)
```

## Key Design Patterns

### 1. Single Responsibility Principle
Each module has one clear purpose:
- `geometryAnalyzer.js`: Analyze geometry
- `modelLoader.js`: Load models
- `viewer.js`: Display 3D content
- `eventHandler.js`: Handle events

### 2. Dependency Injection
Dependencies are passed to constructors:
```javascript
class App {
  constructor() {
    this.viewer = new Viewer3D("viewer");
    this.eventHandler = new EventHandler(this);
  }
}
```

### 3. Event-Driven Architecture
Components communicate via events:
- EventBus for global events
- EventHandlerManager for DOM events
- Custom events for component interactions

### 4. Separation of Concerns
Clear boundaries between:
- Domain logic (geometry analysis)
- Infrastructure (file I/O, rendering)
- Presentation (UI, interactions)
- Utilities (helpers, configuration)

## Module Dependencies

```
app.js
  ├─ viewer.js (Three.js integration)
  ├─ modelLoader.js (file loading)
  ├─ geometryAnalyzer.js (analysis)
  ├─ exportManager.js (export)
  ├─ eventHandler.js (events)
  ├─ utils.js (utilities)
  └─ config.js (configuration)

viewer.js
  ├─ three (Three.js library)
  ├─ three/addons/controls/OrbitControls
  └─ config.js

eventHandler.js
  └─ app.js (application reference)

All modules can access:
  ├─ eventBus.js (global event bus)
  └─ sectionManager.js (UI sections)
```

## State Management

State is managed at the application level in `app.js`:

```javascript
{
  modelLibrary: {},        // All loaded models
  currentModelName: null,  // Active model
  similarityResults: []    // Search results
}
```

No global state - all state is encapsulated within the App instance.

## Event Flow

### File Upload Flow
1. User selects file → `eventHandler.js`
2. Handler calls `app.handleFiles()`
3. App calls `modelLoader.loadModel()`
4. Loader returns model object
5. App calls `geometryAnalyzer.analyzeGeometry()`
6. Analyzer returns features
7. App stores in `modelLibrary`
8. App calls `viewer.loadModel()`
9. App calls `updateLibraryGrid()`
10. App calls `findSimilarModels()`

### Viewer Interaction Flow
1. User clicks viewer control → `eventHandler.js`
2. Handler calls viewer method (e.g., `viewer.zoomIn()`)
3. Viewer updates camera/scene
4. Viewer emits events if needed
5. UI updates (e.g., zoom indicator)

## Extension Points

### Adding New Model Formats
1. Add loader in `modelLoader.js`
2. Update `Config.modelLoader.supportedFormats`
3. No other changes needed

### Adding New Analysis Features
1. Add analysis method in `geometryAnalyzer.js`
2. Update feature comparison in `findSimilar()`
3. Update UI display if needed

### Adding New Viewer Controls
1. Add control in HTML
2. Add handler in `eventHandler.js`
3. Add method in `viewer.js`

### Adding New Export Formats
1. Add export method in `exportManager.js`
2. Add UI button/handler
3. No other changes needed

## Performance Considerations

1. **Model Loading**: Asynchronous to prevent UI blocking
2. **Analysis**: Runs once per model, cached in library
3. **Rendering**: Continuous animation loop with requestAnimationFrame
4. **Event Handling**: Throttled for expensive operations
5. **Memory Management**: EventHandlerManager tracks and cleans up listeners

## Testing Strategy

### Unit Testing
- Test `geometryAnalyzer.js` methods independently
- Test utility functions in `utils.js`
- Mock dependencies for isolated testing

### Integration Testing
- Test file upload workflow end-to-end
- Test similarity search with multiple models
- Test viewer controls and interactions

### Manual Testing
- Upload various file formats
- Test all viewer controls
- Verify keyboard shortcuts
- Check responsive design

## Maintenance Guidelines

1. **Keep modules focused**: Each module should have one clear responsibility
2. **Minimize dependencies**: Reduce coupling between modules
3. **Use configuration**: Avoid hardcoded values
4. **Document public APIs**: Use JSDoc for exported functions
5. **Clean up resources**: Always remove event listeners when done
6. **Follow naming conventions**: Clear, descriptive names
7. **Avoid global state**: Keep state in appropriate modules

## Future Improvements

1. **State Management**: Consider adding a formal state management library for complex state
2. **Type Safety**: Add TypeScript for better type checking
3. **Testing**: Add comprehensive test suite
4. **Performance**: Implement Web Workers for heavy computations
5. **Features**: Add undo/redo, model comparison, advanced search filters
