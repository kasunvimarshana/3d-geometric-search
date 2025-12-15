# API Documentation

## Application Class

### Constructor

```javascript
new Application();
```

### Methods

#### `initialize()`

Initializes the application and all subsystems.

**Returns:** `Promise<void>`

**Throws:** Error if initialization fails

#### `dispose()`

Cleans up resources and stops the application.

---

## Store Class

### Constructor

```javascript
new Store(initialState);
```

**Parameters:**

- `initialState` (Object): Initial state object

### Methods

#### `getState()`

Returns the current state.

**Returns:** `Object`

#### `setState(newState, saveHistory)`

Updates the state.

**Parameters:**

- `newState` (Object): Partial state update
- `saveHistory` (Boolean): Whether to save to history (default: true)

#### `subscribe(listener)`

Subscribes to state changes.

**Parameters:**

- `listener` (Function): Callback function `(newState, prevState) => void`

**Returns:** `Function` - Unsubscribe function

#### `undo()`

Undoes the last state change.

**Returns:** `Boolean` - Success status

#### `redo()`

Redoes the previously undone state change.

**Returns:** `Boolean` - Success status

---

## EventBus Class

### Constructor

```javascript
new EventBus();
```

### Methods

#### `on(eventName, handler)`

Subscribes to an event.

**Parameters:**

- `eventName` (String): Event name
- `handler` (Function): Event handler

**Returns:** `Function` - Unsubscribe function

#### `once(eventName, handler)`

Subscribes to an event once.

**Parameters:**

- `eventName` (String): Event name
- `handler` (Function): Event handler

**Returns:** `Function` - Unsubscribe function

#### `emit(eventName, ...args)`

Emits an event.

**Parameters:**

- `eventName` (String): Event name
- `args` (Any): Event arguments

#### `off(eventName, handler)`

Unsubscribes from an event.

**Parameters:**

- `eventName` (String): Event name
- `handler` (Function): Event handler

---

## Model Class

### Constructor

```javascript
new Model({
  id,
  name,
  format,
  sections,
  metadata,
  bounds,
});
```

**Parameters:**

- `id` (String): Unique identifier
- `name` (String): Model name
- `format` (String): File format (gltf, obj, stl, step)
- `sections` (Array): Array of Section objects
- `metadata` (Object): Model metadata
- `bounds` (Object|null): Bounding box

### Methods

#### `getStatistics()`

Calculates model statistics.

**Returns:** `Object`

```javascript
{
  vertices: Number,
  faces: Number,
  objects: Number
}
```

#### `findSection(sectionId)`

Finds a section by ID.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `Section|null`

#### `getAllSections()`

Gets all sections flattened.

**Returns:** `Array<Section>`

#### `clone()`

Creates a deep copy of the model.

**Returns:** `Model`

---

## Section Class

### Constructor

```javascript
new Section({
  id,
  name,
  parentId,
  children,
  geometry,
  material,
  transform,
  properties,
  visible,
  selectable,
});
```

### Methods

#### `isLeaf()`

Checks if section has no children.

**Returns:** `Boolean`

#### `hasGeometry()`

Checks if section has geometry data.

**Returns:** `Boolean`

#### `getDepth()`

Gets section depth in hierarchy.

**Returns:** `Number`

#### `clone()`

Creates a deep copy of the section.

**Returns:** `Section`

---

## Selection Class

### Constructor

```javascript
new Selection({
  selectedIds,
  highlightedIds,
  focusedId,
  isolatedIds,
});
```

### Methods

#### `select(sectionId, multiSelect)`

Selects a section.

**Parameters:**

- `sectionId` (String): Section ID
- `multiSelect` (Boolean): Keep existing selections (default: false)

**Returns:** `this`

#### `deselect(sectionId)`

Deselects a section.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `this`

#### `isSelected(sectionId)`

Checks if section is selected.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `Boolean`

#### `highlight(sectionId)`

Highlights a section.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `this`

#### `dehighlight(sectionId)`

Removes highlight from section.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `this`

#### `focus(sectionId)`

Sets focused section.

**Parameters:**

- `sectionId` (String): Section ID

**Returns:** `this`

#### `isolate(sectionIds)`

Isolates specific sections.

**Parameters:**

- `sectionIds` (Array<String>): Section IDs

**Returns:** `this`

---

## CameraController Class

### Constructor

```javascript
new CameraController(camera, controls);
```

**Parameters:**

- `camera` (THREE.Camera): Three.js camera
- `controls` (OrbitControls): Three.js orbit controls

### Methods

#### `reset()`

Resets camera to default position.

#### `fitToBounds(bounds, padding)`

Fits camera to view bounds.

**Parameters:**

- `bounds` (Object): Bounding box
- `padding` (Number): Padding multiplier (default: 1.2)

#### `focusOnObject(object, padding)`

Focuses camera on specific object.

**Parameters:**

- `object` (THREE.Object3D): Three.js object
- `padding` (Number): Padding multiplier (default: 1.5)

#### `setZoom(zoomLevel)`

Sets zoom level.

**Parameters:**

- `zoomLevel` (Number): Zoom level

#### `setAutoRotate(enabled, speed)`

Enables/disables auto rotation.

**Parameters:**

- `enabled` (Boolean): Enable rotation
- `speed` (Number): Rotation speed (default: 0.5)

---

## Event Types

### File Events

- `FILE_UPLOAD` - File selected for upload
- `FILE_LOAD_START` - File loading started
- `FILE_LOAD_COMPLETE` - File loading completed
- `FILE_LOAD_ERROR` - File loading failed

### Model Events

- `MODEL_LOADED` - Model loaded successfully
- `MODEL_CLEARED` - Model cleared
- `MODEL_TOGGLE_EXPLODE` - Toggle explode/assemble

### Section Events

- `SECTION_SELECT` - Section selected
- `SECTION_DESELECT` - Section deselected
- `SECTION_HIGHLIGHT` - Section highlighted
- `SECTION_FOCUS` - Section focused

### View Events

- `VIEW_RESET` - Reset camera view
- `VIEW_FIT` - Fit model to view
- `VIEW_ZOOM` - Zoom changed
- `VIEW_TOGGLE_WIREFRAME` - Toggle wireframe mode
- `VIEW_TOGGLE_GRID` - Toggle grid visibility
- `VIEW_TOGGLE_AXES` - Toggle axes visibility

### UI Events

- `UI_FULLSCREEN` - Fullscreen toggled
- `UI_LOADING` - Loading state changed
- `UI_ERROR` - Error occurred

---

## State Structure

```javascript
{
  // Model state
  model: Model | null,
  isModelLoaded: Boolean,
  modelFormat: String | null,

  // Selection state
  selection: Selection,

  // View state
  viewState: ViewState,

  // UI state
  ui: {
    isFullscreen: Boolean,
    isSidebarLeftVisible: Boolean,
    isSidebarRightVisible: Boolean,
    uploadOverlayVisible: Boolean,
    loading: Boolean,
    error: String | null
  },

  // Interaction state
  interaction: {
    hoveredSectionId: String | null,
    isExploded: Boolean,
    explodeDistance: Number
  },

  // Statistics
  statistics: {
    vertices: Number,
    faces: Number,
    objects: Number,
    loadTime: Number
  }
}
```
