# Architecture Documentation

## Overview

This 3D Geometric Search application follows **Clean Architecture** principles, ensuring a clear separation of concerns, high testability, and maintainability.

## Architecture Layers

### 1. Core Layer (`src/core/`)

The innermost layer containing framework-agnostic business logic.

- **Entities** (`entities/`): Core domain entities like `Model` and `Section`
- **Use Cases** (`use-cases/`): Application business rules (e.g., `LoadModelUseCase`, `ManageSelectionUseCase`)
- **Interfaces** (`interfaces/`): Contracts and abstractions (e.g., `IModelLoader`, `IRenderer`)

**Key Principle**: This layer has no external dependencies and defines the core business rules.

### 2. Domain Layer (`src/domain/`)

Domain-specific logic and services.

- **Models**: 3D model representations
- **Services**: Domain services that coordinate entities
- **Events** (`events/`): Domain events for loose coupling (`ModelLoadedEvent`, `SectionSelectedEvent`, etc.)

### 3. Infrastructure Layer (`src/infrastructure/`)

External concerns and implementations.

- **Loaders** (`loaders/`): Format-specific implementations
  - `GLTFModelLoader`: glTF/GLB support
  - `OBJModelLoader`: OBJ/MTL support
  - `STLModelLoader`: STL support
  - `STEPModelLoader`: STEP (AP203, AP214, AP242) support
- **Rendering** (`rendering/`): Three.js-based rendering engine

  - `ThreeRenderer`: Implements `IRenderer` interface

- **Storage** (`storage/`): Persistence layer (future)

**Key Principle**: Implements interfaces defined in the core layer, following Dependency Inversion.

### 4. Presentation Layer (`src/presentation/`)

UI components and state management.

- **Components** (`components/`): React components
  - `ViewerCanvas`: Main 3D viewport
  - `SectionTree`: Hierarchical section navigation
  - `Toolbar`: Action buttons and controls
  - `FileLoader`: Drag-and-drop file loading
- **State** (`state/`): Centralized state management with Zustand
  - Immutable updates via Immer middleware
  - Uni-directional data flow
- **Hooks** (`hooks/`): Custom React hooks (future)

### 5. Shared Layer (`src/shared/`)

Cross-cutting concerns.

- **Types** (`types/`): TypeScript interfaces and enums
- **Utils** (`utils/`): Helper functions
- **Constants** (`constants/`): Application-wide constants

## Data Flow

```
User Action → Component → Store → Use Case → Entity/Service → Domain Event
                ↑                                                      ↓
                └──────────── Event Handler ← Event Bus ←─────────────┘
```

### Example: Loading a Model

1. User drops a file → `FileLoader` component
2. Component calls `LoadModelUseCase.execute()`
3. Use case validates file and selects appropriate loader
4. Loader parses file and returns `ModelData`
5. Use case creates `Model` entity
6. Use case publishes `ModelLoadedEvent` via `EventBus`
7. Store updates via action (`setModel`)
8. React components re-render with new state
9. `ViewerCanvas` loads model into `ThreeRenderer`

## Design Principles

### SOLID Principles

1. **Single Responsibility**: Each class has one reason to change

   - `Section`: Manages section data
   - `GLTFModelLoader`: Handles only glTF loading
   - `ThreeRenderer`: Handles only rendering

2. **Open-Closed**: Open for extension, closed for modification

   - Add new loaders by implementing `IModelLoader`
   - Add new renderers by implementing `IRenderer`

3. **Liskov Substitution**: Subtypes are substitutable

   - Any `IModelLoader` implementation can be used interchangeably

4. **Interface Segregation**: Clients depend only on what they use

   - `IModelRepository`, `ISelectionService`, etc. are focused interfaces

5. **Dependency Inversion**: Depend on abstractions, not concretions
   - Use cases depend on `IModelLoader`, not concrete implementations

### Other Principles

- **DRY (Don't Repeat Yourself)**: Shared utilities in `src/shared/`
- **Separation of Concerns**: Clear layer boundaries
- **Uni-directional Data Flow**: State changes flow in one direction
- **Immutability**: State updates are immutable (via Immer)

## Key Features

### Multi-Format Support

- **glTF/GLB**: Industry standard for web 3D
- **STEP**: CAD format (AP203, AP214, AP242)
- **OBJ/MTL**: Legacy 3D format
- **STL**: 3D printing format

### Section Management

- Hierarchical tree structure
- Parent-child relationships
- Bidirectional navigation
- Metadata support

### Interactive Viewer

- Orbit controls (rotate, pan, zoom)
- Section selection (single/multi)
- Hover highlighting
- Section isolation
- Visibility management
- View modes (shaded, wireframe, transparent)
- Fit-to-screen
- Reset camera

### State Management

- Centralized with Zustand
- Immutable updates
- Predictable state changes
- Easy debugging

## Testing Strategy

### Unit Tests

- Test entities in isolation
- Test use cases with mocked dependencies
- Test utilities and helpers

### Integration Tests

- Test use case + repository integration
- Test component + store integration

### E2E Tests

- Test complete user workflows
- Test file loading and rendering
- Test selection and visibility

## Performance Considerations

### Optimization Techniques

1. **Lazy Loading**: Load models on demand
2. **Memoization**: React.memo for components
3. **Debouncing**: User input handling
4. **Throttling**: Render loop optimization
5. **Web Workers**: Heavy computation off main thread
6. **Level of Detail (LOD)**: Reduce geometry complexity at distance

### Memory Management

1. Dispose Three.js resources properly
2. Clear event listeners on unmount
3. Limit stored model history

## Extension Points

### Adding a New Format Loader

1. Implement `IModelLoader` interface:

```typescript
export class NewFormatLoader implements IModelLoader {
  canLoad(format: string): boolean {
    return format === "newformat";
  }

  async load(file: File): Promise<ModelData> {
    // Implementation
  }
}
```

2. Register in `FileLoader`:

```typescript
const loadersMap = new Map([
  // ... existing loaders
  [ModelFormat.NEW_FORMAT, new NewFormatLoader()],
]);
```

### Adding a New Use Case

1. Create use case class:

```typescript
export class NewUseCase {
  constructor(private readonly dependency: IDependency) {}

  async execute(params: Params): Promise<Result> {
    // Implementation
  }
}
```

2. Inject dependencies
3. Publish domain events

### Adding a New Component

1. Create component file:

```typescript
export const NewComponent: React.FC<Props> = (props) => {
  // Use hooks to access store
  const data = useAppStore((state) => state.data);

  return <div>{/* JSX */}</div>;
};
```

2. Add styles
3. Integrate into layout

## Future Enhancements

1. **Advanced CAD Features**

   - Measurements and dimensions
   - Cross-sections
   - Exploded views
   - Animation playback

2. **Collaboration**

   - Real-time multi-user viewing
   - Annotations and comments
   - Share links

3. **Analysis**

   - Mass properties
   - Interference detection
   - Assembly validation

4. **Export**

   - Screenshot capture
   - Video recording
   - Format conversion

5. **Cloud Integration**
   - Save to cloud storage
   - Version history
   - Search and indexing
