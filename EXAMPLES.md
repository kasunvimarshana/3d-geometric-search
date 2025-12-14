# Usage Examples

This document provides practical examples of using the 3D Geometric Search application.

## Basic Usage

### Loading a Model

1. Click the "Load Model" button in the header
2. Select a supported 3D file (.gltf, .glb, .obj, .stl, .step)
3. Wait for the model to load
4. The model structure will appear in the left sidebar
5. The 3D visualization will appear in the center viewport

### Navigating the Model

**Rotate**: Click and drag in the viewport
**Pan**: Right-click and drag (or Ctrl+drag)
**Zoom**: Scroll wheel or use the zoom buttons

### Selecting Sections

1. Click on a section name in the tree view
2. The section will be highlighted in the viewport
3. Properties will appear in the properties panel

### Focusing on a Section

1. Click the 🎯 button next to a section name
2. The camera will move to frame the selected section

## Advanced Features

### View Controls

**Reset View**: Returns camera to initial position
**Fit View**: Frames the entire model in the viewport
**Zoom In/Out**: Incremental zoom controls
**Fullscreen**: Expands viewport to full screen

### Display Options

**Wireframe**: Toggle wireframe mode to see model edges
**Grid**: Show/hide the floor grid
**Axes**: Show/hide the coordinate axes (XYZ)

### Model Operations

**Disassemble**: Separates model parts (feature in development)
**Reassemble**: Returns model to original state

## Programmatic Usage

### Custom Initialization

```typescript
import { EventBusService, ModelService, ViewService } from '@application/services';
import { ThreeJSRenderer } from '@infrastructure/renderers';
import { CompositeModelLoader } from '@infrastructure/loaders';

// Create dependencies
const eventBus = new EventBusService();
const renderer = new ThreeJSRenderer();
const loader = new CompositeModelLoader();

// Initialize
await renderer.initialize(document.getElementById('viewport')!);

// Create services
const modelService = new ModelService(loader, renderer, eventBus);
const viewService = new ViewService(renderer, eventBus);
```

### Loading Models Programmatically

```typescript
// Load from File object
const file = new File([arrayBuffer], 'model.glb', { type: 'model/gltf-binary' });
await modelService.loadModel(file);

// Access the loaded model
const model = modelService.getCurrentModel();
console.log('Sections:', model?.getAllSections());
```

### Working with Events

```typescript
// Subscribe to model loaded event
eventBus.subscribe(EventType.MODEL_LOADED, (event) => {
  const { filename, sectionCount, format } = event.payload;
  console.log(`Loaded ${filename}: ${sectionCount} sections (${format})`);
});

// Subscribe to section selection
eventBus.subscribe(EventType.SECTION_SELECTED, (event) => {
  const { sectionId } = event.payload;
  console.log('Selected section:', sectionId);
});
```

### Controlling the View

```typescript
// Zoom
viewService.zoomIn();
viewService.zoomOut();

// Reset
viewService.resetView();

// Fit to view
viewService.fitToView();

// Display options
viewService.setWireframe(true);
viewService.setGridVisible(false);
viewService.setAxesVisible(true);
```

### Section Navigation

```typescript
// Select a section
modelService.selectSection('section_id');

// Focus on a section
modelService.focusOnSection('section_id');

// Get selected section
const section = modelService.getSelectedSection();
console.log('Selected:', section?.name);
```

## Integration Examples

### Embedding in Another Application

```html
<!DOCTYPE html>
<html>
<head>
  <title>Embedded 3D Viewer</title>
  <style>
    #viewer-container {
      width: 800px;
      height: 600px;
      border: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div id="viewer-container"></div>
  
  <script type="module">
    import { bootstrap } from './src/main.js';
    
    // Initialize viewer in custom container
    await bootstrap('viewer-container');
  </script>
</body>
</html>
```

### React Integration

