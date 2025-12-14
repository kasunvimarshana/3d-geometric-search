# Click Event Handling Documentation

## Overview

The 3D Geometric Search application now includes comprehensive click event handling that allows users to interact with 3D models by clicking directly on sections in the viewport. This document describes the click event system, implementation details, and error handling.

## Click Event Types

### 1. MODEL_CLICKED

- **Triggered**: When the 3D viewport is clicked (any click)
- **Payload**: `{ x: number, y: number, button: number }`
- **Use Case**: General viewport interaction tracking

### 2. SECTION_CLICKED

- **Triggered**: When a user clicks on a specific section in the 3D model
- **Payload**: `{ sectionId: string, x: number, y: number, button: number }`
- **Use Case**: Section selection via 3D viewport
- **Behavior**: Automatically selects the clicked section

### 3. VIEWPORT_CLICKED

- **Triggered**: When the user clicks on empty space (not on any section)
- **Payload**: `{ x: number, y: number, button: number }`
- **Use Case**: Deselecting sections, background clicks
- **Behavior**: Clears current selection on left-click

### 4. CLICK_ERROR

- **Triggered**: When an error occurs during click handling
- **Payload**: `{ error: Error, context: string }`
- **Use Case**: Error recovery and logging
- **Behavior**: Logs error, displays status message, continues operation

## Architecture

### Raycasting Implementation

The click handling system uses Three.js raycasting to detect which 3D object was clicked:

```typescript
// In ThreeJSRenderer
private raycaster: THREE.Raycaster = new THREE.Raycaster();
private mouse: THREE.Vector2 = new THREE.Vector2();
```

**Process Flow:**

1. User clicks on viewport canvas
2. Mouse coordinates converted to normalized device coordinates (-1 to +1)
3. Raycaster configured with camera and mouse position
4. Intersections calculated with all model children
5. Clicked object identified by traversing up hierarchy to find `userData.sectionId`
6. Appropriate event published based on intersection result

### Component Interaction

```
User Click
    ↓
ThreeJSRenderer.clickHandler
    ↓
Raycasting & Section Identification
    ↓
ModelService.handleSectionClick() or handleViewportClick()
    ↓
Event Published (SECTION_CLICKED or VIEWPORT_CLICKED)
    ↓
ModelService.selectSection() or clearSelection()
    ↓
ApplicationController updates UI
```

## Key Methods

### IRenderer Interface

```typescript
interface IRenderer {
  enableClickHandling(
    onSectionClick: (sectionId: string, event: MouseEvent) => void,
    onViewportClick: (event: MouseEvent) => void
  ): void;

  disableClickHandling(): void;
}
```

### ThreeJSRenderer Implementation

**enableClickHandling()**

- Registers click event listener on renderer canvas
- Stores callbacks for section and viewport clicks
- Handles raycasting and section identification
- Gracefully handles errors during click processing

**disableClickHandling()**

- Removes click event listener
- Clears callbacks
- Called when model is cleared or disposed

### ModelService Methods

**enableClickHandling()**

```typescript
enableClickHandling(): void {
  this.renderer.enableClickHandling(
    (sectionId, event) => this.handleSectionClick(sectionId, event),
    (event) => this.handleViewportClick(event)
  );
}
```

**handleSectionClick(sectionId, event)**

- Validates model is loaded
- Validates sectionId
- Publishes SECTION_CLICKED event
- Calls selectSection() to update selection
- Handles errors with CLICK_ERROR event

**handleViewportClick(event)**

- Publishes VIEWPORT_CLICKED event
- Clears selection on left-click (button === 0)
- Handles errors with CLICK_ERROR event

**disableClickHandling()**

```typescript
disableClickHandling(): void {
  this.renderer.disableClickHandling();
}
```

## Error Handling

### Error Scenarios

1. **No Model Loaded**
   - Check: `if (!this.currentModel)` in handleSectionClick
   - Action: Log warning, ignore click
   - No error event published (expected state)

2. **Invalid Section ID**
   - Check: `if (!sectionId)` in handleSectionClick
   - Action: Log warning, ignore click
   - No error event published (user may click on non-section geometry)

3. **Raycasting Error**
   - Catch: Try-catch in clickHandler
   - Action: Log error, continue operation
   - Event: CLICK_ERROR published

4. **Section Not Found**
   - Handled by ModelService.selectSection() validation
   - Action: Log warning, no selection change
   - Event: Existing error handling applies

5. **Renderer Not Initialized**
   - Check: `if (!this.renderer || !this.renderer.domElement)`
   - Action: Log error, return early
   - Safe: No event listener added

### Error Recovery

All click operations use graceful error handling:

- Try-catch blocks at every level
- Operations continue even if individual clicks fail
- User receives feedback via status bar
- Console logging for debugging
- No UI freezes or crashes

## Lifecycle Management

### Enabling Click Handling

Click handling is **automatically enabled** when a model is loaded:

```typescript
// In ApplicationController MODEL_LOADED handler
this.modelService.enableClickHandling();
```

### Disabling Click Handling

Click handling is **automatically disabled** when the model is cleared:

```typescript
// In ApplicationController MODEL_CLEARED handler
this.modelService.disableClickHandling();
```

### State Transitions

```
Initial State: No click handling
    ↓
Model Loaded → enableClickHandling()
    ↓
Active State: Clicks are processed
    ↓
Model Cleared → disableClickHandling()
    ↓
Disabled State: No click handling
```

