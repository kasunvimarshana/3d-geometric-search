# Model Event Handling - Complete Reference

## Overview

This document provides a comprehensive reference for all model-related events in the 3D Geometric Search application. Every model operation publishes appropriate events, and all events are handled gracefully with proper error recovery.

## Model Event Catalog

### 1. Model Lifecycle Events

#### MODEL_LOADING

**Event Class**: `ModelLoadingEvent`  
**Payload**: `{ filename: string }`  
**Published By**: `ModelService.loadModel()`  
**When**: User selects a file to load  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Show loading overlay with filename
- Update status bar: "Loading model..."
- Prepare UI for incoming model

**Error Handling**: None needed (informational event)

---

#### MODEL_LOADED

**Event Class**: `ModelLoadedEvent`  
**Payload**: `{ filename: string; sectionCount: number; format: string }`  
**Published By**: `ModelService.loadModel()`  
**When**: Model successfully loaded and rendered  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Hide loading overlay
- Populate section tree with model structure
- Update status bar: "Model loaded successfully"
- Display model info: filename, section count, format

**Error Handling**:

```typescript
try {
  const model = this.modelService.getCurrentModel();
  if (model) {
    this.sectionTree.setModel(model);
    // ... update UI
  } else {
    console.warn('[Controller] Model loaded but getCurrentModel returned null');
  }
} catch (error) {
  console.error('[Controller] Error handling MODEL_LOADED:', error);
  this.loadingOverlay.hide();
  this.statusBar.setStatus('Error displaying model', 'error');
}
```

---

#### MODEL_LOAD_ERROR

**Event Class**: `ModelLoadErrorEvent`  
**Payload**: `{ error: Error }`  
**Published By**: `ModelService.loadModel()`  
**When**: Model loading fails (validation, parse error, unsupported format, size limit)  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Hide loading overlay
- Display error message in status bar
- Keep application in stable state

**Error Handling**:

```typescript
try {
  const payload = event.payload as { error: Error };
  this.loadingOverlay.hide();
  const message = payload.error?.message || 'Unknown error';
  this.statusBar.setStatus(`Error: ${message}`, 'error');
} catch (error) {
  console.error('[Controller] Error handling MODEL_LOAD_ERROR:', error);
  this.loadingOverlay.hide();
}
```

**Common Errors**:

- File size exceeds 500MB limit
- Unsupported file format
- Corrupted model file
- Parse/load errors from loader
- No loader available for format

---

#### MODEL_CLEARED

**Event Class**: `ModelClearedEvent`  
**Payload**: None  
**Published By**: `ModelService.clearModel()`  
**When**: Current model is removed from scene  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Clear section tree
- Clear properties panel
- Clear model info from status bar
- Update status: "Model cleared"

**Error Handling**:

```typescript
try {
  this.sectionTree.clear();
  this.propertiesPanel.clear();
  this.statusBar.setModelInfo('');
  this.statusBar.setStatus('Model cleared', 'info');
} catch (error) {
  console.error('[Controller] Error handling MODEL_CLEARED:', error);
}
```

---

#### MODEL_UPDATED

**Event Class**: `ModelUpdatedEvent`  
**Payload**: `{ changes?: string[] }` (optional)  
**Published By**: Any service modifying model state  
**When**: Model properties or structure changes  
**Handled By**: `ApplicationController`

**Purpose**: Notify UI components that model needs to be refreshed

---

### 2. Section Selection Events

#### SECTION_SELECTED

**Event Class**: `SectionSelectedEvent`  
**Payload**: `{ sectionId: string }`  
**Published By**: `ModelService.selectSection()`  
**When**: User clicks on a section in tree or viewport  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Display section properties in properties panel
- Update status bar with section name
- Highlight section in 3D viewport

**Error Handling**:

```typescript
try {
  const section = this.modelService.getSelectedSection();
  if (section) {
    this.propertiesPanel.showSection(section);
    this.statusBar.setStatus(`Selected: ${section.name}`, 'info');
  }
} catch (error) {
  console.error('[Controller] Error handling SECTION_SELECTED:', error);
}
```

---

#### SECTION_DESELECTED

**Event Class**: `SectionDeselectedEvent`  
**Payload**: `{ sectionId: string }`  
**Published By**: `ModelService.deselectSection()`  
**When**: User explicitly deselects a section  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Clear properties panel
- Update status bar
- Remove highlight from viewport

**Error Handling**:

```typescript
try {
  const payload = event.payload as { sectionId: string };
  this.propertiesPanel.clear();
  this.statusBar.setStatus(`Deselected: ${payload.sectionId}`, 'info');
} catch (error) {
  console.error('[Controller] Error handling SECTION_DESELECTED:', error);
}
```

---

