# API Documentation

## State Manager API

### StateManager

Central state store for the application.

#### Methods

##### `getState()`

Returns the current application state (read-only).

```javascript
const state = stateManager.getState();
console.log(state.model); // Current model
```

##### `dispatch(action)`

Dispatches an action to update state.

**Parameters:**

- `action` (Object): Action object with `type` and `payload`

```javascript
stateManager.dispatch({
  type: "MODEL_LOADED",
  payload: { model: newModel },
});
```

##### `subscribe(stateKey, callback)`

Subscribes to state changes.

**Parameters:**

- `stateKey` (String): State path to observe ('model', 'selection', etc.)
- `callback` (Function): Called when state changes

**Returns:** Unsubscribe function

```javascript
const unsubscribe = stateManager.subscribe("model", (state) => {
  console.log("Model changed:", state.model);
});

// Later: unsubscribe()
```

##### `use(middleware)`

Adds middleware for action processing.

```javascript
stateManager.use((state, action) => {
  console.log("Action:", action.type);
  return action; // Must return action or null to cancel
});
```

##### `undo()`, `redo()`

Undo/redo state changes.

```javascript
stateManager.undo(); // Go back
stateManager.redo(); // Go forward
```

### Actions

Pre-defined action creators in `Actions` object.

```javascript
import { Actions } from "./domain/state-manager.js";

// Load a model
Actions.loadModel(model);

// Select sections
Actions.selectSection(["section_1", "section_2"]);

// Highlight sections
Actions.highlightSection(["section_3"]);

// Isolate sections
Actions.isolateSection(["section_1"]);

// Clear selection
Actions.clearSelection();

// Camera updates
Actions.updateCamera({ position: { x: 5, y: 5, z: 5 } });

// Fullscreen toggle
Actions.toggleFullscreen();

// Tree operations
Actions.expandNode("section_1");
Actions.collapseNode("section_1");
Actions.expandAllNodes();

// Model operations
Actions.disassemble();
Actions.assemble();

// Reset
Actions.reset();
```

## Render Engine API

### RenderEngine

Manages Three.js rendering and scene manipulation.

#### Constructor

```javascript
const renderEngine = new RenderEngine(container);
```

**Parameters:**

- `container` (HTMLElement): DOM element to render into

#### Methods

##### `loadModel(sceneObject, sections)`

Loads a 3D model into the scene.

```javascript
renderEngine.loadModel(threeScene, sections);
```

##### `highlightSection(sectionId, highlighted)`

Highlights or unhighlights a section.

```javascript
renderEngine.highlightSection("section_1", true);
```

##### `setSectionVisibility(sectionId, visible)`

Shows or hides a section.

```javascript
renderEngine.setSectionVisibility("section_1", false);
```

##### `isolateSections(sectionIds)`

Shows only specified sections.

```javascript
renderEngine.isolateSections(["section_1", "section_2"]);
```

##### `showAllSections()`

Shows all sections.

```javascript
renderEngine.showAllSections();
```

##### `disassemble(distance)`

Creates exploded view.

```javascript
renderEngine.disassemble(2.0); // Distance multiplier
```

##### `assemble()`

Returns to assembled state.

```javascript
renderEngine.assemble();
```

##### `fitCameraToModel()`

Fits camera to view entire model.

```javascript
renderEngine.fitCameraToModel();
```

##### `resetCamera()`

Resets camera to default position.

```javascript
renderEngine.resetCamera();
```

##### `raycast(mouseX, mouseY)`

Performs raycasting for object picking.

**Returns:** Section ID or null

```javascript
const sectionId = renderEngine.raycast(event.clientX, event.clientY);
```

##### `dispose()`

Cleans up resources.

```javascript
renderEngine.dispose();
```

## Event Bus API

### EventBus

Centralized event system for component communication.

#### Methods

##### `on(event, callback)`

Subscribes to an event.

**Returns:** Unsubscribe function

```javascript
const unsubscribe = eventBus.on("tree:select", ({ sectionId }) => {
  console.log("Selected:", sectionId);
});
```

##### `off(event, callback)`

Unsubscribes from an event.

```javascript
eventBus.off("tree:select", handler);
```

##### `emit(event, data)`

Emits an event.

```javascript
eventBus.emit("tree:select", { sectionId: "abc" });
```

##### `clear()`

Clears all listeners.

```javascript
eventBus.clear();
```

### Standard Events

#### Tree Events

- `tree:select` - Section selected in tree
- `tree:hover` - Section hovered in tree
- `tree:toggle` - Tree node expanded/collapsed

#### Toolbar Events

