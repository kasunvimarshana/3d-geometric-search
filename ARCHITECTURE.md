# Architecture Documentation

## System Overview

The 3D Geometric Search application is built using a clean, modular architecture that strictly follows SOLID principles, separation of concerns, and clean code practices. This document provides a comprehensive overview of the system architecture, design patterns, and implementation details.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

The domain layer contains core business logic and domain models, completely independent of UI and infrastructure concerns.

#### Key Files:

- **types.ts**: Core domain types and interfaces

  - `Model3D`: Main model representation
  - `ModelSection`: Hierarchical section structure
  - `ViewState`: Camera and view configuration
  - `SelectionState`: Selection and highlighting state

- **events.ts**: Domain event definitions
  - Event-driven architecture foundation
  - Type-safe event definitions
  - Centralized event taxonomy

**Design Principles:**

- Pure domain models with no dependencies
- Immutable data structures
- Type-safe interfaces
- Clear business rules

### 2. Core Layer (`src/core/`)

The core layer implements fundamental application services and patterns.

#### EventBus (`EventBus.ts`)

**Purpose**: Centralized event handling system implementing the Observer pattern.

**Key Features:**

- Type-safe event subscriptions
- Event queueing to prevent race conditions
- Error handling per listener
- Unsubscribe functionality
- Debug capabilities

**Usage:**

```typescript
eventBus.on(EventType.MODEL_LOADED, (event) => {
  // Handle model loaded
});

eventBus.emit({
  type: EventType.MODEL_LOADED,
  timestamp: new Date(),
  model: loadedModel,
});
```

#### StateManager (`StateManager.ts`)

**Purpose**: Centralized state management with immutable updates.

**Key Features:**

- Singleton pattern for global state
- Immutable state updates
- Subscription-based reactivity
- State validation
- Event propagation on state changes

**State Structure:**

```typescript
{
  model: Model3D | null,
  viewState: ViewState,
  selectionState: SelectionState,
  disassembled: boolean,
  loading: boolean,
  error: string | null
}
```

**Design Patterns:**

- Singleton pattern
- Observer pattern (subscriptions)
- State pattern
- Command pattern (actions)

### 3. Loaders Layer (`src/loaders/`)

The loaders layer handles file format parsing and model construction.

#### Loader Architecture

**Interface (`IModelLoader.ts`):**

```typescript
interface IModelLoader {
  readonly supportedFormats: FileFormat[];
  canLoad(filePath: string): boolean;
  load(filePath: string, fileData: ArrayBuffer | string): Promise<Model3D>;
}
```

**Base Class (`BaseModelLoader.ts`):**

- Common loader functionality
- File extension detection
- ID generation utilities

**Implementations:**

- `GLTFModelLoader.ts`: glTF/GLB format (preferred)
- `OBJModelLoader.ts`: Wavefront OBJ format
- `STLModelLoader.ts`: Stereolithography format

**Factory Pattern (`ModelLoaderFactory.ts`):**

```typescript
const loader = ModelLoaderFactory.getLoader(filePath);
const model = await loader.load(filePath, fileData);
```

**Design Principles:**

- Single Responsibility: One loader per format
- Open/Closed: Easy to add new formats
- Dependency Inversion: Depend on abstractions
- Factory Pattern: Dynamic loader selection

### 4. Components Layer (`src/components/`)

The components layer implements UI components and 3D rendering.

#### ModelViewer (`ModelViewer.ts`)

**Purpose**: 3D rendering and visualization using Three.js.

**Responsibilities:**

- Scene management
- Camera control
- Rendering loop
- Visual effects (highlight/select)
- Model transformation (disassembly)

**Key Features:**

- OrbitControls for camera manipulation
- Professional 3-point lighting
- Smooth material transitions
- Event-driven updates
- Resource cleanup

**Integration Points:**

- Listens to domain events (MODEL_LOADED, SECTION_SELECTED, etc.)
- Updates Three.js scene based on state changes
- Dispatches interaction events

#### NavigationPanel (`NavigationPanel.ts`)

**Purpose**: Hierarchical model structure visualization.

**Features:**

- Tree view of model sections
- Expand/collapse hierarchy
- Selection and highlighting
- Type-based icons
- Depth-based indentation

**State Synchronization:**

- Subscribes to state changes
- Updates UI on selection/highlight
- Propagates user interactions to state

#### PropertiesPanel (`PropertiesPanel.ts`)

**Purpose**: Display section properties and metadata.

**Features:**

- Property table rendering
- Multiple selection support
- Type-aware formatting
- Smooth highlight effects
- Category grouping

#### ControlPanel (`ControlPanel.ts`)

**Purpose**: User controls and model manipulation.

**Features:**

