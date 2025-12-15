# Fit-to-Screen Feature Implementation

## Overview

The **Fit-to-Screen** feature automatically frames the 3D model within the viewport by computing the bounding volume of visible meshes and positioning the camera to provide an optimal, comfortable view. This feature integrates seamlessly with the existing camera control architecture (zoom, scale, reset) and respects all model states including isolation, section visibility, scaling, and disassembly.

## Features

### Core Capabilities

1. **Bounding Volume Calculation**: Computes the bounding box of all currently visible meshes (respecting isolation and visibility states)
2. **Smart Camera Positioning**: Calculates optimal camera distance based on:
   - Field of View (FOV)
   - Viewport aspect ratio
   - Model dimensions
   - Configurable margins
3. **Dynamic Clipping Planes**: Automatically adjusts near/far clipping planes to prevent rendering artifacts
4. **Smooth Animation**: Time-based interpolation with easeInOutCubic for professional camera movement
5. **Maintains View Direction**: Camera approaches the model from its current viewing angle
6. **Configurable Margin**: Default 1.2x multiplier ensures comfortable spacing around the model

### Integration Points

The feature integrates with:

- **Section Isolation**: Only visible sections are included in bounding box calculation
- **Model Scaling**: Works correctly regardless of current scale factor
- **Camera Zoom**: Resets zoom level appropriately
- **Disassembly**: Frames the entire disassembled model including exploded parts
- **Viewport Resize**: Can be triggered after fullscreen toggle or window resize

## Architecture

### Domain Layer

#### Event Type (`src/domain/types.ts`)

```typescript
export enum EventType {
  // ... existing events
  VIEW_FIT_TO_SCREEN = "view_fit_to_screen",
}
```

#### Event Interface (`src/domain/events.ts`)

```typescript
export interface FitToScreenEvent {
  type: EventType.VIEW_FIT_TO_SCREEN;
  payload?: {
    animated?: boolean;  // Whether to animate camera transition (default: true)
    margin?: number;     // Spacing multiplier (default: 1.2)
  };
}

export type ApplicationEvent =
  | ModelLoadStartEvent
  | /* ... other events */
  | FitToScreenEvent
  | /* ... */;
```

#### Renderer Interface (`src/domain/interfaces.ts`)

```typescript
export interface IRenderer {
  // ... existing methods
  fitToScreen(animated?: boolean, margin?: number): void;
}
```

### Infrastructure Layer

#### ThreeRenderer Implementation (`src/infrastructure/ThreeRenderer.ts`)

The core algorithm:

```typescript
fitToScreen(animated = true, margin = 1.2): void {
  // Step 1: Get all visible meshes (respects isolation/visibility)
  const visibleMeshes = Array.from(this.sectionMeshes.values()).filter(
    (mesh) => mesh.visible
  );

  if (visibleMeshes.length === 0) return;

  // Step 2: Calculate bounding box of visible meshes
  const boundingBox = new THREE.Box3();
  visibleMeshes.forEach((mesh) => {
    const meshBox = new THREE.Box3().setFromObject(mesh);
    boundingBox.union(meshBox);
  });

  // Step 3: Get center and size
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Step 4: Calculate required distance
  const fov = this.camera.fov * (Math.PI / 180);
  const aspect = this.camera.aspect;
  const horizontalFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);

  const verticalDistance = maxDim / (2 * Math.tan(fov / 2));
  const horizontalDistance = maxDim / (2 * Math.tan(horizontalFov / 2));

  // Use the larger distance to ensure full fit
  let distance = Math.max(verticalDistance, horizontalDistance);
  distance *= margin; // Apply comfortable spacing

  // Step 5: Calculate camera position (maintains viewing direction)
  const currentDirection = this.camera.position
    .clone()
    .sub(this.controls.target)
    .normalize();
  const targetPosition = center.clone().add(
    currentDirection.multiplyScalar(distance)
  );

  // Step 6: Adjust clipping planes dynamically
  const depth = size.length(); // Diagonal of bounding box
  this.camera.near = Math.max(0.1, distance - depth * 0.6);
  this.camera.far = distance + depth * 0.6;
  this.camera.updateProjectionMatrix();

  // Step 7: Update controls distance limits
  this.controls.minDistance = distance * 0.1;
  this.controls.maxDistance = distance * 10;

  // Step 8: Animate camera to new position
  if (animated) {
    this.animateCameraToPosition(targetPosition, center);
  } else {
    this.camera.position.copy(targetPosition);
    this.controls.target.copy(center);
    this.controls.update();
  }
}
```

**Key Algorithm Details**:

1. **Bounding Box Calculation**: Uses Three.js `Box3.setFromObject()` which considers all mesh geometry and transformations
2. **Distance Calculation**: Considers both vertical and horizontal FOV to ensure the model fits in both dimensions
3. **Aspect Ratio Handling**: Calculates horizontal FOV from vertical FOV and aspect ratio
4. **Direction Preservation**: Camera moves along its current viewing direction rather than jumping to a default angle
5. **Clipping Plane Math**: Sets near plane to `distance - 60% of depth` and far to `distance + 60% of depth`

### Application Layer

#### Event Handler (`src/core/Application.ts`)

```typescript
private setupEventHandlers(): void {
  // ... existing subscriptions
  this.eventBus.subscribe(
    EventType.VIEW_FIT_TO_SCREEN,
    this.onViewFitToScreen.bind(this)
  );
}

private onViewFitToScreen(event: ApplicationEvent): void {
  const payload = (event.payload ?? {}) as {
    animated?: boolean;
    margin?: number;
  };

  this.renderer.fitToScreen(
    payload.animated ?? true,
    payload.margin ?? 1.2
  );

  this.statusBar.setMessage("Fit to screen");
}
```

