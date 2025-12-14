# 3D Geometric Viewer v3.0 - Clean Architecture Design

## Executive Summary

This document outlines the complete redesign and reimplementation of the 3D Geometric Viewer application following clean architecture principles, SOLID design patterns, and industry best practices. The goal is to create a professional, production-grade system with robust 3D file format support, predictable behavior, and maintainable codebase.

## Core Design Principles

### 1. Clean Architecture

- **Separation of Concerns**: Clear boundaries between layers
- **Dependency Rule**: Dependencies point inward (Infrastructure → Application → Domain)
- **Independent of Frameworks**: Business logic isolated from Three.js specifics
- **Testable**: Each layer can be tested independently
- **Independent of UI**: UI changes don't affect business logic

### 2. SOLID Principles

- **Single Responsibility**: Each class has one reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes are substitutable
- **Interface Segregation**: Clients not forced to depend on unused methods
- **Dependency Inversion**: Depend on abstractions, not concretions

### 3. DRY (Don't Repeat Yourself)

- Shared functionality extracted into reusable components
- Configuration centralized
- Common patterns abstracted

## System Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ UI Components (HTML/CSS/DOM)                 │   │
│  │ - Model Selection Panel                      │   │
│  │ - Section Tree View                          │   │
│  │ - Control Panels                             │   │
│  │ - Status Indicators                          │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────────┐
│           APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ Controllers                                  │   │
│  │ - ApplicationController (Orchestrator)      │   │
│  │ - ViewerController (3D Scene Management)    │   │
│  │ - UIController (UI Coordination)            │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ State Management                             │   │
│  │ - ViewerState (Immutable State)             │   │
│  │ - StateManager (State Transitions)          │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Event System                                 │   │
│  │ - EventBus (Pub/Sub)                        │   │
│  │ - EventCoordinator (Event Orchestration)    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                    │
│  ┌──────────────────────────────────────────────┐   │
│  │ Services (Application Logic)                 │   │
│  │ - ModelLoaderService                         │   │
│  │ - SectionManagementService                   │   │
│  │ - NavigationService                          │   │
│  │ - SelectionService                           │   │
│  │ - ExportService                              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Format Handlers (File Format Logic)         │   │
│  │ - GLTFHandler (glTF/GLB)                    │   │
│  │ - STEPHandler (STEP AP203/214/242)         │   │
│  │ - OBJHandler (OBJ/MTL)                      │   │
│  │ - STLHandler (STL)                           │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────────┐
│                DOMAIN LAYER                          │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain Models (Business Entities)            │   │
│  │ - Model (3D Model)                           │   │
│  │ - Section (Model Section/Part)              │   │
│  │ - Assembly (Model Assembly Structure)       │   │
│  │ - Camera (Camera State)                      │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Value Objects                                │   │
│  │ - Vector3D, Color, BoundingBox              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Interfaces & Contracts                       │   │
│  │ - IModelLoader, ISectionManager              │   │
│  │ - IFormatHandler, IExporter                  │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain Events                                │   │
│  │ - ModelLoadedEvent, SectionSelectedEvent    │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                       ↕
┌─────────────────────────────────────────────────────┐
│           INFRASTRUCTURE LAYER                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ External Dependencies                        │   │
│  │ - Three.js (3D Rendering Engine)            │   │
│  │ - File System API                            │   │
│  │ - Web APIs (Fetch, Blob, etc.)              │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Loaders (Three.js Wrappers)                 │   │
│  │ - GLTFLoaderAdapter                          │   │
│  │ - OBJLoaderAdapter                           │   │
│  │ - STLLoaderAdapter                           │   │
│  │ - STEPConverterAdapter                       │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Repositories                                 │   │
│  │ - ModelRepository (Data Access)              │   │
│  │ - ConfigRepository (Settings)                │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## File Format Support Strategy

### Priority 1: Web-Optimized Formats

**glTF 2.0 / GLB** (Preferred Format)

- **Why**: GL Transmission Format - industry standard for web
- **Advantages**:
  - Compact binary format (GLB)
  - PBR materials support
  - Animation support
  - Efficient parsing
  - Wide tooling support
- **Use Cases**: Primary format for all web delivery
- **Implementation**: `GLTFHandler` with Three.js GLTFLoader

### Priority 2: CAD/Engineering Formats

**STEP (ISO 10303)**

- **AP203**: Configuration controlled 3D designs
- **AP214**: Core data for automotive mechanical design
- **AP242**: Managed model-based 3D engineering
- **Implementation Strategy**:
  - Server-side conversion to glTF (preferred)
  - Client-side conversion via WASM (if feasible)
  - `STEPHandler` with conversion pipeline
- **Challenges**: Complex format, requires parsing library
- **Solution**: Implement robust conversion service with error handling

