/**
 * ARCHITECTURE.md
 * 
 * Comprehensive architecture documentation for the 3D Geometric Search application.
 */

# Architecture Overview

This document describes the architecture of the 3D Geometric Search application, which is built using **Clean Architecture** principles with strict separation of concerns.

## Design Principles

### SOLID Principles

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Implementations are substitutable for their interfaces
- **Interface Segregation**: Clients depend only on interfaces they use
- **Dependency Inversion**: High-level modules don't depend on low-level modules

### Additional Principles

- **DRY** (Don't Repeat Yourself): No code duplication
- **Separation of Concerns**: Clear boundaries between layers
- **Clean Code**: Self-documenting, readable, maintainable code
- **Event-Driven**: Centralized, predictable event handling

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  (UI Components, Controllers, Views, User Interactions)  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│    (Use Cases, Services, Orchestration, Business Logic)  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│   (Models, Interfaces, Events, Core Business Logic)     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                    │
│    (3D Loaders, Renderers, External Libraries, I/O)     │
└─────────────────────────────────────────────────────────┘
```

## Domain Layer

The innermost layer containing core business logic and entities.

### Responsibilities
- Define domain models (Model, ModelSection)
- Declare contracts via interfaces (IModelLoader, IRenderer, IEventBus)
- Define domain events for state changes
- No external dependencies

### Key Components

**Models**
- `Model`: Core 3D model entity with sections and metadata
- `ModelSection`: Hierarchical component/part of a model
- `ModelFormat`: Enumeration of supported formats

**Interfaces**
- `IModelLoader`: Contract for loading 3D models
- `IRenderer`: Contract for 3D scene rendering
- `IEventBus`: Contract for event management

**Events**
- `DomainEvent`: Base event interface
- Specific events: `ModelLoadedEvent`, `SectionSelectedEvent`, etc.

## Application Layer

Orchestrates domain logic and coordinates operations.

### Responsibilities
- Implement use cases and business workflows
- Coordinate between domain and infrastructure
- Manage application state
- No UI or infrastructure implementation details

### Key Services

**EventBusService**
- Centralized pub/sub event system
- Safe event propagation with error handling
- Event history tracking

**ModelService**
- Model loading and management
- Section selection and navigation
- Coordinates loader and renderer

**ViewService**
- Camera and view state management
- Display options (wireframe, grid, axes)
- Fullscreen control

**ModelOperationsService**
- Complex model operations (disassembly, reassembly)
- Model transformations and animations

## Infrastructure Layer

Handles external concerns and technology implementations.

### Responsibilities
- Implement domain interfaces
- Parse 3D file formats
- Render 3D scenes
- External library integration

### Key Components

**Loaders**
- `CompositeModelLoader`: Aggregates format-specific loaders
- `GLTFModelLoader`: glTF/GLB format support (preferred)
- `OBJModelLoader`: OBJ/MTL format support
- `STLModelLoader`: STL format support
- `STEPModelLoader`: STEP/CAD format placeholder

**Renderers**
- `ThreeJSRenderer`: Three.js-based 3D rendering implementation
- Scene management, lighting, camera control
- Mesh highlighting and selection

## Presentation Layer

User interface and interaction handling.

### Responsibilities
- Render UI components
- Handle user input
- Display application state
- No business logic

### Key Components

**Components**
- `SectionTreeComponent`: Hierarchical model structure display
- `PropertiesPanelComponent`: Section property display
- `LoadingOverlayComponent`: Loading state feedback
- `StatusBarComponent`: Status and information display

**Controllers**
- `ApplicationController`: Main coordinator
- Binds UI events to services
- Updates UI based on domain events

## Event Flow

```
User Action
    ↓
UI Component
    ↓
Application Controller
    ↓
Application Service
    ↓
Domain Model (state change)
    ↓
Domain Event Published
    ↓
Event Bus
    ↓
Subscribed Handlers (UI, Services)
    ↓
UI Update
```

## Dependency Direction

Dependencies flow **inward** toward the domain:

```
Presentation → Application → Domain ← Infrastructure
```

- Presentation depends on Application
- Application depends on Domain
- Infrastructure depends on Domain (implements interfaces)
- Domain depends on nothing (pure business logic)

## File Format Support

### Primary Format: glTF/GLB
- Web-optimized, binary format
- Supports materials, textures, animations
- Industry standard for real-time rendering

### CAD Format: STEP (ISO 10303)
- Standardized CAD data exchange
- AP203, AP214, AP242 support planned
- Requires specialized parsing (OpenCascade.js)

### Legacy Formats
- **OBJ/MTL**: Geometry and materials
- **STL**: Simple mesh format for 3D printing

## State Management

State is managed through:
1. **Domain Models**: Authoritative state source
2. **Event Bus**: State change notifications
3. **Services**: State coordination and business rules
4. **UI Components**: View state only (no business state)

## Error Handling

- **Graceful degradation**: Errors don't crash the app
- **User feedback**: Clear error messages in UI
- **Logging**: Errors logged to console
- **Validation**: Input validation at boundaries
- **Safe defaults**: Fallback behavior when operations fail

## Testing Strategy

### Unit Tests
- Domain models and business logic
- Service orchestration
- Component behavior

### Integration Tests
- Loader implementations
- Renderer integration
- Event flow

### E2E Tests
- Complete user workflows
- Model loading and visualization
- Navigation and operations

## Performance Considerations

- **Lazy loading**: Load models on demand
- **Efficient rendering**: Three.js optimizations
- **Event throttling**: Prevent excessive updates
- **Memory management**: Proper cleanup and disposal
- **Large model handling**: Progressive loading strategies

## Extensibility

The architecture supports easy extension:

### Adding New File Formats
1. Implement `IModelLoader` interface
2. Register with `CompositeModelLoader`
3. No changes to other layers required

### Adding New Features
1. Define domain events if needed
2. Add service methods
3. Create UI components
4. Wire up in controller

### Replacing Renderer
1. Implement `IRenderer` interface
2. Swap implementation in bootstrap
3. No changes to application or domain layers

## Security

- **Input validation**: File type and size checks
- **Sandboxed parsing**: Isolated loader execution
- **No eval()**: Safe code execution only
- **CORS**: Proper cross-origin handling

## Build and Deployment

- **TypeScript**: Strict type checking
- **Vite**: Fast bundling and HMR
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Tree-shaking**: Minimal bundle size

## Future Enhancements

1. **WebAssembly**: STEP parser using OpenCascade
2. **Web Workers**: Off-main-thread parsing
3. **IndexedDB**: Local model caching
4. **Collaboration**: Multi-user viewing
5. **Annotations**: Markup and measurements
6. **Export**: Screenshot and model export
7. **Advanced Selection**: Multi-select, search
8. **Animation**: Playback of animated models