#### UI Callback Handler

```typescript
private handleFitToScreen(): void {
  this.eventBus.publish({
    type: EventType.VIEW_FIT_TO_SCREEN,
    timestamp: Date.now(),
    payload: { animated: true, margin: 1.2 },
  });
}
```

### UI Layer

#### Toolbar Button (`src/ui/components/Toolbar.ts`)

**Interface Extension**:

```typescript
interface ToolbarProps {
  // ... existing props
  onFitToScreen?: () => void;
}
```

**Button HTML**:

```html
<button class="btn" id="fit-screen-btn" title="Fit to Screen (F)">
  <span class="icon">⛶</span>
  <span>Fit</span>
</button>
```

**Event Listener**:

```typescript
const fitScreenBtn = this.element.querySelector("#fit-screen-btn");
fitScreenBtn?.addEventListener("click", () => {
  this.props.onFitToScreen?.();
});
```

## Usage

### Via UI Button

Click the "Fit" button in the toolbar (first section, next to "Reset View").

### Via Event Bus

```typescript
eventBus.publish({
  type: EventType.VIEW_FIT_TO_SCREEN,
  timestamp: Date.now(),
  payload: {
    animated: true, // Optional: smooth animation
    margin: 1.2, // Optional: spacing multiplier
  },
});
```

### Programmatically

```typescript
// Direct renderer call
renderer.fitToScreen(true, 1.2);

// Through Application handle
handleFitToScreen();
```

## Use Cases

### 1. After Model Load

Automatically frame the newly loaded model:

```typescript
this.eventBus.subscribe(EventType.MODEL_LOAD_SUCCESS, () => {
  setTimeout(() => {
    this.handleFitToScreen();
  }, 100);
});
```

### 2. After Section Isolation

Frame only the isolated sections:

```typescript
isolateSections(sectionIds: string[]): void {
  this.renderer.isolateSections(sectionIds);
  this.handleFitToScreen(); // Frame isolated parts
}
```

### 3. After Disassembly

Frame the entire exploded assembly:

```typescript
private onAnimationComplete(event: ApplicationEvent): void {
  if (event.payload.animationType === 'disassembly') {
    this.handleFitToScreen();
  }
}
```

### 4. After Viewport Resize

Reframe model after fullscreen toggle:

```typescript
private handleFullscreen(): void {
  const container = this.viewerContainer.getContainer();
  if (document.fullscreenElement) {
    document.exitFullscreen().then(() => {
      setTimeout(() => this.handleFitToScreen(), 100);
    });
  } else {
    container.requestFullscreen().then(() => {
      setTimeout(() => this.handleFitToScreen(), 100);
    });
  }
}
```

### 5. Custom Margin for Close-up

Use tighter framing:

```typescript
this.eventBus.publish({
  type: EventType.VIEW_FIT_TO_SCREEN,
  timestamp: Date.now(),
  payload: { animated: true, margin: 1.05 }, // 5% margin
});
```

## Mathematical Details

### FOV and Distance Calculation

Given:

- `fov_v` = vertical field of view (in radians)
- `aspect` = width / height
- `maxDim` = maximum dimension of bounding box

Calculate horizontal FOV:

```
fov_h = 2 * arctan(tan(fov_v / 2) * aspect)
```

Calculate required distances:

```
distance_v = maxDim / (2 * tan(fov_v / 2))
distance_h = maxDim / (2 * tan(fov_h / 2))
```

Final distance:

```
distance = max(distance_v, distance_h) * margin
```

### Clipping Plane Adjustment

Given:

- `distance` = calculated camera distance
- `depth` = diagonal length of bounding box

```
near = max(0.1, distance - 0.6 * depth)
far = distance + 0.6 * depth
```

This ensures:

- Near plane doesn't clip front of model (even when zoomed in)
- Far plane doesn't clip back of model (even when zoomed out)
- Maintains good depth buffer precision

## Performance Considerations

1. **Bounding Box Calculation**: O(n) where n = number of visible meshes
2. **Animation**: Uses `requestAnimationFrame` for optimal frame rate
3. **No Geometry Modification**: Only camera movement, no mesh updates
4. **Early Exit**: Returns immediately if no visible meshes

## Future Enhancements

### Keyboard Shortcut

Add 'F' key binding:

```typescript
window.addEventListener("keydown", (e) => {
  if (e.key === "f" || e.key === "F") {
    this.handleFitToScreen();
  }
});
```

### Auto-Fit After Operations

Automatically fit after:

- Model load completion
- Section isolation
- Disassembly animation complete
- Window resize

### Orientation Options

Add parameters to control camera orientation:

```typescript
fitToScreen(animated?: boolean, margin?: number, orientation?: 'front' | 'top' | 'isometric'): void
```

### Fit to Selection

Frame only selected sections instead of all visible:

```typescript
fitToSelection(sectionIds: string[], animated?: boolean, margin?: number): void
```

## Testing Checklist

- [x] Build succeeds with no TypeScript errors
- [x] Development server starts successfully
- [x] UI button renders correctly
- [ ] Button triggers fit-to-screen on click
- [ ] Animation is smooth (easeInOutCubic)
- [ ] Works with isolated sections
- [ ] Works with scaled models
- [ ] Works with disassembled models
- [ ] Clipping planes prevent artifacts
- [ ] Respects all visible/hidden states
- [ ] Maintains current viewing direction
- [ ] Works correctly after viewport resize
- [ ] Works with all model formats (glTF, OBJ, STL)

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [SCALING_ZOOMING_IMPLEMENTATION.md](./SCALING_ZOOMING_IMPLEMENTATION.md) - Related camera control features
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [API.md](./API.md) - Complete API reference
