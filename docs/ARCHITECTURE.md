# Architecture Overview

## Clean Architecture Principles

This application follows Clean Architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer (UI)                      │
│  - Components, Views, Presenters                     │
├─────────────────────────────────────────────────────┤
│              Application Layer (Core)                │
│  - Use Cases, Orchestration, State Management        │
├─────────────────────────────────────────────────────┤
│               Domain Layer (Domain)                  │
│  - Entities, Value Objects, Interfaces               │
├─────────────────────────────────────────────────────┤
│          Infrastructure Layer (Infrastructure)       │
│  - External Services, File I/O, Rendering            │
└─────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain Layer (`src/domain/`)

- **Types** (`types.ts`): Core domain entities and value objects
- **Events** (`events.ts`): Domain events for event-driven architecture
- **Interfaces** (`interfaces.ts`): Contracts for infrastructure implementations

**Key Principles:**

- No dependencies on other layers
- Pure business logic
- Framework-agnostic
- Highly testable

### Application Layer (`src/core/`)

- **Application** (`Application.ts`): Main orchestrator (Facade pattern)
- **StateManager** (`StateManager.ts`): Centralized state management (Observer pattern)
- **EventBus** (`EventBus.ts`): Event orchestration (Pub-Sub pattern)
- **ModelRepository** (`ModelRepository.ts`): Model storage (Repository pattern)
- **SectionManager** (`SectionManager.ts`): Section hierarchy management

**Key Principles:**

- Coordinates between layers
- Implements use cases
- Manages application state
- Handles cross-cutting concerns

### Infrastructure Layer (`src/infrastructure/`)

- **Loaders** (`loaders/`): Format-specific model loaders (Strategy pattern)
  - `GLTFModelLoader.ts`: glTF/GLB support
  - `OBJModelLoader.ts`: OBJ/MTL support
  - `STLModelLoader.ts`: STL support
  - `ModelLoaderFactory.ts`: Loader selection (Factory pattern)
- **Renderer** (`ThreeRenderer.ts`): 3D visualization with Three.js
- **AnimationController** (`AnimationController.ts`): Model animations
- **FileHandler** (`FileHandler.ts`): File operations and format detection

**Key Principles:**

- Implements domain interfaces
- Handles external dependencies
- No business logic
- Easy to swap implementations

### UI Layer (`src/ui/`)

- **Components** (`components/`): Reusable UI components
  - `UIComponent.ts`: Base component class
  - `Toolbar.ts`: Main toolbar controls
  - `SectionPanel.ts`: Model hierarchy display
  - `StatusBar.ts`: Status and error messages
  - `ViewerContainer.ts`: 3D viewer container

**Key Principles:**

- Presentational components
- Minimal business logic
- Reusable and composable
- Responsive design

### Utilities Layer (`src/utils/`)

- **VectorUtils**: Vector mathematics
- **ValidationUtils**: Input validation
- **Logger**: Logging utilities
- **PerformanceUtils**: Performance measurement and optimization

## Design Patterns Used

### Creational Patterns

- **Factory Pattern**: `ModelLoaderFactory` creates appropriate loaders
- **Singleton Pattern**: `Logger` instance management

### Structural Patterns

- **Facade Pattern**: `Application` simplifies complex subsystems
- **Repository Pattern**: `ModelRepository` abstracts data access

### Behavioral Patterns

- **Observer Pattern**: `StateManager` and `EventBus` for reactive updates
- **Strategy Pattern**: `IModelLoader` implementations for different formats
- **Command Pattern**: Events represent actions in the system

## Data Flow

```
User Action
    ↓
UI Component
    ↓
Event Bus ←→ Application Orchestrator ←→ State Manager
    ↓              ↓                          ↓
Infrastructure   Core Services           UI Updates
```

## Event Flow

1. **User Interaction** → UI Component emits event
2. **Event Bus** → Receives and queues event
3. **Event Handlers** → Process event based on type
4. **State Update** → Update application state
5. **State Subscribers** → React to state changes
6. **UI Update** → Reflect changes in the interface

## State Management

- **Immutable State**: All state updates create new state objects
- **Single Source of Truth**: Centralized in `StateManager`
- **Reactive Updates**: Components subscribe to state changes
- **Time-Travel Debugging**: State history can be tracked

## Extension Points

### Adding New File Formats

1. Implement `IModelLoader` interface
2. Register loader in `ModelLoaderFactory`
3. Add format to `ModelFormat` enum

### Adding New Features

1. Define domain events in `events.ts`
2. Implement event handlers in `Application.ts`
3. Update state structure if needed
4. Add UI components for interaction

### Adding New UI Components

1. Extend `UIComponent` base class
2. Implement `update()` method
3. Mount component in `Application.ts`

## Testing Strategy

### Unit Tests

- Domain logic (pure functions)
- Utility functions
- Individual loaders

### Integration Tests

- Event flow
- State management
- Component interactions

### E2E Tests

- Complete workflows
- File loading
- User interactions

## Performance Considerations

- **Lazy Loading**: Load models on demand
- **Debouncing**: Throttle frequent events
- **Memoization**: Cache expensive computations
- **Virtual Scrolling**: Large section lists
- **Web Workers**: Heavy processing off main thread

## Security Considerations

- **File Validation**: Check file types and sizes
- **Input Sanitization**: Validate all user inputs
- **Error Boundaries**: Graceful error handling
- **Content Security Policy**: Prevent XSS attacks
