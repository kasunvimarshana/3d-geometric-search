# Model Event Architecture Documentation

## Overview

The 3D Geometric Search application implements a robust, centralized model event handling system that ensures all model lifecycle changes, state transitions, and user interactions are consistently captured, validated, and propagated throughout the application.

## Architecture Principles

### 1. **Centralized Event Coordination**

- All model-related events flow through the `ModelEventCoordinator`
- Single source of truth for model state and lifecycle
- Eliminates event duplication and inconsistencies

### 2. **Separation of Concerns**

- **ModelEventCoordinator**: Orchestrates and validates events
- **ViewerController**: Emits low-level 3D scene events
- **ApplicationController**: Handles business logic and UI synchronization
- **UIController**: Responds to UI update events

### 3. **Event Validation**

- All events are validated before emission
- Type checking and data validation
- Error events for failed validations

### 4. **Event History & Debugging**

- Comprehensive event history tracking
- Debug mode for detailed logging
- Event filtering and analysis capabilities

## Event Categories

### Model Lifecycle Events

```javascript
// Loading Phase
EVENTS.MODEL_LOAD_START; // Emitted when model loading begins
EVENTS.MODEL_LOAD_PROGRESS; // Progress updates during loading
EVENTS.MODEL_LOADED; // Model successfully loaded
EVENTS.MODEL_LOAD_ERROR; // Loading failed
EVENTS.MODEL_UNLOAD; // Model removed from scene
EVENTS.MODEL_UPDATED; // Model added or modified in scene
EVENTS.MODEL_PARSED; // Model data parsed successfully
```

### Section Lifecycle Events

```javascript
// Section Discovery
EVENTS.SECTIONS_DISCOVERED; // All sections parsed and identified
EVENTS.SECTIONS_UPDATED; // Section list modified

// Section Interactions
EVENTS.SECTION_SELECTED; // User selects a section
EVENTS.SECTION_DESELECTED; // Selection cleared
EVENTS.SECTION_ISOLATED; // Section isolated (others hidden)
EVENTS.SECTION_HIGHLIGHTED; // Section visually highlighted
EVENTS.SECTION_UNHIGHLIGHTED; // Highlight removed
EVENTS.SECTION_VISIBILITY_CHANGED; // Visibility toggle
```

### Assembly/Disassembly Events

```javascript
EVENTS.MODEL_DISASSEMBLED; // Model disassembled (isolation active)
EVENTS.MODEL_REASSEMBLED; // Model reassembled (isolation cleared)
EVENTS.ISOLATION_CLEARED; // All sections visible again
```

### Focus and Navigation Events

```javascript
EVENTS.FOCUS_MODE_ENTERED; // Focus mode activated
EVENTS.FOCUS_MODE_EXITED; // Focus mode deactivated
EVENTS.FOCUS_TARGET_CHANGED; // Focus target changed
```

### Camera and View Events

```javascript
EVENTS.VIEW_RESET; // Camera reset to default
EVENTS.CAMERA_PRESET_CHANGED; // Preset view applied
EVENTS.CAMERA_POSITION_CHANGED; // Camera moved
EVENTS.FRAME_OBJECT; // Object framed in view
```

### Visual State Events

```javascript
EVENTS.ZOOM_CHANGED; // Zoom level changed
EVENTS.WIREFRAME_TOGGLED; // Wireframe mode toggled
EVENTS.GRID_TOGGLED; // Grid visibility toggled
EVENTS.AXES_TOGGLED; // Axes visibility toggled
EVENTS.FULLSCREEN_TOGGLED; // Fullscreen mode toggled
```

### UI Synchronization Events

```javascript
EVENTS.UI_UPDATE_REQUIRED; // UI needs updating
EVENTS.NAVIGATION_UPDATE_REQUIRED; // Navigation panel needs updating
EVENTS.SELECTION_STATE_CHANGED; // Selection state modified
```

### State Management Events

```javascript
EVENTS.STATE_CHANGED; // Application state changed
EVENTS.STATE_SNAPSHOT; // State snapshot created
EVENTS.STATE_RESTORED; // State restored from snapshot
```

### Error and Warning Events

```javascript
EVENTS.ERROR_OCCURRED; // Error occurred
EVENTS.WARNING_OCCURRED; // Warning issued
```

## Event Flow Diagrams

### Model Loading Flow