- `toolbar:upload` - Upload button clicked
- `toolbar:resetView` - Reset view button clicked
- `toolbar:fitView` - Fit view button clicked
- `toolbar:isolate` - Isolate button clicked
- `toolbar:showAll` - Show all button clicked
- `toolbar:disassemble` - Disassemble button clicked
- `toolbar:assemble` - Assemble button clicked
- `toolbar:expandAll` - Expand all button clicked
- `toolbar:fullscreen` - Fullscreen button clicked

## Loader Factory API

### LoaderFactory

Factory for creating format-specific loaders.

#### Methods

##### `getLoader(filename)`

Gets appropriate loader for a file.

**Returns:** BaseLoader instance or null

```javascript
const loader = loaderFactory.getLoader("model.gltf");
```

##### `isSupported(filename)`

Checks if format is supported.

**Returns:** Boolean

```javascript
if (loaderFactory.isSupported("model.obj")) {
  // Load file
}
```

##### `registerLoader(loader)`

Registers a custom loader.

```javascript
loaderFactory.registerLoader(new CustomLoader());
```

##### `getSupportedExtensions()`

Gets list of supported extensions.

**Returns:** Array of strings

```javascript
const extensions = loaderFactory.getSupportedExtensions();
// ['.gltf', '.glb', '.obj', '.stl', '.step', '.stp']
```

## Base Loader API

### BaseLoader

Abstract base class for format loaders.

#### Methods

##### `load(data, filename)`

Loads a 3D model from file data.

**Parameters:**

- `data` (ArrayBuffer | String): File content
- `filename` (String): Original filename

**Returns:** Promise<LoadResult>

```javascript
const result = await loader.load(arrayBuffer, "model.gltf");
```

##### `canHandle(extension)`

Checks if loader can handle format.

**Returns:** Boolean

```javascript
if (loader.canHandle(".gltf")) {
  // Use this loader
}
```

### LoadResult

Result object from loader.

**Properties:**

- `scene` (THREE.Object3D): Three.js scene object
- `sections` (Section[]): Hierarchical sections
- `metadata` (Object): Additional metadata

## Domain Models API

### Model

Represents a 3D model.

#### Constructor

```javascript
const model = new Model({
  id: "model_123",
  name: "My Model",
  format: "gltf",
  data: threeScene,
  metadata: {},
  sections: [],
});
```

#### Methods

##### `isValid()`

Validates model data.

```javascript
if (model.isValid()) {
  // Model is complete
}
```

##### `findSectionById(sectionId)`

Finds a section by ID.

```javascript
const section = model.findSectionById("section_1");
```

##### `getAllSections()`

Gets all sections in a flat list.

```javascript
const sections = model.getAllSections();
```

### Section

Represents a part/component.

#### Constructor

```javascript
const section = new Section({
  id: "section_1",
  name: "Part 1",
  type: "part",
  meshId: "uuid",
  properties: {},
  visible: true,
  highlighted: false,
  children: [],
});
```

#### Methods

##### `isLeaf()`

Checks if section has no children.

```javascript
if (section.isLeaf()) {
  // This is a leaf node
}
```

##### `isRoot()`

Checks if section has no parent.

```javascript
if (section.isRoot()) {
  // This is a root node
}
```

##### `getPath()`

Gets hierarchical path.

```javascript
const path = section.getPath();
// "Assembly / SubAssembly / Part"
```

##### `getAllChildren()`

Gets all descendants.

```javascript
const children = section.getAllChildren();
```

## UI Components API

### ModelTreeComponent

Displays model hierarchy.

#### Constructor

```javascript
const tree = new ModelTreeComponent(container, eventBus);
```

#### Methods

##### `render(sections, selectedIds, highlightedIds, expandedIds)`

Renders the tree.

```javascript
tree.render(model.sections, ["section_1"], [], expandedNodes);
```

##### `updateSelection(selectedIds)`

Updates selection highlight.

```javascript
tree.updateSelection(["section_1", "section_2"]);
```

##### `updateHighlight(highlightedIds)`

Updates hover highlight.

```javascript
tree.updateHighlight(["section_3"]);
```

### PropertiesPanelComponent

Displays section properties.

#### Constructor

```javascript
const panel = new PropertiesPanelComponent(container, eventBus);
```

#### Methods

##### `render(section)`

Renders properties for a section.

```javascript
panel.render(selectedSection);
```

### ToolbarComponent

Manages toolbar actions.

#### Constructor

```javascript
const toolbar = new ToolbarComponent(elements, eventBus);
```

#### Methods

##### `updateButtonStates(state)`

Updates button enabled/disabled states.

```javascript
toolbar.updateButtonStates(applicationState);
```

##### `updateInfo(text)`

Updates info text.

```javascript
toolbar.updateInfo("Model loaded successfully");
```
