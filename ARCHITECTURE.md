# Architecture Documentation

## Overview

This application follows clean architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer                          │
│  (Components, Views, User Interactions)             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Event Orchestrator                     │
│  (Centralized Event Handling & Coordination)        │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐  ┌──────▼──────┐  ┌──▼─────┐
│ State  │  │   Engine    │  │ Domain │
│Manager │  │  (3D Scene) │  │ Models │
└────────┘  └─────────────┘  └────────┘
```

## Layer Responsibilities

### Core Domain Layer (`src/core/`)
- **Model**: Domain entity for 3D models
- **Section**: Hierarchical component structure
- **Camera**: Camera state and positioning
- **Selection**: Selection state management

Pure business logic with no external dependencies.

### State Layer (`src/state/`)
- **StateManager**: Centralized state container with observer pattern
- **StateActions**: Action creators for state mutations

Single source of truth for application state.

### Engine Layer (`src/engine/`)
- **Engine**: Three.js renderer and scene management
- **SceneManager**: Bridge between domain models and 3D scene

Handles all 3D rendering concerns.

### Loaders Layer (`src/loaders/`)
- **BaseLoader**: Abstract loader interface
- **GLTFLoader**: glTF/GLB format support
- **OBJLoader**: OBJ/MTL format support
- **STLLoader**: STL format support
- **STEPLoader**: STEP format support (partial)
- **LoaderFactory**: Loader selection and creation

File format parsing and model conversion.

### Events Layer (`src/events/`)
- **EventOrchestrator**: Centralized event coordination

Coordinates interactions between layers.

### UI Layer (`src/ui/`)
- **Component**: Base component class
- **Toolbar**: Action buttons and controls
- **SectionTree**: Hierarchical section display
- **PropertiesPanel**: Selected section properties
- **Viewer**: 3D canvas container
- **LoadingOverlay**: Loading state indicator

User interface and interactions.

### Utils Layer (`src/utils/`)
- Helper functions
- Validators
- Common utilities

## Data Flow

### Unidirectional Flow

1. **User Action** → UI Component
2. **UI Component** → Event Orchestrator
3. **Event Orchestrator** → State/Engine updates
4. **State Change** → Notify Subscribers
5. **Subscribers** → Update UI

### State Subscription

```javascript
stateManager.subscribe((state, prevState) => {
  // React to state changes
}, ['model', 'selection']);
```

## Key Design Principles

1. **SOLID Principles**
   - Single Responsibility: Each class has one clear purpose
   - Open/Closed: Extensible through inheritance
   - Liskov Substitution: Loaders are interchangeable
   - Interface Segregation: Small, focused interfaces
   - Dependency Inversion: Depend on abstractions

2. **DRY (Don't Repeat Yourself)**
   - Shared utilities in utils/
   - Base classes for common functionality
   - Centralized state management

3. **Separation of Concerns**
   - Clear boundaries between layers
   - No direct dependencies across layers
   - Event orchestrator as mediator

4. **Clean Code**
   - Clear naming conventions
   - Small, focused functions
   - Comprehensive documentation
   - Type validation

## Extension Points

### Adding New File Format

1. Create loader extending `BaseLoader`
2. Implement `load()` method
3. Convert to domain `Model`
4. Register in `LoaderFactory`

### Adding New Feature

1. Add state properties if needed
2. Create state actions
3. Add event handlers in orchestrator
4. Create/update UI components
5. Wire through Application class

### Adding New UI Component

1. Extend `Component` base class
2. Implement `render()` method
3. Subscribe to state changes
4. Emit events through orchestrator
5. Mount in Application

## Testing Strategy

- **Unit Tests**: Core domain models, state manager, utilities
- **Integration Tests**: Event orchestration, loader factory
- **E2E Tests**: Full user workflows
- **Visual Tests**: 3D rendering and UI components

## Performance Considerations

- Material caching in SceneManager
- Debounced/throttled event handlers
- Lazy loading for large models
- Efficient state updates with change detection
- WebGL optimizations in Engine