```typescript
import { useEffect, useRef } from 'react';
import { ApplicationController } from '@presentation/controllers';

function ModelViewer({ modelUrl }: { modelUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ApplicationController>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize viewer
    const initialize = async () => {
      // Setup services and controller
      // controllerRef.current = new ApplicationController(...);
    };

    void initialize();

    return () => {
      // Cleanup
      controllerRef.current?.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
```

### Vue Integration

```vue
<template>
  <div ref="viewerContainer" class="viewer" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ApplicationController } from '@presentation/controllers';

const viewerContainer = ref<HTMLDivElement>();
let controller: ApplicationController | null = null;

onMounted(async () => {
  if (!viewerContainer.value) return;
  
  // Initialize viewer
  // controller = new ApplicationController(...);
});

onUnmounted(() => {
  controller?.dispose();
});
</script>
```

## Format-Specific Examples

### glTF/GLB

```typescript
// Load glTF with external textures
const file = await fetch('model.gltf').then(r => r.blob());
await modelService.loadModel(new File([file], 'model.gltf'));

// Load binary GLB
const file = await fetch('model.glb').then(r => r.blob());
await modelService.loadModel(new File([file], 'model.glb'));
```

### OBJ

```typescript
// Load OBJ file
const file = await fetch('model.obj').then(r => r.blob());
await modelService.loadModel(new File([file], 'model.obj'));
```

### STL

```typescript
// Load STL file (ASCII or binary)
const file = await fetch('model.stl').then(r => r.blob());
await modelService.loadModel(new File([file], 'model.stl'));
```

## Error Handling

### Catching Load Errors

```typescript
try {
  await modelService.loadModel(file);
} catch (error) {
  if (error instanceof UnsupportedFormatError) {
    console.error('Format not supported:', error.format);
  } else if (error instanceof ParseError) {
    console.error('Failed to parse file:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Event-Based Error Handling

```typescript
eventBus.subscribe(EventType.MODEL_LOAD_ERROR, (event) => {
  const { error } = event.payload;
  
  // Show user-friendly error message
  showNotification('Failed to load model: ' + error.message, 'error');
});
```

## Performance Optimization

### Large Model Handling

```typescript
// Show loading progress
eventBus.subscribe(EventType.MODEL_LOADING, () => {
  showLoadingBar();
});

eventBus.subscribe(EventType.MODEL_LOADED, () => {
  hideLoadingBar();
});

// Lazy load sections
const rootSections = model.getRootSections();
// Only process visible sections initially
```

### Memory Management

```typescript
// Clean up when switching models
modelService.clearModel();

// Dispose renderer when done
renderer.dispose();
eventBus.clear();
```

## Testing

### Unit Testing Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ModelService } from '@application/services';

describe('ModelService', () => {
  let service: ModelService;

  beforeEach(() => {
    const mockLoader = createMockLoader();
    const mockRenderer = createMockRenderer();
    const mockEventBus = createMockEventBus();
    
    service = new ModelService(mockLoader, mockRenderer, mockEventBus);
  });

  it('should load a valid model', async () => {
    const file = createMockFile('test.glb');
    await service.loadModel(file);
    
    const model = service.getCurrentModel();
    expect(model).toBeDefined();
    expect(model?.metadata.filename).toBe('test.glb');
  });
});
```

## Troubleshooting

### Model Not Visible

Check:
1. File format is supported
2. Model has valid geometry
3. Camera is positioned correctly
4. Model is not too small/large

```typescript
// Force fit to view after loading
eventBus.subscribe(EventType.MODEL_LOADED, () => {
  viewService.fitToView();
});
```

### Performance Issues

```typescript
// Reduce quality for large models
renderer.setPixelRatio(1); // Instead of window.devicePixelRatio

// Disable shadows
renderer.shadowMap.enabled = false;

// Use simpler materials
viewService.setWireframe(true);
```

## Additional Resources

- [Three.js Examples](https://threejs.org/examples/)
- [glTF Sample Models](https://github.com/KhronosGroup/glTF-Sample-Models)
- [API Documentation](./API.md)
- [Architecture Guide](./ARCHITECTURE.md)