#### SELECTION_CLEARED

**Event Class**: `SelectionClearedEvent`  
**Payload**: None  
**Published By**: `ModelService.clearSelection()`  
**When**: All selections are cleared (e.g., user clicks empty space)  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Clear properties panel
- Update status bar
- Remove all highlights from viewport

**Error Handling**:

```typescript
try {
  this.propertiesPanel.clear();
  this.statusBar.setStatus('Selection cleared', 'info');
} catch (error) {
  console.error('[Controller] Error handling SELECTION_CLEARED:', error);
}
```

---

#### SECTION_FOCUSED

**Event Class**: `SectionFocusedEvent`  
**Payload**: `{ sectionId: string }`  
**Published By**: `ModelService.focusOnSection()`  
**When**: User clicks focus button (🎯) on a section  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Camera animates to focus on section
- Update status bar with section ID

**Error Handling**:

```typescript
try {
  const payload = event.payload as { sectionId: string };
  this.statusBar.setStatus(`Focused on section: ${payload.sectionId}`, 'info');
} catch (error) {
  console.error('[Controller] Error handling SECTION_FOCUSED:', error);
}
```

---

### 3. Model Operation Events

#### MODEL_DISASSEMBLED

**Event Class**: `ModelDisassembledEvent`  
**Payload**: None  
**Published By**: `ModelOperationsService.disassemble()`  
**When**: Model sections are exploded outward  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Update status bar: "Model disassembled"
- Update disassemble/reassemble button states

**Error Handling**:

```typescript
try {
  this.statusBar.setStatus('Model disassembled', 'success');
} catch (error) {
  console.error('[Controller] Error handling MODEL_DISASSEMBLED:', error);
}
```

---

#### MODEL_REASSEMBLED

**Event Class**: `ModelReassembledEvent`  
**Payload**: None  
**Published By**: `ModelOperationsService.reassemble()`  
**When**: Model sections return to original positions  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Update status bar: "Model reassembled"
- Update disassemble/reassemble button states

**Error Handling**:

```typescript
try {
  this.statusBar.setStatus('Model reassembled', 'success');
} catch (error) {
  console.error('[Controller] Error handling MODEL_REASSEMBLED:', error);
}
```

---

#### OPERATION_ERROR

**Event Class**: `OperationErrorEvent`  
**Payload**: `{ operation: string; error: Error }`  
**Published By**: `ModelOperationsService` (disassemble, reassemble)  
**When**: An operation fails  
**Handled By**: `ApplicationController`

**Handler Actions**:

- Display error in status bar with operation name
- Log error for debugging
- Keep application stable

**Error Handling**:

```typescript
try {
  const payload = event.payload as { operation: string; error: Error };
  const message = payload.error?.message || 'Unknown error';
  this.statusBar.setStatus(`${payload.operation} failed: ${message}`, 'error');
} catch (error) {
  console.error('[Controller] Error handling OPERATION_ERROR:', error);
}
```

---

## Service Methods & Events Published

### ModelService

| Method                | Events Published            | Error Events        |
| --------------------- | --------------------------- | ------------------- |
| `loadModel(file)`     | MODEL_LOADING, MODEL_LOADED | MODEL_LOAD_ERROR    |
| `selectSection(id)`   | SECTION_SELECTED            | None (logs warning) |
| `deselectSection(id)` | SECTION_DESELECTED          | None (logs warning) |
| `clearSelection()`    | SELECTION_CLEARED           | None (logs error)   |
| `focusOnSection(id)`  | SECTION_FOCUSED             | None (logs error)   |
| `clearModel()`        | MODEL_CLEARED               | None (logs error)   |

### ModelOperationsService

| Method               | Events Published   | Error Events    |
| -------------------- | ------------------ | --------------- |
| `disassemble(model)` | MODEL_DISASSEMBLED | OPERATION_ERROR |
| `reassemble()`       | MODEL_REASSEMBLED  | OPERATION_ERROR |

---

## Event Flow Examples

### Complete Model Load Flow

```
User Action: Select file
    ↓
Controller.handleFileSelected()
    ↓
ModelService.loadModel(file)
    ├─ Validate file (size, format)
    ├─ Publish: MODEL_LOADING
    │     └─> Show loading overlay
    │     └─> Status: "Loading model..."
    ├─ Load file data
    ├─ Parse with appropriate loader
    ├─ Render to viewport
    └─ Publish: MODEL_LOADED
          └─> Hide loading overlay
          └─> Update section tree
          └─> Status: "Model loaded successfully"
          └─> Display model info

IF ERROR:
    └─ Publish: MODEL_LOAD_ERROR
          └─> Hide loading overlay
          └─> Status: "Error: {message}"
          └─> Application ready for retry
```