### Priority 3: Universal Exchange Formats

**OBJ/MTL**

- **Why**: Widely supported, simple text format
- **Advantages**:
  - Universal compatibility
  - Simple to parse
  - Material support via MTL
- **Limitations**: No scene hierarchy, large file size
- **Implementation**: `OBJHandler` with MTLLoader

**STL (Binary & ASCII)**

- **Why**: 3D printing standard, universal support
- **Advantages**:
  - Simple geometry format
  - Widely supported
  - Fast to parse (binary)
- **Limitations**: No color/texture, single mesh
- **Implementation**: `STLHandler` with automatic format detection

## Component Specifications

### Domain Layer

#### Model Entity

```typescript
class Model {
  id: string;
  name: string;
  format: ModelFormat;
  url: string | File;
  metadata: ModelMetadata;
  sections: Section[];
  assembly: Assembly | null;
  boundingBox: BoundingBox;

  methods:
    - validate(): ValidationResult
    - clone(): Model
    - toJSON(): Object
}
```

#### Section Entity

```typescript
class Section {
  id: string;
  name: string;
  parentId: string | null;
  children: Section[];
  meshIds: string[];
  isVisible: boolean;
  isHighlighted: boolean;
  isIsolated: boolean;
  metadata: SectionMetadata;

  methods:
    - toggleVisibility(): void
    - highlight(): void
    - unhighlight(): void
    - isolate(): void
}
```

### Service Layer

#### ModelLoaderService

**Responsibility**: Load and parse 3D models

```typescript
class ModelLoaderService {
  dependencies:
    - formatHandlers: Map<ModelFormat, IFormatHandler>
    - eventBus: EventBus

  methods:
    - async load(source: ModelSource): Promise<Model>
    - async loadWithProgress(source: ModelSource, onProgress): Promise<Model>
    - detectFormat(source: ModelSource): ModelFormat
    - registerHandler(format: ModelFormat, handler: IFormatHandler): void
    - clearCache(): void
}
```

#### SectionManagementService

**Responsibility**: Manage section hierarchy and operations

```typescript
class SectionManagementService {
  dependencies:
    - stateManager: StateManager
    - eventBus: EventBus

  methods:
    - discoverSections(model: Model): Section[]
    - selectSection(sectionId: string): void
    - deselectSection(sectionId: string): void
    - isolateSection(sectionId: string): void
    - highlightSection(sectionId: string, highlight: boolean): void
    - toggleVisibility(sectionId: string): void
    - getSectionHierarchy(): SectionTree
}
```

#### NavigationService

**Responsibility**: Handle navigation and focus operations

```typescript
class NavigationService {
  dependencies:
    - viewerController: ViewerController
    - stateManager: StateManager

  methods:
    - focusOnSection(sectionId: string): void
    - focusOnModel(): void
    - exitFocusMode(): void
    - frameInView(object: Object3D): void
    - resetView(): void
    - setCameraPreset(preset: CameraPreset): void
}
```

### Controller Layer

#### ApplicationController

**Responsibility**: Main application orchestrator

- Initializes all subsystems
- Coordinates high-level operations
- Handles application lifecycle
- Delegates to specialized controllers

#### ViewerController

**Responsibility**: 3D scene and rendering management

- Manages Three.js scene, camera, renderer
- Handles render loop
- Manages lights, helpers, controls
- Processes raycasting for selection
- Updates visual states

#### UIController

**Responsibility**: UI coordination and updates

- Manages DOM interactions
- Updates UI based on state changes
- Handles user input
- Renders section tree
- Manages control panels

### State Management

#### ViewerState (Immutable)

```typescript
interface ViewerState {
  // Model State
  currentModel: Model | null;
  loadingProgress: number;

  // Section State
  sections: Map<string, Section>;
  selectedSections: Set<string>;
  highlightedSections: Set<string>;
  isolatedSections: Set<string>;

  // View State
  camera: CameraState;
  focusMode: boolean;
  focusedObject: string | null;

  // Visual State
  wireframeMode: boolean;
  gridVisible: boolean;
  axesVisible: boolean;
  fullscreenMode: boolean;
}
```

#### StateManager

- Manages state transitions
- Enforces immutability
- Emits events on state changes
- Provides state history
- Enables undo/redo

## Event System Design

### Event Categories

**Model Lifecycle Events**

- `MODEL_LOAD_STARTED`
- `MODEL_LOAD_PROGRESS`
- `MODEL_LOADED`
- `MODEL_LOAD_FAILED`
- `MODEL_UNLOADED`
- `MODEL_UPDATED`

**Section Events**

- `SECTIONS_DISCOVERED`
- `SECTION_SELECTED`
- `SECTION_DESELECTED`
- `SECTION_HIGHLIGHTED`
- `SECTION_ISOLATED`
- `SECTION_VISIBILITY_CHANGED`