- File loading
- View controls (zoom, reset, fullscreen)
- Model operations (disassemble)
- Model information display
- Format validation

### 5. Application Layer (`src/Application.ts`)

**Purpose**: Application orchestration and initialization.

**Responsibilities:**

- Component initialization
- Layout creation
- Error handling
- Lifecycle management
- User notifications

**Initialization Flow:**

```
1. Create layout (HTML structure)
2. Initialize components (Viewer, Panels)
3. Setup error handling
4. Show welcome message
```

## Data Flow

### Model Loading Flow

```
User selects file
    ↓
ControlPanel.handleFileSelection()
    ↓
StateManager.loadModel()
    ↓
EventBus emits MODEL_LOADING
    ↓
ModelLoaderFactory.getLoader()
    ↓
Loader.load() → Parse file → Create Model3D
    ↓
StateManager.setModel()
    ↓
EventBus emits MODEL_LOADED
    ↓
Components receive event → Update UI
    ↓
ModelViewer renders 3D scene
```

### Selection Flow

```
User clicks section in NavigationPanel
    ↓
NavigationPanel.handleSectionClick()
    ↓
StateManager.selectSection()
    ↓
State updated (immutable)
    ↓
EventBus emits SECTION_SELECTED
    ↓
ModelViewer highlights mesh
PropertiesPanel shows properties
NavigationPanel updates visual state
```

### Event Flow

```
User Action
    ↓
Component Handler
    ↓
StateManager Action
    ↓
State Update (immutable)
    ↓
EventBus.emit(event)
    ↓
Multiple Listeners
    ↓
UI Updates + Side Effects
```

## Design Patterns

### 1. Observer Pattern

- **EventBus**: Central event dispatcher
- **StateManager**: Observable state
- **Components**: Observers reacting to changes

### 2. Singleton Pattern

- **EventBus**: Single global instance
- **StateManager**: Single source of truth

### 3. Factory Pattern

- **ModelLoaderFactory**: Dynamic loader creation
- **Material creation**: Dynamic material instantiation

### 4. State Pattern

- **ModelState**: Encapsulated state
- **Immutable updates**: State transitions

### 5. Strategy Pattern

- **IModelLoader**: Different loading strategies
- **File format handling**: Strategy per format

## Error Handling

### Layers of Error Handling

1. **Loader Level**:

   - Catch parsing errors
   - Validate file format
   - Return descriptive errors

2. **State Level**:

   - Validate state transitions
   - Catch async errors
   - Update error state

3. **Component Level**:

   - Try-catch in handlers
   - Fallback rendering
   - User-friendly messages

4. **Global Level**:
   - Window error handlers
   - Unhandled promise rejections
   - Error overlay

### Error Flow

```
Error occurs
    ↓
Try-catch in immediate context
    ↓
Log error (console)
    ↓
Update state with error
    ↓
Show user notification
    ↓
Graceful degradation
```

## Performance Considerations

### Optimization Strategies

1. **Event Queuing**:

   - Batch event processing
   - Prevent race conditions
   - Async event handling

2. **Immutable State**:

   - Predictable updates
   - Easy change detection
   - No side effects

3. **Resource Management**:

   - Proper disposal
   - Memory leak prevention
   - Animation frame cleanup

4. **Lazy Loading**:
   - Load components on demand
   - Defer heavy operations
   - Progressive enhancement

## Testing Strategy

### Unit Tests

- Pure functions
- Domain models
- Utilities

### Integration Tests

- Event flow
- State management
- Component interaction

### E2E Tests

- User workflows
- File loading
- UI interactions

## Security Considerations

1. **Input Validation**:

   - File format validation
   - Size limits
   - Type checking

2. **Error Messages**:

   - No sensitive information
   - User-friendly
   - Actionable

3. **Resource Limits**:
   - Memory usage
   - File size
   - Complexity limits

## Scalability

### Horizontal Scaling

- Stateless design
- Event-driven architecture
- Modular components

### Vertical Scaling

- Efficient algorithms
- Resource pooling
- Lazy initialization

## Future Enhancements

1. **Web Workers**:

   - Offload parsing
   - Background processing
   - Improved responsiveness

2. **IndexedDB**:

   - Persistent storage
   - Offline support
   - Caching

3. **Service Workers**:

   - Offline functionality
   - Asset caching
   - Progressive web app

4. **WebAssembly**:
   - Performance-critical code
   - Complex calculations
   - Native speed

## Conclusion

This architecture provides:

- ✅ Clean separation of concerns
- ✅ Easy to test and maintain
- ✅ Scalable and extensible
- ✅ Type-safe and robust
- ✅ Event-driven and reactive
- ✅ Professional and production-ready