```
User Action (Click "Load Model")
    ↓
ApplicationController.handleLoadModel()
    ↓
ModelEventCoordinator.emitEvent(MODEL_LOAD_START)
    ↓
EventBus.emit(MODEL_LOAD_START)
    ↓
ModelEventCoordinator.handleModelLoadStart()
    ↓
EventBus.emit(UI_UPDATE_REQUIRED, {type: 'loading'})
    ↓
ApplicationController.handleUIUpdateRequired()
    ↓
UIController.showLoading()
    ↓
[Model loads...]
    ↓
ViewerController.addModel()
    ↓
EventBus.emit(MODEL_UPDATED)
    ↓
ModelEventCoordinator.emitEvent(MODEL_LOADED)
    ↓
ModelEventCoordinator.handleModelLoaded()
    ↓
EventBus.emit(SECTIONS_DISCOVERED)
EventBus.emit(UI_UPDATE_REQUIRED, {type: 'loaded'})
EventBus.emit(NAVIGATION_UPDATE_REQUIRED, {type: 'model-loaded'})
    ↓
ApplicationController handlers update UI
    ↓
UIController updates display
```

### Section Isolation Flow

```
User Action (Click isolate icon)
    ↓
UIController.handleSectionIsolate()
    ↓
EventBus.emit(SECTION_ISOLATED, {sectionId})
    ↓
ModelEventCoordinator.handleSectionIsolated()
    ↓
EventBus.emit(MODEL_DISASSEMBLED)
EventBus.emit(UI_UPDATE_REQUIRED, {type: 'isolation'})
EventBus.emit(NAVIGATION_UPDATE_REQUIRED, {type: 'section-isolated'})
    ↓
ApplicationController.handleSectionIsolated()
    ↓
SectionManagerService.isolateSection()
    ↓
ViewerController updates visibility
```

### Focus Mode Flow

```
User Action (Isolate section)
    ↓
ViewerController.enterFocusMode(object, sectionId)
    ↓
[Hide other objects, focus camera]
    ↓
EventBus.emit(FOCUS_MODE_ENTERED, {object, sectionId})
    ↓
ModelEventCoordinator.handleFocusModeEntered()
    ↓
EventBus.emit(UI_UPDATE_REQUIRED, {type: 'focus-entered'})
    ↓
StateManager updates state
    ↓
---
User presses Esc
    ↓
ViewerController.exitFocusMode()
    ↓
[Restore visibility, restore camera]
    ↓
EventBus.emit(FOCUS_MODE_EXITED)
    ↓
ModelEventCoordinator.handleFocusModeExited()
    ↓
EventBus.emit(UI_UPDATE_REQUIRED, {type: 'focus-exited'})
    ↓
StateManager updates state
```

## Component Responsibilities

### ModelEventCoordinator

**Purpose**: Central hub for model event orchestration and validation

**Responsibilities**:

- Validate all model-related events
- Track event history for debugging
- Coordinate state updates across components
- Emit synchronization events (UI_UPDATE_REQUIRED, NAVIGATION_UPDATE_REQUIRED)
- Provide state snapshots and restoration

**Key Methods**:

```javascript
emitEvent(eventType, data, options); // Emit validated event
validateEvent(eventType, data); // Validate event data
trackEvent(eventType, data, metadata); // Record in history
getCurrentState(); // Get current model state
createSnapshot(); // Create state snapshot
restoreSnapshot(snapshot); // Restore from snapshot
setDebugMode(enabled); // Enable/disable debugging
getEventHistory(filter); // Retrieve event history
```

### ViewerController

**Purpose**: Manage 3D scene and emit low-level visualization events

**Emits**:

- `MODEL_UPDATED` - When model is added to scene
- `MODEL_UNLOAD` - When model is removed
- `CAMERA_POSITION_CHANGED` - When camera moves
- `FOCUS_MODE_ENTERED` - When entering focus mode
- `FOCUS_MODE_EXITED` - When exiting focus mode
- `CAMERA_PRESET_CHANGED` - When camera preset applied
- `FRAME_OBJECT` - When object is framed
- `WIREFRAME_TOGGLED` - Wireframe mode changed
- `GRID_TOGGLED` - Grid visibility changed
- `AXES_TOGGLED` - Axes visibility changed

### ApplicationController

**Purpose**: Business logic coordinator and event router

**Responsibilities**:

- Coordinate model loading with event emission
- Handle user interactions and emit corresponding events
- Subscribe to synchronization events
- Update UI based on event coordinator instructions

**Key Event Handlers**:

```javascript
handleUIUpdateRequired(data); // Process UI update events
handleNavigationUpdateRequired(data); // Process navigation events
handleSelectionStateChanged(data); // Process selection changes
```

### UIController

**Purpose**: Manage user interface elements and respond to UI events

**Subscribes To**:

- `UI_UPDATE_REQUIRED` - Updates UI based on coordinator instructions
- `SELECTION_STATE_CHANGED` - Updates selection display
- `NAVIGATION_UPDATE_REQUIRED` - Updates section navigation

