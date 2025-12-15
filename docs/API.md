# API Documentation

## Core Services

### Application

Main application orchestrator.

```typescript
import { Application } from "@core/Application";

const app = new Application(container);
app.destroy(); // Cleanup
```

### EventBus

Centralized event management.

```typescript
import { EventBus } from "@core/EventBus";
import { EventType } from "@domain/types";

const eventBus = new EventBus();

// Subscribe to specific event
const unsubscribe = eventBus.subscribe(
  EventType.MODEL_LOAD_SUCCESS,
  (event) => {
    console.log("Model loaded:", event.payload);
  }
);

// Subscribe to all events
const unsubscribeAll = eventBus.subscribeAll((event) => {
  console.log("Event:", event);
});

// Publish event
eventBus.publish({
  type: EventType.MODEL_LOAD_START,
  timestamp: Date.now(),
  payload: { filename: "model.glb" },
});

// Cleanup
unsubscribe();
eventBus.clear();
```

### StateManager

Immutable state management.

```typescript
import { StateManager } from "@core/StateManager";

const stateManager = new StateManager();

// Get current state
const state = stateManager.getState();

// Update state
stateManager.updateState((state) => ({
  ...state,
  loading: true,
}));

// Subscribe to changes
const unsubscribe = stateManager.subscribe((state) => {
  console.log("State changed:", state);
});

// Reset state
stateManager.reset();
```

### ModelRepository

Model storage and retrieval.

```typescript
import { ModelRepository } from "@core/ModelRepository";

const repository = new ModelRepository();

// Save model
repository.save(model);

// Get current model
const current = repository.getCurrent();

// Find by ID
const model = repository.findById("model-123");

// Clear all
repository.clear();
```

### SectionManager

Section hierarchy management.

```typescript
import { SectionManager } from "@core/SectionManager";

const sectionManager = new SectionManager(model);

// Get section
const section = sectionManager.getSectionById("section-1");

// Navigate hierarchy
const parent = sectionManager.getParentSection("section-1");
const children = sectionManager.getChildSections("section-1");
const roots = sectionManager.getRootSections();

// Selection
sectionManager.selectSection("section-1", false);
sectionManager.deselectSection("section-1");
const selected = sectionManager.getSelectedSections();
```

## Infrastructure Services

### ModelLoaderFactory

Load models from various formats.

```typescript
import { ModelLoaderFactory } from "@infrastructure/loaders/ModelLoaderFactory";
import { ModelFormat } from "@domain/types";

const factory = new ModelLoaderFactory();

// Check support
const supported = factory.isFormatSupported(ModelFormat.GLTF);

// Get loader
const loader = factory.getLoader(ModelFormat.GLTF);

// Load model
const model = await factory.loadModel(data, ModelFormat.GLTF, "model.gltf");
```

### ThreeRenderer

3D visualization with Three.js.

```typescript
import { ThreeRenderer } from "@infrastructure/ThreeRenderer";

const renderer = new ThreeRenderer();

// Initialize
renderer.initialize(container);

// Load model
renderer.loadModel(model);

// Section operations
renderer.highlightSection("section-1", true);
renderer.dehighlightSection("section-1", true);
renderer.focusSection("section-1", true);
renderer.isolateSections(["section-1", "section-2"]);
renderer.showAllSections();

// View operations
renderer.resetView(true);
renderer.zoom(1, { x: 100, y: 100 });
renderer.setFullscreen(true);

// Cleanup
renderer.dispose();
```

### AnimationController

Model animations.

```typescript
import { AnimationController } from "@infrastructure/AnimationController";

const controller = new AnimationController(scene, meshes);

// Animate
await controller.disassemble(2000);
await controller.reassemble(2000);

// Control
controller.stop();
const isAnimating = controller.isAnimating();
const state = controller.getState();
```

### FileHandler

File operations.