### Section Selection Flow

```
User Action: Click section in tree
    ↓
SectionTree.handleSelect(sectionId)
    ↓
ModelService.selectSection(sectionId)
    ├─ Validate: model exists, section exists
    ├─ Clear previous selection
    │     └─ model.clearSelection()
    ├─ Set section.isSelected = true
    ├─ Highlight in renderer
    └─ Publish: SECTION_SELECTED
          └─> Show section properties
          └─> Update status bar
          └─> Highlight in viewport
```

### Disassembly Flow

```
User Action: Click Disassemble button
    ↓
Controller.handleDisassemble()
    ↓
ModelOperationsService.disassemble(model)
    ├─ Validate: model exists, not already disassembled
    ├─ Calculate explosion vectors
    ├─ Apply transformations
    ├─ Animate sections
    └─ Publish: MODEL_DISASSEMBLED
          └─> Status: "Model disassembled"
          └─> Update button states

IF ERROR:
    └─ Publish: OPERATION_ERROR
          └─> Status: "disassemble failed: {message}"
          └─> Revert state
```

---

## Error Scenarios & Recovery

### Scenario 1: Invalid File Format

**Trigger**: User uploads `.txt` file  
**Detection**: `ModelService.loadModel()` format validation  
**Event**: `MODEL_LOAD_ERROR`  
**Recovery**:

- Display: "Unsupported file format. Supported formats: .gltf, .glb, .obj, .stl, .step, .stp"
- Application remains ready for new file
- No state corruption

### Scenario 2: File Too Large

**Trigger**: User uploads 800MB model  
**Detection**: `ModelService.loadModel()` size check  
**Event**: `MODEL_LOAD_ERROR`  
**Recovery**:

- Display: "File too large: 800.00MB. Maximum size: 500MB"
- Loading overlay hidden immediately
- Application ready for new file

### Scenario 3: Corrupted Model File

**Trigger**: User uploads malformed GLTF  
**Detection**: Loader parse error  
**Event**: `MODEL_LOAD_ERROR`  
**Recovery**:

- Display: Specific parse error from loader
- Loading overlay hidden
- Previous model (if any) remains loaded
- User can try different file

### Scenario 4: Selection on Non-Existent Section

**Trigger**: Race condition or stale UI reference  
**Detection**: `ModelService.selectSection()` section validation  
**Event**: None (logs warning)  
**Recovery**:

- Log: "Section not found: {id}"
- No UI changes
- No crash or error message
- Application continues normally

### Scenario 5: Disassemble with No Model

**Trigger**: User clicks disassemble before loading model  
**Detection**: `Controller.handleDisassemble()` model check  
**Event**: None (early return)  
**Recovery**:

- Status: "No model loaded"
- Button remains enabled
- No operation attempted

### Scenario 6: Operation Error During Disassembly

**Trigger**: Calculation error or rendering failure  
**Detection**: Try-catch in `ModelOperationsService.disassemble()`  
**Event**: `OPERATION_ERROR`  
**Recovery**:

- Status: "disassemble failed: {error message}"
- State reverted (isDisassembled remains false)
- User can retry
- Other operations remain functional

---

## Best Practices for Adding New Model Events

### 1. Define Event Type and Class

```typescript
// In DomainEvents.ts
export enum EventType {
  MODEL_NEW_OPERATION = 'model:new_operation',
}

export class ModelNewOperationEvent implements DomainEvent {
  readonly type = EventType.MODEL_NEW_OPERATION;
  readonly timestamp = new Date();

  constructor(
    public readonly payload: {
      /* your data */
    }
  ) {}
}
```

### 2. Publish Event from Service

```typescript
// In appropriate service
try {
  // Validate inputs
  if (!model) {
    const error = new Error('No model provided');
    this.eventBus.publish(
      new OperationErrorEvent({
        operation: 'newOperation',
        error,
      })
    );
    throw error;
  }

  // Perform operation
  // ...

  // Publish success event
  this.eventBus.publish(
    new ModelNewOperationEvent({
      /* data */
    })
  );
} catch (error) {
  console.error('[Service] Error:', error);
  const errorObj = error instanceof Error ? error : new Error(String(error));
  this.eventBus.publish(
    new OperationErrorEvent({
      operation: 'newOperation',
      error: errorObj,
    })
  );
  throw error;
}
```

### 3. Subscribe in Controller

```typescript
// In ApplicationController.setupDomainEventHandlers()
this.eventBus.subscribe(EventType.MODEL_NEW_OPERATION, (event) => {
  try {
    const payload = event.payload as {
      /* your type */
    };
    // Handle event
    this.statusBar.setStatus('Operation successful', 'success');
  } catch (error) {
    console.error('[Controller] Error handling MODEL_NEW_OPERATION:', error);
    // Graceful degradation
  }
});
```