**Key Methods**:

```javascript
showLoading(message); // Display loading overlay
updateLoadingProgress(percent); // Update progress indicator
showSuccess(message); // Show success message
showError(message); // Show error message
renderSections(sections); // Render section list
updateSectionHighlight(id, bool); // Update section highlight
clearSectionHighlights(); // Clear all highlights
updateSectionInfo(section); // Display section details
clearSectionInfo(); // Clear section details
```

## Event Validation

The ModelEventCoordinator validates events before emission:

```javascript
validateEvent(eventType, data) {
  switch (eventType) {
    case EVENTS.MODEL_LOAD_START:
      return data && data.modelId && data.modelName;

    case EVENTS.MODEL_LOADED:
      return data && data.model && data.model.id;

    case EVENTS.SECTION_SELECTED:
    case EVENTS.SECTION_ISOLATED:
      return data && data.sectionId;

    case EVENTS.SECTION_HIGHLIGHTED:
      return data && data.sectionId && typeof data.highlighted === 'boolean';

    case EVENTS.SECTIONS_DISCOVERED:
      return data && Array.isArray(data.sections);

    default:
      return true;
  }
}
```

## Event History & Debugging

### Enable Debug Mode

```javascript
// In browser console or ApplicationController.initialize()
this.eventCoordinator.setDebugMode(true);
```

### Query Event History

```javascript
// Get all events
const allEvents = this.eventCoordinator.getEventHistory();

// Filter by event type
const loadEvents = this.eventCoordinator.getEventHistory({
  eventType: EVENTS.MODEL_LOADED,
});

// Filter by time range
const recentEvents = this.eventCoordinator.getEventHistory({
  since: Date.now() - 5 * 60 * 1000, // Last 5 minutes
});
```

### Event History Structure

```javascript
{
  type: 'model:loaded',
  data: { model: {...}, sections: [...], object3D: {...} },
  metadata: { source: 'repository', userId: '...' },
  timestamp: 1702569600000
}
```

## State Snapshots

### Create Snapshot

```javascript
const snapshot = this.eventCoordinator.createSnapshot();
// Emits: EVENTS.STATE_SNAPSHOT
```

### Restore Snapshot

```javascript
this.eventCoordinator.restoreSnapshot(snapshot);
// Emits: EVENTS.STATE_RESTORED
// Emits: EVENTS.UI_UPDATE_REQUIRED
// Emits: EVENTS.NAVIGATION_UPDATE_REQUIRED
```

## Best Practices

### 1. **Always Use ModelEventCoordinator for Model Events**

✅ **Good**:

```javascript
this.eventCoordinator.emitEvent(EVENTS.MODEL_LOADED, {
  model: {...},
  sections: [...],
  object3D: {...}
});
```

❌ **Bad**:

```javascript
this.eventBus.emit(EVENTS.MODEL_LOADED, model);
```

### 2. **Provide Complete Event Data**

✅ **Good**:

```javascript
this.eventCoordinator.emitEvent(EVENTS.SECTION_ISOLATED, {
  sectionId: 'section-1',
  section: {...},
  timestamp: Date.now()
});
```

❌ **Bad**:

```javascript
this.eventCoordinator.emitEvent(EVENTS.SECTION_ISOLATED, 'section-1');
```

### 3. **Handle Synchronization Events**

✅ **Good**:

```javascript
this.eventBus.subscribe(EVENTS.UI_UPDATE_REQUIRED, data => {
  this.handleUIUpdateRequired(data);
});

handleUIUpdateRequired(data) {
  switch (data.type) {
    case 'loading':
      this.uiController.showLoading(data.message);
      break;
    case 'loaded':
      this.uiController.hideLoading();
      break;
    // ... handle all types
  }
}
```

### 4. **Use Event History for Debugging**

```javascript
// When investigating issues
if (error) {
  const history = this.eventCoordinator.getEventHistory({
    since: errorTimestamp - 10000, // 10 seconds before error
  });
  console.log('Events leading to error:', history);
}
```

### 5. **Leverage State Snapshots for Undo/Redo**

```javascript
// Before major operation
const snapshot = this.eventCoordinator.createSnapshot();

try {
  // Perform operation
  this.performComplexOperation();
} catch (error) {
  // Restore previous state on error
  this.eventCoordinator.restoreSnapshot(snapshot);
}
```

## Error Handling

### Event Emission Errors

```javascript
const success = this.eventCoordinator.emitEvent(EVENTS.MODEL_LOADED, data);
if (!success) {
  // Event validation failed or emission error
  // ERROR_OCCURRED event automatically emitted
  console.error('Failed to emit MODEL_LOADED event');
}
```