**Navigation Events**

- `FOCUS_ENTERED`
- `FOCUS_EXITED`
- `CAMERA_MOVED`
- `VIEW_RESET`

**Assembly Events**

- `MODEL_DISASSEMBLED`
- `MODEL_REASSEMBLED`

### Event Flow Pattern

```
User Action
  → Controller
  → Service
  → State Update
  → Event Emission
  → Subscribers React
  → UI/Viewer Update
```

## UI Design Specifications

### Layout Structure

```
┌─────────────────────────────────────────────┐
│              Header Bar                      │
│  [Logo] 3D Geometric Viewer        [Help]   │
└─────────────────────────────────────────────┘
┌──────────┬──────────────────────────────────┐
│  Left    │                                  │
│  Panel   │        3D Viewport               │
│          │                                  │
│  - Load  │                                  │
│  - Model │                                  │
│    List  │                                  │
│  - Sect  │                                  │
│    ions  │                                  │
│  - View  │                                  │
│  - Exp   │                                  │
│    ort   │                                  │
│          │                                  │
│          │                                  │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
┌─────────────────────────────────────────────┐
│              Status Bar                      │
│  Model: sample.gltf | Sections: 5 | FPS: 60│
└─────────────────────────────────────────────┘
```

### Design System

**Colors**

- Primary: `#2c3e50` (Dark blue-gray)
- Secondary: `#3498db` (Blue)
- Accent: `#e74c3c` (Red)
- Success: `#27ae60` (Green)
- Background: `#ecf0f1` (Light gray)
- Surface: `#ffffff` (White)
- Text: `#2c3e50` (Dark)
- Text Secondary: `#7f8c8d` (Gray)

**Typography**

- Font Family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
- Base Size: 14px
- Headings: 600 weight
- Body: 400 weight

**Spacing Scale**

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Components**

- Consistent border-radius: 4px
- Box shadows for elevation
- Smooth transitions: 200ms
- Focus indicators for accessibility

## Implementation Roadmap

### Phase 1: Foundation (Domain & Infrastructure)

1. Define domain models and interfaces
2. Implement format handlers (glTF, OBJ, STL)
3. Create loader adapters
4. Build repository layer

### Phase 2: Core Services

1. Implement ModelLoaderService
2. Build SectionManagementService
3. Create NavigationService
4. Develop SelectionService

### Phase 3: State & Events

1. Implement immutable state system
2. Build event bus with strong typing
3. Create event coordinator
4. Set up state history

### Phase 4: Controllers

1. Rebuild ViewerController
2. Implement ApplicationController
3. Create UIController
4. Wire up all components

### Phase 5: UI & Polish

1. Design clean UI components
2. Implement responsive layout
3. Add keyboard shortcuts
4. Create help system

### Phase 6: Advanced Features

1. STEP format support
2. Export functionality
3. Advanced section operations
4. Performance optimization

### Phase 7: Testing & Documentation

1. Unit tests for all services
2. Integration tests
3. E2E tests
4. Complete documentation

## Quality Assurance

### Code Quality Standards

- **Linting**: ESLint with strict rules
- **Formatting**: Prettier with consistent config
- **Type Safety**: JSDoc annotations for IDE support
- **Code Review**: All changes reviewed
- **Documentation**: Every public API documented

### Testing Strategy

- **Unit Tests**: All services and utilities
- **Integration Tests**: Component interactions
- **E2E Tests**: Critical user workflows
- **Performance Tests**: Render performance, memory usage
- **Browser Tests**: Cross-browser compatibility

### Performance Targets

- **Initial Load**: < 2s
- **Model Load (small)**: < 1s
- **Model Load (large)**: < 5s with progress
- **Interaction Response**: < 16ms (60 FPS)
- **Memory Usage**: < 500MB for large models

## Migration Strategy

### Approach

**Big Bang Replacement** (Recommended for clean slate)

- Create new v3 branch
- Implement complete system
- Test thoroughly
- Switch over when ready

### Fallback Plan

- Maintain v2 branch
- Feature flag for v3
- Gradual user migration
- Quick rollback if issues

## Success Criteria

✅ **Functionality**

- All formats load correctly
- All features work as expected
- No regressions from v2

✅ **Quality**

- 100% JSDoc coverage
- > 80% test coverage
- No ESLint errors
- Consistent formatting

✅ **Performance**

- Meets performance targets
- No memory leaks
- Smooth 60 FPS

✅ **Maintainability**

- Clear architecture
- Well-documented
- Easy to extend
- Testable components

✅ **User Experience**

- Professional appearance
- Intuitive interactions
- Responsive feedback
- Helpful error messages

---

**Document Version**: 1.0  
**Date**: December 14, 2025  
**Status**: Design Complete - Ready for Implementation