## Event Handler Examples

### ApplicationController

**Section Clicked Handler**

```typescript
this.eventBus.subscribe(EventType.SECTION_CLICKED, (event) => {
  try {
    const payload = event.payload as { sectionId: string; x: number; y: number };
    console.log('[Controller] Section clicked:', payload.sectionId);
    // Selection is handled automatically by ModelService.handleSectionClick
  } catch (error) {
    console.error('[Controller] Error handling SECTION_CLICKED:', error);
  }
});
```

**Viewport Clicked Handler**

```typescript
this.eventBus.subscribe(EventType.VIEWPORT_CLICKED, (event) => {
  try {
    const payload = event.payload as { x: number; y: number };
    console.log('[Controller] Viewport clicked at:', payload.x, payload.y);
    // Selection clearing is handled automatically by ModelService.handleViewportClick
  } catch (error) {
    console.error('[Controller] Error handling VIEWPORT_CLICKED:', error);
  }
});
```

**Click Error Handler**

```typescript
this.eventBus.subscribe(EventType.CLICK_ERROR, (event) => {
  try {
    const payload = event.payload as { error: Error; context: string };
    const message = payload.error?.message || 'Unknown error';
    this.statusBar.setStatus(`Click error (${payload.context}): ${message}`, 'error');
  } catch (error) {
    console.error('[Controller] Error handling CLICK_ERROR:', error);
  }
});
```

## Testing Click Events

### Manual Testing Checklist

- [ ] Click on a section → Section is selected and highlighted
- [ ] Click on different section → Previous deselected, new selected
- [ ] Click on empty space → Current selection cleared
- [ ] Right-click on section → No selection change (camera control)
- [ ] Click before model loaded → No error, graceful handling
- [ ] Click during model loading → Ignored safely
- [ ] Click after model cleared → No error, no action
- [ ] Multiple rapid clicks → All handled without error
- [ ] Click on edge between sections → Nearest section selected
- [ ] Click while zooming/rotating → Camera control not affected

### Using ModelEventTester

```typescript
// In browser console after loading model
const tester = new ModelEventTester(eventBus);

// Test section click
tester.testSectionClick('section-123', 100, 200, 0);

// Test viewport click
tester.testViewportClick(150, 250, 0);

// Test click error
tester.testClickError(new Error('Test error'), 'test context');

// View event history
console.table(tester.getEventHistory());
```

## Performance Considerations

### Raycasting Optimization

- **Scope**: Raycasting only checks `modelGroup.children` with `recursive: true`
- **Frequency**: Only triggered on actual click (not mouse move)
- **Cost**: O(n) where n = number of meshes in model
- **Typical**: < 5ms for models with < 1000 sections

### Event Publishing

- **Click events do NOT queue**: Immediate processing
- **No recursive event loops**: Click → Select → No further clicks triggered
- **Throttling**: Not needed (clicks are naturally throttled by user)

## Best Practices

### Do's ✅

- Always check if model is loaded before processing clicks
- Use try-catch in all click handlers
- Publish CLICK_ERROR for exceptional conditions
- Log click events for debugging
- Keep click handlers lightweight (delegate to services)
- Validate sectionId before using

### Don'ts ❌

- Don't perform heavy computations in click handlers
- Don't modify renderer state directly from click handlers
- Don't assume clicks always hit a section
- Don't block UI thread during click processing
- Don't forget to disable click handling on cleanup

## Future Enhancements

### Potential Improvements

1. **Double-Click Support**
   - Detect double-clicks on sections
   - Trigger focus/zoom on double-click

2. **Right-Click Context Menu**
   - Show section-specific options
   - Quick actions (hide, focus, properties)

3. **Drag Selection**
   - Click and drag to select multiple sections
   - Rectangular selection region

4. **Click-Through Detection**
   - Cycle through overlapping sections
   - Handle z-fighting scenarios

5. **Touch Support**
   - Handle touch events for mobile/tablet
   - Multi-touch gestures

6. **Click Throttling**
   - Prevent excessive clicking
   - Debounce rapid clicks

## Troubleshooting

### Common Issues

**Issue**: Clicks not working

- Check: Is model loaded? (`eventBus` shows MODEL_LOADED)
- Check: Is click handling enabled? (Console shows "Click handling enabled")
- Check: Are sections visible? (Not hidden or outside view frustum)

**Issue**: Wrong section selected

- Check: `userData.sectionId` set correctly on meshes
- Check: Hierarchy traversal finds correct parent
- Debug: Log intersected objects in clickHandler

**Issue**: Empty space clicks not clearing selection

- Check: Left mouse button (event.button === 0)
- Check: VIEWPORT_CLICKED event published
- Check: ModelService.handleViewportClick() called

**Issue**: Click handling not disabled

- Check: MODEL_CLEARED event published
- Check: disableClickHandling() called in controller
- Check: Event listener removed from canvas

## Related Documentation

- [EVENT_HANDLING_ARCHITECTURE.md](./EVENT_HANDLING_ARCHITECTURE.md) - Complete event system overview
- [MODEL_EVENT_HANDLING.md](./MODEL_EVENT_HANDLING.md) - All model-related events
- [MODEL_EVENT_IMPLEMENTATION_SUMMARY.md](./MODEL_EVENT_IMPLEMENTATION_SUMMARY.md) - Implementation details

---

_Last Updated: Current Session_
_Version: 2.0.0_
