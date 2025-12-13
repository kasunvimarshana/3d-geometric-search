# Architecture Documentation

## Overview

The 3D Geometric Search application is built with a clean, modular architecture that emphasizes maintainability, testability, and extensibility.

## Core Principles

### SOLID Principles

1. **Single Responsibility Principle (SRP)**
   - Each class has one reason to change
   - `ModelLoaderService`: Only responsible for loading models
   - `SectionManagerService`: Only responsible for section management
   - `ViewerController`: Only responsible for 3D rendering

2. **Open/Closed Principle (OCP)**
   - Open for extension, closed for modification
   - New model formats can be added by extending `IModelLoader`
   - New section behaviors can be added without modifying existing code

3. **Liskov Substitution Principle (LSP)**
   - Interfaces can be substituted with implementations
   - `IModelLoader`, `ISectionManager`, `IEventHandler` can be swapped

4. **Interface Segregation Principle (ISP)**
   - Clients don't depend on interfaces they don't use
   - Separate interfaces for different concerns

5. **Dependency Inversion Principle (DIP)**
   - High-level modules depend on abstractions
   - `ApplicationController` depends on interfaces, not concrete implementations

## Layered Architecture

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                 │
│  (UI Components, Event Handlers)             │
├─────────────────────────────────────────────┤
│          Application Layer                   │
│  (Controllers, State Management)             │
├─────────────────────────────────────────────┤
│           Business Logic Layer               │
│  (Services, Section Management)              │
├─────────────────────────────────────────────┤
│            Domain Layer                      │
│  (Models, Interfaces, Constants)             │
├─────────────────────────────────────────────┤
│         Infrastructure Layer                 │
│  (Repositories, External Libraries)          │
└─────────────────────────────────────────────┘
```

## Component Responsibilities

### Controllers

**ApplicationController**
- Orchestrates all subsystems
- Handles user interactions
- Coordinates state changes
- Acts as a facade for the entire application

**ViewerController**
- Manages Three.js scene
- Handles 3D rendering
- Controls camera and lighting
- Manages animation loop

**UIController**
- Manages DOM interactions
- Updates UI based on state changes
- Handles user input events
- Renders section tree

### Core Systems

**EventBus**
- Centralized event management
- Implements Observer pattern
- Decouples components
- Enables reactive programming

**StateManager**
- Single source of truth
- Immutable state updates
- State history tracking
- Event emission on changes

### Services

**ModelLoaderService**
- Loads 3D models
- Handles different formats
- Caches loaded models
- Creates fallback geometry

**SectionManagerService**
- Manages section hierarchy
- Handles isolation and highlighting
- Maintains mesh-to-section mapping
- Preserves original materials

### Repositories

**ModelRepository**
- Manages available models
- Creates sections from objects
- Acts as data access layer
- Could be extended to fetch from API

### Domain

**Models**
- `Model`: Represents a 3D model
- `Section`: Represents a model section
- `ViewerState`: Application state
- Interfaces for services

**Constants**
- Event names
- Configuration values
- Color schemes
- Default settings

## Data Flow

```
User Action
    ↓
UI Controller
    ↓
Application Controller
    ↓
State Manager → Event Bus
    ↓              ↓
Services    Subscribers
    ↓              ↓
Viewer      UI Updates
```

## Event Flow

1. User interacts with UI
2. UI Controller emits event or updates state
3. State Manager updates state and emits STATE_CHANGED
4. Event Bus notifies all subscribers
5. Services and Controllers react to events
6. UI and Viewer are updated

## State Management

The application uses a centralized state management approach:

- All state lives in `StateManager`
- State is updated through explicit methods
- Changes trigger events
- Components subscribe to relevant events
- No direct state mutation

## Extension Points

### Adding New Model Formats

1. Extend `IModelLoader`
2. Implement `load()` method
3. Register in `ModelLoaderService`

### Adding New Section Behaviors

1. Add methods to `SectionManagerService`
2. Update `Section` model if needed
3. Add UI controls in `UIController`
4. Wire up in `ApplicationController`

### Adding New UI Components

1. Create component in `src/ui/`
2. Subscribe to relevant events
3. Update state through `StateManager`
4. Add styles to `main.css`

## Testing Strategy

### Unit Tests
- Test individual services in isolation
- Mock dependencies
- Test state management logic
- Test event bus behavior

### Integration Tests
- Test controller coordination
- Test state flow
- Test event propagation
- Test UI updates

### End-to-End Tests
- Test complete user workflows
- Test model loading
- Test section interactions
- Test navigation

## Performance Optimizations

1. **Model Caching**: Loaded models are cached
2. **Material Reuse**: Original materials are cloned, not recreated
3. **Efficient Rendering**: Single animation loop
4. **Event Debouncing**: State changes are batched
5. **Lazy Loading**: Models loaded on demand

## Security Considerations

1. **Input Validation**: Model IDs are validated
2. **Error Handling**: All async operations have error handling
3. **Resource Cleanup**: Proper disposal of Three.js objects
4. **XSS Prevention**: No innerHTML with user data

## Future Enhancements

### Planned Features
- Model search and filtering
- Section annotations
- Measurement tools
- Screenshot capability
- Animation playback
- Multiple model comparison

### Architectural Improvements
- Add TypeScript for type safety
- Implement undo/redo
- Add automated testing
- Implement lazy loading for large models
- Add worker thread for model processing

## Best Practices

1. **Keep it Simple**: Avoid over-engineering
2. **Consistent Naming**: Follow naming conventions
3. **Document Public APIs**: Clear JSDoc comments
4. **Error Handling**: Graceful degradation
5. **Performance**: Profile before optimizing
6. **Accessibility**: Consider keyboard navigation
7. **Responsive**: Mobile-friendly design

## Code Organization

- One class per file
- Group related functionality
- Clear file naming
- Consistent directory structure
- Import organization (domain → services → controllers)

## Conclusion

This architecture provides a solid foundation for a professional 3D viewer application. It's maintainable, testable, and ready for future enhancements while remaining clean and understandable.