```typescript
import { FileHandler } from "@infrastructure/FileHandler";

const handler = new FileHandler();

// Detect format
const format = handler.detectFormat("model.glb");

// Read file
const data = await handler.readFile(file);

// Check support
const supported = handler.isFormatSupported(ModelFormat.GLTF);
```

## UI Components

### Toolbar

```typescript
import { Toolbar } from "@ui/components/Toolbar";

const toolbar = new Toolbar({
  onFileUpload: (file) => {
    /* ... */
  },
  onReset: () => {
    /* ... */
  },
  onDisassemble: () => {
    /* ... */
  },
  onReassemble: () => {
    /* ... */
  },
  onFullscreen: () => {
    /* ... */
  },
  supportedFormats: [ModelFormat.GLTF, ModelFormat.GLB],
});

toolbar.mount(container);
toolbar.setButtonEnabled("disassemble-btn", false);
```

### SectionPanel

```typescript
import { SectionPanel } from "@ui/components/SectionPanel";

const panel = new SectionPanel({
  sections: [],
  onSectionSelect: (id, multi) => {
    /* ... */
  },
  onSectionFocus: (id) => {
    /* ... */
  },
});

panel.mount(container);
panel.update({ sections: newSections });
panel.updateSectionState("section-1", { selected: true });
```

### StatusBar

```typescript
import { StatusBar } from "@ui/components/StatusBar";

const statusBar = new StatusBar();

statusBar.mount(container);
statusBar.setMessage("Ready");
statusBar.setLoading(true, "Loading...");
statusBar.setError("Error occurred");
statusBar.clearError();
```

## Utilities

### VectorUtils

```typescript
import { VectorUtils } from "@utils/VectorUtils";

const sum = VectorUtils.add(v1, v2);
const diff = VectorUtils.subtract(v1, v2);
const scaled = VectorUtils.multiply(v, 2);
const length = VectorUtils.magnitude(v);
const normalized = VectorUtils.normalize(v);
const dist = VectorUtils.distance(v1, v2);
const interpolated = VectorUtils.lerp(v1, v2, 0.5);
```

### ValidationUtils

```typescript
import { ValidationUtils } from "@utils/ValidationUtils";

const isValid = ValidationUtils.isValidModel(obj);
const hasSection = ValidationUtils.validateSectionId("section-1", model);
const sanitized = ValidationUtils.sanitizeFilename("file name.glb");
const validSize = ValidationUtils.isValidFileSize(file.size, 100);
```

### Logger

```typescript
import { logger } from "@utils/Logger";

logger.debug("Debug message", { data });
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message", error);
```

### PerformanceUtils

```typescript
import { PerformanceUtils } from "@utils/PerformanceUtils";

// Measure
PerformanceUtils.startMeasure("operation");
// ... code
const duration = PerformanceUtils.endMeasure("operation");

// Async measure
const { result, duration } = await PerformanceUtils.measureAsync(
  "async-op",
  async () => {
    /* ... */
  }
);

// Debounce & Throttle
const debounced = PerformanceUtils.debounce(fn, 300);
const throttled = PerformanceUtils.throttle(fn, 1000);
```

## Events

### Event Types

```typescript
export enum EventType {
  MODEL_LOAD_START = "model_load_start",
  MODEL_LOAD_SUCCESS = "model_load_success",
  MODEL_LOAD_ERROR = "model_load_error",
  SECTION_SELECT = "section_select",
  SECTION_DESELECT = "section_deselect",
  SECTION_FOCUS = "section_focus",
  SECTION_ISOLATE = "section_isolate",
  SECTION_HIGHLIGHT = "section_highlight",
  SECTION_DEHIGHLIGHT = "section_dehighlight",
  VIEW_RESET = "view_reset",
  VIEW_ZOOM = "view_zoom",
  VIEW_MODE_CHANGE = "view_mode_change",
  ANIMATION_START = "animation_start",
  ANIMATION_COMPLETE = "animation_complete",
  STATE_UPDATE = "state_update",
  ERROR = "error",
}
```

### Event Payloads

See `src/domain/events.ts` for complete event definitions and payload types.