### 4. Always Include Error Handling

- Validate all inputs before operations
- Wrap operations in try-catch
- Publish error events for failures
- Log errors with context
- Provide user-friendly error messages
- Ensure application remains stable

---

## Testing Checklist

### Model Loading

- [ ] Load valid GLTF model → Success
- [ ] Load valid OBJ model → Success
- [ ] Load valid STL model → Success
- [ ] Load .txt file → Error: Unsupported format
- [ ] Load 600MB file → Error: File too large
- [ ] Load corrupted GLTF → Error with parse details
- [ ] Load model while another loading → Second load cancels first
- [ ] Verify MODEL_LOADING event published
- [ ] Verify MODEL_LOADED event published on success
- [ ] Verify MODEL_LOAD_ERROR event published on failure
- [ ] Verify loading overlay shown/hidden correctly
- [ ] Verify status bar updated correctly

### Section Selection

- [ ] Select section in tree → Properties displayed
- [ ] Select section in viewport → Tree item highlighted
- [ ] Select different section → Previous deselected
- [ ] Select non-existent section → Warning logged, no crash
- [ ] Deselect section → Properties cleared
- [ ] Clear all selections → UI reset
- [ ] Verify SECTION_SELECTED event published
- [ ] Verify SECTION_DESELECTED event published
- [ ] Verify SELECTION_CLEARED event published
- [ ] Verify properties panel updates correctly
- [ ] Verify status bar shows selection info

### Section Focus

- [ ] Click focus button → Camera moves to section
- [ ] Focus on very small section → Appropriate zoom
- [ ] Focus on very large section → Appropriate zoom
- [ ] Focus on non-existent section → Warning logged
- [ ] Verify SECTION_FOCUSED event published
- [ ] Verify status bar updated

### Model Operations

- [ ] Disassemble model → Sections explode
- [ ] Disassemble already disassembled → Warning shown
- [ ] Disassemble with no model → Status: "No model loaded"
- [ ] Reassemble model → Sections return to origin
- [ ] Reassemble non-disassembled → Warning shown
- [ ] Verify MODEL_DISASSEMBLED event published
- [ ] Verify MODEL_REASSEMBLED event published
- [ ] Verify OPERATION_ERROR published on failure
- [ ] Verify button states update correctly

### Model Clearing

- [ ] Clear loaded model → Scene emptied
- [ ] Clear when no model → No error
- [ ] Verify MODEL_CLEARED event published
- [ ] Verify UI fully reset (tree, properties, info)

### Error Recovery

- [ ] After load error, can load new model successfully
- [ ] After operation error, other operations still work
- [ ] No memory leaks from failed operations
- [ ] Event handlers don't break after errors
- [ ] Application never enters invalid state

---

## Performance Considerations

### Event Publishing Overhead

- **Cost**: Negligible (< 1ms per event)
- **Queue**: O(1) push/pop operations
- **Handler Execution**: Sequential, isolated

### Memory Management

- Events garbage collected after handlers complete
- Event history limited to 100 most recent
- No memory leaks from subscriptions (cleanup on unsubscribe)

### Large Models

- Load validation happens before heavy processing
- Early rejection saves resources (size check, format check)
- Streaming possible for future enhancement

---

## Future Enhancements

### Potential New Events

1. **MODEL_SECTION_ADDED** - Dynamic geometry addition
2. **MODEL_SECTION_REMOVED** - Section deletion
3. **MODEL_SECTION_MODIFIED** - Property changes
4. **MODEL_TRANSFORM_START** - Animation begin
5. **MODEL_TRANSFORM_END** - Animation complete
6. **MODEL_VISIBILITY_CHANGED** - Show/hide sections
7. **MODEL_PROGRESS** - Loading progress updates
8. **MODEL_CACHED** - Model stored for quick reload

### Advanced Features

1. **Undo/Redo** - Event history for reversible operations
2. **Batch Operations** - Multiple sections at once
3. **Custom Annotations** - User markup on sections
4. **Measurement Tools** - Distance, angle measurements
5. **Section Comparison** - Diff between models

---

## Summary

✅ **All Model Events Observed**: Every model operation publishes appropriate events  
✅ **Graceful Error Handling**: All operations wrapped with validation and try-catch  
✅ **Isolated Error Propagation**: Handler failures don't cascade  
✅ **User-Friendly Feedback**: Clear status messages for all operations  
✅ **Stable Application State**: Errors never corrupt application state  
✅ **Comprehensive Logging**: All errors logged with context  
✅ **Production Ready**: Robust event system for reliable operation

The model event system provides complete observability and predictable behavior for all model-related operations, ensuring a professional and stable user experience.