### Event Validation Errors

```javascript
// Validation failure automatically emits:
this.eventBus.emit(EVENTS.ERROR_OCCURRED, {
  type: 'validation',
  event: eventType,
  data: data,
  message: 'Event validation failed',
});
```

## Testing Event Flow

### Manual Testing

```javascript
// Enable debug mode
this.eventCoordinator.setDebugMode(true);

// Perform action
this.handleLoadModel();

// Check event history
const events = this.eventCoordinator.getEventHistory();
console.table(
  events.map(e => ({
    type: e.type,
    timestamp: new Date(e.timestamp).toISOString(),
  }))
);
```

### Automated Testing

```javascript
describe('ModelEventCoordinator', () => {
  it('should emit MODEL_LOADED event with complete data', () => {
    const coordinator = new ModelEventCoordinator(eventBus, stateManager);

    const emitted = coordinator.emitEvent(EVENTS.MODEL_LOADED, {
      model: { id: 'test', name: 'Test Model' },
      sections: [],
      object3D: {},
    });

    expect(emitted).toBe(true);
    expect(coordinator.currentModel).toBeDefined();
  });
});
```

## Performance Considerations

### Event History Size

```javascript
// Default: 100 events
// Increase for detailed debugging
this.eventCoordinator.maxHistorySize = 500;

// Clear when not needed
this.eventCoordinator.clearEventHistory();
```

### Debug Mode

```javascript
// Disable in production for performance
if (process.env.NODE_ENV === 'production') {
  this.eventCoordinator.setDebugMode(false);
}
```

### Event Validation

```javascript
// Disable for performance-critical sections
this.eventCoordinator.setEventValidation(false);

// Perform operations
performBulkOperations();

// Re-enable
this.eventCoordinator.setEventValidation(true);
```

## Migration Guide

### From Direct EventBus Usage

**Before**:

```javascript
this.eventBus.emit(EVENTS.MODEL_LOADED, model);
```

**After**:

```javascript
this.eventCoordinator.emitEvent(EVENTS.MODEL_LOADED, {
  model: {...},
  sections: [...],
  object3D: {...}
});
```

### Adding New Event Handlers

1. Define event in `constants.js`:

```javascript
export const EVENTS = {
  // ...
  MY_NEW_EVENT: 'my:new:event',
};
```

2. Add handler in `ModelEventCoordinator.js`:

```javascript
initializeEventHandlers() {
  // ...
  this.eventBus.subscribe(EVENTS.MY_NEW_EVENT, data =>
    this.handleMyNewEvent(data)
  );
}

handleMyNewEvent(data) {
  // Validate, process, emit synchronization events
}
```

3. Add validation in `validateEvent()`:

```javascript
case EVENTS.MY_NEW_EVENT:
  return data && data.requiredField;
```

4. Emit from appropriate component:

```javascript
this.eventCoordinator.emitEvent(EVENTS.MY_NEW_EVENT, {
  requiredField: 'value',
  timestamp: Date.now(),
});
```

## Troubleshooting

### Events Not Propagating

1. **Check event coordinator initialization**:

```javascript
console.log(this.eventCoordinator); // Should not be undefined
```

2. **Enable debug mode**:

```javascript
this.eventCoordinator.setDebugMode(true);
```

3. **Check event history**:

```javascript
const history = this.eventCoordinator.getEventHistory();
console.log('Recent events:', history.slice(-10));
```

### Validation Failures

```javascript
// Check validation logic
const isValid = this.eventCoordinator.validateEvent(eventType, data);
console.log('Validation result:', isValid);
```

### Missing Event Handlers

```javascript
// List registered event types
const eventTypes = this.eventBus.getEventTypes();
console.log('Registered events:', eventTypes);
```

## Summary

The Model Event Architecture provides:

✅ **Centralized Coordination** - Single source of truth for model events  
✅ **Validation** - All events validated before emission  
✅ **History Tracking** - Complete audit trail of all events  
✅ **Debugging Tools** - Debug mode and event filtering  
✅ **State Management** - Snapshots and restoration  
✅ **Synchronization** - Consistent UI and state updates  
✅ **Maintainability** - Clean separation of concerns  
✅ **Scalability** - Easy to extend with new events  
✅ **Predictability** - Clear event flow and handling  
✅ **Reliability** - Error handling and recovery

For questions or issues, refer to the source code documentation in:

- `/src/services/ModelEventCoordinator.js`
- `/src/domain/constants.js` (EVENTS)
- `/src/controllers/ApplicationController.js` (Integration)
- `/src/controllers/ViewerController.js` (Event emission)
