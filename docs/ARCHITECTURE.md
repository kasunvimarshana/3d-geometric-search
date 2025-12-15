# Architecture Documentation

## Overview

This 3D Model Viewer is built with clean architecture principles, ensuring maintainability, testability, and extensibility.

## Architecture Layers

### 1. Core Domain Layer (`src/core/`)

**Entities:**

- `Model`: Represents a 3D model with sections and metadata
- `Section`: Represents a part or assembly section
- `ViewState`: Camera and view configuration
- `Selection`: Selection and highlighting state

**Services:**

- `ModelService`: Business logic for model operations
- `SelectionService`: Business logic for selection operations

**Key Principles:**

- Pure domain logic, no dependencies on UI or infrastructure
- Immutable entities with clone methods
- Clear business rules and validations

### 2. Engine Layer (`src/engine/`)

**Components:**

- `Renderer`: Three.js renderer setup and management
- `SceneManager`: Scene graph and helper management
- `CameraController`: Camera positioning and controls
- `InteractionManager`: Raycasting and user interactions
- `ModelRenderer`: Visual representation of models

**Key Principles:**

- Encapsulates all Three.js logic
- Provides clean API to application layer
- Manages 3D resources and lifecycle

### 3. State Management Layer (`src/state/`)

**Components:**

- `Store`: Observable state container
- `ApplicationState`: State structure definition
- `StateActions`: State mutation operations

**Key Principles:**

- Centralized state management
- Unidirectional data flow
- Immutable state updates
- History support (undo/redo)

### 4. Event Orchestration Layer (`src/events/`)

**Components:**

- `EventBus`: Pub/sub event system
- `EventTypes`: Event type definitions
- `EventOrchestrator`: Event validation and error handling

**Key Principles:**

- Decoupled communication
- Centralized error handling
- Event logging and debugging

### 5. UI Layer (`src/ui/`)

**Components:**

- `UIController`: Main UI orchestrator
- `HierarchyTree`: Model hierarchy visualization
- `PropertiesPanel`: Section property display
- `StatisticsPanel`: Model statistics display

**Key Principles:**

- Component-based architecture
- Separation from business logic
- Event-driven updates

### 6. Loaders Layer (`src/loaders/`)

**Components:**

- `GLTFModelLoader`: glTF/GLB format support
- `OBJModelLoader`: OBJ/MTL format support
- `STLModelLoader`: STL format support
- `STEPModelLoader`: STEP format support (placeholder)
- `ModelLoaderFactory`: Loader selection

**Key Principles:**

- Format-agnostic loading interface
- Extensible loader system
- Error handling and validation

## Data Flow

```
User Action → Event Bus → Application Logic → State Update → UI Update
                ↓                                    ↓
          Engine Updates                      Visual Updates
```

## Key Design Patterns

### 1. **Observer Pattern**

- State changes notify subscribers
- Event bus for decoupled communication

### 2. **Factory Pattern**

- ModelLoaderFactory for loader creation
- Material factory in ModelRenderer

### 3. **Strategy Pattern**

- Different loaders for different formats
- Pluggable rendering strategies

### 4. **Facade Pattern**

- Application class as main facade
- UIController as UI facade

### 5. **Command Pattern**

- StateActions for state mutations
- Event handlers as commands

## SOLID Principles Application

### Single Responsibility Principle

- Each class has one reason to change
- Clear separation of concerns

### Open/Closed Principle

- Easy to add new loaders
- Easy to add new UI components
- Event system allows extensions

### Liskov Substitution Principle

- All loaders implement same interface
- Components are interchangeable

### Interface Segregation Principle

- Focused interfaces for each component
- No unnecessary dependencies

### Dependency Inversion Principle

- High-level modules depend on abstractions
- Event bus decouples components

## Testing Strategy

### Unit Tests

- Core entities and services
- State management
- Validation logic

### Integration Tests

- Event flow
- State updates
- UI synchronization

### E2E Tests

- File upload
- Model viewing
- User interactions

## Performance Considerations

### Rendering

- Efficient Three.js scene graph
- Level of detail (LOD) support
- Frustum culling
- Object pooling for reuse

### State Management

- Efficient immutable updates
- Selective re-renders
- History size limits

### File Loading

- Async loading
- Progress reporting
- Resource cleanup

## Extensibility Points

### Adding New Format Support

1. Create new loader class
2. Implement load method
3. Add to ModelLoaderFactory
4. Update documentation

### Adding New UI Components

1. Create component class
2. Register in UIController
3. Subscribe to relevant events
4. Update state subscribers

### Adding New Features

1. Define new events
2. Create event handlers
3. Update state structure
4. Implement UI updates

## Security Considerations

- File type validation
- Size limits
- Content validation
- XSS prevention
- CORS handling

## Future Enhancements

1. **STEP Format Support**
   - Integrate OpenCascade.js
   - Assembly hierarchy parsing
   - PMI data extraction

2. **Advanced Features**
   - Measurement tools
   - Section cuts
   - Annotations
   - Comparison mode

3. **Performance**
   - Web Workers for parsing
   - Streaming loading
   - Progressive rendering

4. **Collaboration**
   - Multi-user viewing
   - Annotations sharing
   - Version control
