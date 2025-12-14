# 3D Geometric Viewer v3.0 - API Documentation

## Table of Contents

- [Domain Layer](#domain-layer)
- [Infrastructure Layer](#infrastructure-layer)
- [Application Services](#application-services)
- [State Management](#state-management)
- [Controllers](#controllers)
- [Event System](#event-system)

---

## Domain Layer

Pure business logic with zero external dependencies. Immutable entities and value objects.

### Model Entity

**Location**: `src/domain/models/Model.js`

Represents a complete 3D model in the domain.

#### Constructor

```javascript
new Model({
  id: string,           // Unique identifier
  name: string,         // Display name
  format: string,       // File format (gltf, glb, obj, stl, step)
  source: string|File,  // URL or File object
  metadata?: object,    // Additional metadata
  sections?: Section[], // Model sections
  assembly?: Assembly,  // Assembly structure
  boundingBox?: BoundingBox, // Bounding box
  loadedAt?: Date       // Load timestamp
})
```

#### Properties

| Property      | Type              | Description                           |
| ------------- | ----------------- | ------------------------------------- |
| `id`          | string            | Unique model identifier               |
| `name`        | string            | Display name of the model             |
| `format`      | string            | File format (normalized to lowercase) |
| `source`      | string\|File      | Model source (URL or File object)     |
| `metadata`    | object            | Additional model metadata (frozen)    |
| `sections`    | Section[]         | Array of sections (frozen)            |
| `assembly`    | Assembly\|null    | Assembly structure if applicable      |
| `boundingBox` | BoundingBox\|null | Model bounding box                    |
| `loadedAt`    | Date              | Timestamp when model was loaded       |

#### Methods

##### `isFile(): boolean`

Check if model source is a File object.

```javascript
const model = new Model({
  /* ... */
});
if (model.isFile()) {
  console.log('Model loaded from file');
}
```

##### `isURL(): boolean`

Check if model source is a URL string.

```javascript
if (model.isURL()) {
  console.log('Model loaded from URL');
}
```

##### `getExtension(): string`

Get file extension of the model.

```javascript
const ext = model.getExtension(); // 'gltf', 'glb', etc.
```

##### `isFormatSupported(): boolean`

Check if the model format is supported.

```javascript
if (model.isFormatSupported()) {
  console.log('Format is supported');
}
```

##### `getSectionCount(): number`

Get total number of sections.

```javascript
const count = model.getSectionCount();
```

##### `toJSON(): object`

Serialize model to JSON.

```javascript
const json = model.toJSON();
console.log(JSON.stringify(json, null, 2));
```

##### `clone(overrides?: object): Model`

Create a clone with optional property overrides.

```javascript
const cloned = model.clone({ name: 'Copy of Model' });
```

---

### Section Entity

**Location**: `src/domain/models/Section.js`

Represents a section/part of a 3D model.

#### Constructor

```javascript
new Section({
  id: string,              // Unique identifier
  name: string,            // Section name
  modelId: string,         // Parent model ID
  parentId?: string|null,  // Parent section ID
  children?: Section[],    // Child sections
  boundingBox?: BoundingBox, // Section bounds
  visible?: boolean,       // Visibility state
  selected?: boolean,      // Selection state
  metadata?: object        // Additional metadata
})
```

#### Methods

- `hasParent(): boolean` - Check if section has parent
- `hasChildren(): boolean` - Check if section has children
- `isVisible(): boolean` - Check visibility
- `isSelected(): boolean` - Check selection state
- `getDepth(): number` - Get hierarchy depth
- `isLeaf(): boolean` - Check if leaf node (no children)
- `toJSON(): object` - Serialize to JSON
- `clone(overrides): Section` - Clone with overrides

---

### Vector3D Value Object

**Location**: `src/domain/values/Vector3D.js`

Immutable 3D vector with mathematical operations.

#### Constructor

```javascript
new Vector3D({
  x: number, // X coordinate (default 0)
  y: number, // Y coordinate (default 0)
  z: number, // Z coordinate (default 0)
});
```

#### Methods

##### `add(other: Vector3D): Vector3D`

Add two vectors.

```javascript
const v1 = new Vector3D({ x: 1, y: 2, z: 3 });
const v2 = new Vector3D({ x: 4, y: 5, z: 6 });
const result = v1.add(v2); // Vector3D(5, 7, 9)
```

##### `subtract(other: Vector3D): Vector3D`

Subtract vectors.

```javascript
const result = v1.subtract(v2);
```

##### `scale(scalar: number): Vector3D`

Multiply by scalar.

```javascript
const scaled = v1.scale(2); // Multiply all components by 2
```

##### `dot(other: Vector3D): number`

Calculate dot product.

```javascript
const dotProduct = v1.dot(v2);
```

##### `cross(other: Vector3D): Vector3D`

Calculate cross product.

```javascript
const crossProduct = v1.cross(v2);
```

##### `length(): number`

Calculate vector magnitude.

```javascript
const magnitude = v1.length();
```

##### `normalize(): Vector3D`

Get unit vector.

```javascript
const unit = v1.normalize(); // Length = 1
```

##### `distanceTo(other: Vector3D): number`

Calculate distance to another vector.

```javascript
const distance = v1.distanceTo(v2);
```

##### `equals(other: Vector3D, epsilon?: number): boolean`

Check equality with optional tolerance.

```javascript
if (v1.equals(v2, 0.001)) {
  console.log('Vectors are equal');
}
```

#### Static Methods

- `Vector3D.zero()` - Create zero vector (0, 0, 0)
- `Vector3D.one()` - Create one vector (1, 1, 1)
- `Vector3D.unitX()` - Create unit X (1, 0, 0)
- `Vector3D.unitY()` - Create unit Y (0, 1, 0)
- `Vector3D.unitZ()` - Create unit Z (0, 0, 1)
- `Vector3D.fromArray([x, y, z])` - Create from array
- `Vector3D.fromJSON({x, y, z})` - Create from JSON

---

### BoundingBox Value Object

**Location**: `src/domain/values/BoundingBox.js`

Represents an axis-aligned bounding box.

#### Constructor

```javascript
new BoundingBox({
  min: Vector3D, // Minimum corner
  max: Vector3D, // Maximum corner
});
```

#### Methods

- `getCenter(): Vector3D` - Get center point
- `getSize(): Vector3D` - Get dimensions
- `getVolume(): number` - Calculate volume
- `contains(point: Vector3D): boolean` - Check if contains point
- `intersects(other: BoundingBox): boolean` - Check intersection
- `expandByPoint(point: Vector3D): BoundingBox` - Expand to include point
- `union(other: BoundingBox): BoundingBox` - Union with another box
- `toJSON(): object` - Serialize to JSON

---

## Application Services

### ModelLoaderService

**Location**: `src/application/services/ModelLoaderService.js`

Orchestrates model loading from various sources and formats.

#### Constructor

```javascript
new ModelLoaderService({
  eventBus: EventBus,
  loaderFactory: LoaderFactory,
  modelRepository: ModelRepository,
});
```

#### Methods

##### `loadFromURL(url: string, options?: object): Promise<Model>`

Load model from URL.

```javascript
const model = await modelLoader.loadFromURL('https://example.com/model.gltf', {
  name: 'My Model',
  format: 'gltf',
});
```

##### `loadFromFile(file: File, options?: object): Promise<Model>`

Load model from File object.

```javascript
const model = await modelLoader.loadFromFile(fileInput.files[0], { name: 'Uploaded Model' });
```

##### `getLoadedModel(modelId: string): Model|null`

Get previously loaded model by ID.

```javascript
const model = modelLoader.getLoadedModel('model-123');
```

##### `getAllModels(): Model[]`

Get all loaded models.

```javascript
const models = modelLoader.getAllModels();
```

##### `unloadModel(modelId: string): void`

Unload and clean up model.

```javascript
modelLoader.unloadModel('model-123');
```

#### Events Emitted

- `model:load:started` - Load initiated
- `model:load:progress` - Progress update
- `model:load:completed` - Load successful
- `model:load:failed` - Load failed

---

### ExportService

**Location**: `src/application/services/ExportService.js`

Handles model export to various formats.

#### Methods

##### `exportModel(modelId: string, format: string, options?: object): Promise<Blob>`

Export model to specified format.

```javascript
const blob = await exportService.exportModel('model-123', 'glb', { binary: true, embed: true });

// Trigger download
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'model.glb';
a.click();
```

**Supported Formats:**

- `gltf` - glTF JSON
- `glb` - glTF Binary
- `obj` - Wavefront OBJ
- `stl` - STL (ASCII or binary)

---

### SectionManagementService

**Location**: `src/application/services/SectionManagementService.js`

Manages section operations (select, hide, isolate, search).

#### Methods

##### `selectSection(sectionId: string): void`

Select a section.

```javascript
sectionService.selectSection('section-123');
```

##### `deselectSection(sectionId: string): void`

Deselect a section.

```javascript
sectionService.deselectSection('section-123');
```

##### `toggleSectionVisibility(sectionId: string): void`

Toggle section visibility.

```javascript
sectionService.toggleSectionVisibility('section-123');
```

##### `isolateSection(sectionId: string): void`

Isolate section (hide all others).

```javascript
sectionService.isolateSection('section-123');
```

##### `showAllSections(): void`

Show all sections.

```javascript
sectionService.showAllSections();
```

##### `searchSections(query: string): Section[]`

Search sections by name.

```javascript
const results = sectionService.searchSections('gear');
```

---

## State Management

### EventBus

**Location**: `src/state/EventBus.js`

Central event dispatcher with pub/sub pattern.

#### Methods

##### `subscribe(eventType: string, handler: function): function`

Subscribe to events. Returns unsubscribe function.

```javascript
const unsubscribe = eventBus.subscribe('model:loaded', data => {
  console.log('Model loaded:', data);
});

// Later...
unsubscribe();
```

##### `publish(eventType: string, data: any): void`

Publish an event.

```javascript
eventBus.publish('model:loaded', { modelId: '123', name: 'Model' });
```

##### `getHistory(limit?: number): Event[]`

Get event history (most recent first).

```javascript
const lastTen = eventBus.getHistory(10);
```

##### `clearHistory(): void`

Clear event history.

```javascript
eventBus.clearHistory();
```

#### Wildcard Subscriptions

Subscribe to all events with `*`:

```javascript
eventBus.subscribe('*', (data, eventType) => {
  console.log(`Event fired: ${eventType}`, data);
});
```

---

### ViewerState

**Location**: `src/state/ViewerState.js`

Immutable application state container.

#### Constructor

```javascript
new ViewerState({
  models?: Map<string, Model>,
  currentModelId?: string|null,
  selectedSectionIds?: Set<string>,
  camera?: CameraState,
  ui?: UIState
})
```

#### Methods

##### `setCurrentModel(modelId: string): ViewerState`

Set active model (returns new state).

```javascript
const newState = currentState.setCurrentModel('model-123');
```

##### `selectSection(sectionId: string): ViewerState`

Select a section.

```javascript
const newState = currentState.selectSection('section-123');
```

##### `deselectSection(sectionId: string): ViewerState`

Deselect a section.

```javascript
const newState = currentState.deselectSection('section-123');
```

##### `toggleSectionSelection(sectionId: string): ViewerState`

Toggle section selection.

```javascript
const newState = currentState.toggleSectionSelection('section-123');
```

##### `toJSON(): object`

Serialize state to JSON.

```javascript
const json = state.toJSON();
localStorage.setItem('viewerState', JSON.stringify(json));
```

---

### StateManager

**Location**: `src/state/StateManager.js`

Manages state with undo/redo support.

#### Methods

##### `getState(): ViewerState`

Get current state.

```javascript
const state = stateManager.getState();
```

##### `setState(newState: ViewerState): void`

Set new state (adds to history).

```javascript
stateManager.setState(newState);
```

##### `undo(): boolean`

Undo last action. Returns true if successful.

```javascript
if (stateManager.undo()) {
  console.log('Undid last action');
}
```

##### `redo(): boolean`

Redo undone action. Returns true if successful.

```javascript
if (stateManager.redo()) {
  console.log('Redid action');
}
```

##### `canUndo(): boolean` / `canRedo(): boolean`

Check if undo/redo is available.

```javascript
if (stateManager.canUndo()) {
  // Enable undo button
}
```

##### `subscribe(callback: function): function`

Subscribe to state changes. Returns unsubscribe function.

```javascript
const unsubscribe = stateManager.subscribe(newState => {
  console.log('State changed:', newState);
});
```

---

## Controllers

### ApplicationController

**Location**: `src/controllers/ApplicationController.js`

Main application orchestrator (Facade pattern).

#### Constructor

```javascript
new ApplicationController(canvas: HTMLCanvasElement)
```

#### Methods

##### `loadModel(source: string|File, options?: object): Promise<Model>`

Load a 3D model.

```javascript
await app.loadModel('https://example.com/model.gltf', {
  name: 'My Model',
});
```

##### `exportModel(modelId: string, format: string): Promise<Blob>`

Export model.

```javascript
const blob = await app.exportModel('model-123', 'glb');
```

##### `selectSection(sectionId: string): void`

Select a section.

```javascript
app.selectSection('section-123');
```

##### `resetCamera(): void`

Reset camera to default position.

```javascript
app.resetCamera();
```

##### `setCamera(preset: string): void`

Set camera to preset view.

```javascript
app.setCamera('front'); // 'front', 'back', 'top', 'bottom', 'left', 'right'
```

##### `getState(): ViewerState`

Get current application state.

```javascript
const state = app.getState();
console.log('Current model:', state.currentModelId);
```

#### Global Access

The ApplicationController is exposed as `window.app` for debugging:

```javascript
// In browser console
app.getState();
app.selectSection('section-123');
app.resetCamera();
```

---

### ViewerController

**Location**: `src/controllers/ViewerController.js`

Manages Three.js scene, camera, and rendering.

#### Methods

##### `addModel(model: Model, object3D: Object3D): void`

Add 3D object to scene.

```javascript
viewerController.addModel(model, threeJsObject);
```

##### `removeModel(modelId: string): void`

Remove model from scene.

```javascript
viewerController.removeModel('model-123');
```

##### `focusOnModel(modelId: string): void`

Focus camera on specific model.

```javascript
viewerController.focusOnModel('model-123');
```

##### `resetCamera(): void`

Reset camera to default.

```javascript
viewerController.resetCamera();
```

##### `setCamera(preset: string): void`

Set camera preset.

```javascript
viewerController.setCamera('top');
```

##### `toggleWireframe(): void`

Toggle wireframe view.

```javascript
viewerController.toggleWireframe();
```

##### `toggleGrid(): void`

Toggle grid visibility.

```javascript
viewerController.toggleGrid();
```

---

## Event System

### Event Types

Comprehensive list of events emitted by the system.

#### Model Events

| Event                  | Data                  | Description               |
| ---------------------- | --------------------- | ------------------------- |
| `model:load:started`   | `{ source, format }`  | Model load initiated      |
| `model:load:progress`  | `{ progress, total }` | Load progress update      |
| `model:load:completed` | `{ model }`           | Model loaded successfully |
| `model:load:failed`    | `{ error, source }`   | Model load failed         |
| `model:unloaded`       | `{ modelId }`         | Model unloaded            |
| `model:selected`       | `{ modelId }`         | Model selected            |

#### Section Events

| Event                        | Data                     | Description        |
| ---------------------------- | ------------------------ | ------------------ |
| `section:selected`           | `{ sectionId, modelId }` | Section selected   |
| `section:deselected`         | `{ sectionId }`          | Section deselected |
| `section:visibility:changed` | `{ sectionId, visible }` | Visibility changed |
| `section:isolated`           | `{ sectionId }`          | Section isolated   |
| `sections:all:shown`         | `{}`                     | All sections shown |

#### Camera Events

| Event               | Data                   | Description    |
| ------------------- | ---------------------- | -------------- |
| `camera:changed`    | `{ position, target }` | Camera moved   |
| `camera:reset`      | `{}`                   | Camera reset   |
| `camera:preset:set` | `{ preset }`           | Preset applied |

#### State Events

| Event           | Data                     | Description    |
| --------------- | ------------------------ | -------------- |
| `state:changed` | `{ newState, oldState }` | State changed  |
| `state:undo`    | `{ state }`              | Undo performed |
| `state:redo`    | `{ state }`              | Redo performed |

---

## Usage Examples

### Complete Workflow Example

```javascript
// Initialize application
const canvas = document.getElementById('viewer-canvas');
const app = new ApplicationController(canvas);

// Subscribe to events
app.eventBus.subscribe('model:load:completed', ({ model }) => {
  console.log(`Model loaded: ${model.name}`);
  console.log(`Sections: ${model.getSectionCount()}`);
});

// Load a model
try {
  const model = await app.loadModel('https://example.com/model.gltf', { name: 'My Model' });

  // Work with sections
  if (model.hasSections()) {
    const sections = model.sections;
    console.log(`Found ${sections.length} sections`);

    // Select first section
    app.selectSection(sections[0].id);
  }

  // Set camera view
  app.setCamera('front');

  // Export model
  const blob = await app.exportModel(model.id, 'glb');

  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${model.name}.glb`;
  a.click();
} catch (error) {
  console.error('Failed to load model:', error);
}
```

### State Management Example

```javascript
// Subscribe to state changes
const unsubscribe = app.stateManager.subscribe(newState => {
  console.log('State changed');
  updateUI(newState);
});

// Make changes (automatically tracked)
app.selectSection('section-1');
app.selectSection('section-2');

// Undo/Redo
document.getElementById('undo-btn').addEventListener('click', () => {
  if (app.stateManager.undo()) {
    console.log('Undid action');
  }
});

document.getElementById('redo-btn').addEventListener('click', () => {
  if (app.stateManager.redo()) {
    console.log('Redid action');
  }
});

// Cleanup
unsubscribe();
```

### Custom Event Handler Example

```javascript
// Monitor all events for debugging
app.eventBus.subscribe('*', (data, eventType) => {
  console.log(`[${new Date().toISOString()}] ${eventType}`, data);
});

// Track model loading progress
app.eventBus.subscribe('model:load:progress', ({ progress, total }) => {
  const percentage = (progress / total) * 100;
  updateProgressBar(percentage);
});

// Handle errors
app.eventBus.subscribe('model:load:failed', ({ error, source }) => {
  showErrorNotification(`Failed to load ${source}: ${error.message}`);
});
```

---

## TypeScript Definitions

While this project uses JavaScript, here are TypeScript-style type definitions for reference:

```typescript
// Domain Types
interface Model {
  id: string;
  name: string;
  format: string;
  source: string | File;
  metadata: Record<string, any>;
  sections: Section[];
  assembly: Assembly | null;
  boundingBox: BoundingBox | null;
  loadedAt: Date;
}

interface Section {
  id: string;
  name: string;
  modelId: string;
  parentId: string | null;
  children: Section[];
  boundingBox: BoundingBox | null;
  visible: boolean;
  selected: boolean;
  metadata: Record<string, any>;
}

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface BoundingBox {
  min: Vector3D;
  max: Vector3D;
}

// State Types
interface ViewerState {
  models: Map<string, Model>;
  currentModelId: string | null;
  selectedSectionIds: Set<string>;
  camera: CameraState;
  ui: UIState;
}

// Event Types
type EventHandler = (data: any) => void;
type UnsubscribeFn = () => void;

interface EventBus {
  subscribe(eventType: string, handler: EventHandler): UnsubscribeFn;
  publish(eventType: string, data: any): void;
  getHistory(limit?: number): Event[];
}
```

---

## Performance Considerations

### Model Loading

- Large models (>50MB) may take time to load
- Use progress events to show loading indicators
- Consider implementing model streaming for very large files

### Section Management

- Selecting many sections simultaneously may impact performance
- Use `isolateSection()` for better performance when focusing on specific parts
- Batch section operations when possible

### State History

- Default history limit: 50 states
- Adjust `maxHistorySize` in StateManager if needed
- Clear history periodically for long-running sessions

### Event System

- Limit wildcard (`*`) subscriptions for production
- Unsubscribe from events when components unmount
- Event history limited to 100 events by default

---

## Error Handling

All async methods can throw errors. Always use try-catch:

```javascript
try {
  const model = await app.loadModel(url);
} catch (error) {
  if (error.message.includes('format not supported')) {
    showError('This file format is not supported');
  } else if (error.message.includes('network')) {
    showError('Network error. Please check your connection.');
  } else {
    showError('Failed to load model');
  }
}
```

---

## Browser Compatibility

- **Minimum**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebGL 2.0 required**
- **ES2020 features used**

---

## Debugging

### Console Access

```javascript
// Access application globally
window.app;

// Common debugging commands
app.getState();
app.eventBus.getHistory();
app.stateManager.canUndo();
app.stateManager.canRedo();

// Export current state
JSON.stringify(app.getState().toJSON(), null, 2);
```

### Event Monitoring

```javascript
// Monitor all events
window.app.eventBus.subscribe('*', (data, type) => {
  console.log(type, data);
});

// Monitor specific events
window.app.eventBus.subscribe('section:selected', console.log);
```

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues or questions:

- Check the [Quick Start Guide](./QUICK_START.md)
- Review [Integration Documentation](./V3_INTEGRATION_COMPLETE.md)
- Check browser console for error messages
- Use `window.app` for debugging in browser DevTools
