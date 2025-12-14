# Event Handling Architecture

## Overview

This document describes the comprehensive event handling system implemented in the 3D Geometric Search application. The system ensures robust, predictable event processing with proper validation, error handling, and fallback behavior throughout the application stack.

## Architecture Layers

### 1. Domain Layer - Event Definitions

**File**: `src/domain/events/DomainEvents.ts`

#### Event Types

```typescript
enum EventType {
  // Model Events
  MODEL_LOADING,
  MODEL_LOADED,
  MODEL_LOAD_ERROR,
  MODEL_CLEARED,

  // Section Events
  SECTION_SELECTED,
  SECTION_FOCUSED,
  SELECTION_CLEARED,

  // Operation Events
  MODEL_DISASSEMBLED,
  MODEL_REASSEMBLED,
  OPERATION_ERROR,

  // View Events
  VIEW_RESET,
  DISPLAY_OPTION_CHANGED,
  VIEW_FULLSCREEN,
  VIEW_FULLSCREEN_ERROR,

  // Application Events
  APP_INITIALIZED,
  APP_ERROR,
}
```

#### Event Classes

Each event type has a corresponding event class with typed payload:

- **ModelLoadingEvent**: `{ filename: string }`
- **ModelLoadedEvent**: `{ filename: string; sectionCount: number; format: string }`
- **ModelLoadErrorEvent**: `{ error: Error }`
- **ModelClearedEvent**: No payload
- **SectionSelectedEvent**: `{ sectionId: string }`
- **SectionFocusedEvent**: `{ sectionId: string }`
- **SelectionClearedEvent**: No payload
- **ModelDisassembledEvent**: `{ explosionFactor: number }`
- **ModelReassembledEvent**: No payload
- **OperationErrorEvent**: `{ error: Error; operation: string }`
- **ViewResetEvent**: No payload
- **DisplayOptionChangedEvent**: `{ option: string; value: boolean }`
- **ViewFullscreenEvent**: `{ enabled: boolean }`
- **ViewFullscreenErrorEvent**: `{ error: Error }`
- **AppInitializedEvent**: No payload
- **AppErrorEvent**: `{ error: Error; context: string }`

### 2. Application Layer - Event Bus Service

**File**: `src/application/services/EventBusService.ts`

#### Core Features

##### Event Queueing & Recursion Prevention

```typescript
private eventQueue: DomainEvent[] = [];
private isProcessing = false;
```

Prevents recursive event cycles by queueing events that occur during event processing.

##### Error Isolation

```typescript
private processEvent(event: DomainEvent): void {
  handlers.forEach((handler) => {
    try {
      handler(event);
    } catch (error) {
      // Error in one handler doesn't break others
      console.error('[EventBus] Handler error:', error);
    }
  });
}
```

Each event handler is wrapped in try-catch, ensuring one handler's failure doesn't affect others.

##### Input Validation

```typescript
publish(event: DomainEvent): void {
  // Validate event before processing
  if (!event || !event.type) {
    console.error('[EventBus] Invalid event');
    return;
  }
  // ...
}
```

##### Diagnostics API

```typescript
getDiagnostics(): {
  handlerCount: number;
  eventTypes: string[];
  historySize: number;
  isProcessing: boolean;
  queueSize: number;
}
```

Provides real-time visibility into event system state for debugging.

### 3. Application Layer - Service Error Handling

#### ModelService

**File**: `src/application/services/ModelService.ts`

All methods include:

- **Input Validation**: Null checks, type validation
- **Business Logic Validation**: File size limits, format support checks
- **Try-Catch Wrappers**: All operations wrapped for error capture
- **Error Event Publishing**: Failures publish ModelLoadErrorEvent
- **Detailed Logging**: Console errors with context

Example:

```typescript
async loadModel(file: File): Promise<void> {
  // Input validation
  if (!file) {
    const error = new Error('No file provided');
    this.eventBus.publish(new ModelLoadErrorEvent({ error }));
    throw error;
  }

  // Size validation
  if (file.size > maxSize) {
    const error = new Error(`File too large: ...`);
    this.eventBus.publish(new ModelLoadErrorEvent({ error }));
    throw error;
  }

  try {
    // Main logic
  } catch (error) {
    // Error handling
    this.eventBus.publish(new ModelLoadErrorEvent({ error }));
    throw error;
  }
}
```

#### ViewService

**File**: `src/application/services/ViewService.ts`

All methods wrapped with:

- **Element Validation**: Check DOM elements exist
- **API Support Checks**: Verify browser capabilities (e.g., fullscreen API)
- **Try-Catch Protection**: Safe execution of all view operations
- **Error Event Publishing**: ViewFullscreenErrorEvent for specific failures
- **Graceful Degradation**: Continue operation even if optional features fail

### 4. Presentation Layer - Controller

**File**: `src/presentation/controllers/ApplicationController.ts`

#### Event Handler Error Isolation

Every domain event handler includes try-catch:

```typescript
this.eventBus.subscribe(EventType.MODEL_LOADED, (event) => {
  try {
    // Handle event
  } catch (error) {
    console.error('[Controller] Error handling MODEL_LOADED:', error);
    // Graceful degradation
  }
});
```

#### User Interaction Error Handling

```typescript
private async handleFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    console.warn('[Controller] No file selected');
    return;
  }

  try {
    await this.modelService.loadModel(file);
  } catch (error) {
    console.error('[Controller] File load error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    this.statusBar.setStatus(`Failed to load model: ${errorMsg}`, 'error');
    this.loadingOverlay.hide();
  } finally {
    input.value = ''; // Always reset
  }
}
```

### 5. Presentation Layer - UI Components

All components include comprehensive error handling:

#### SectionTreeComponent

**File**: `src/presentation/components/SectionTreeComponent.ts`

- **Null Checks**: Validate model before rendering
- **Per-Node Error Handling**: Node creation failures don't break tree
- **Safe DOM Manipulation**: Try-catch on all DOM operations
- **Handler Validation**: Type check callback functions

#### PropertiesPanelComponent

**File**: `src/presentation/components/PropertiesPanelComponent.ts`

- **Section Validation**: Check section exists before display
- **Safe Property Access**: Null-safe navigation through section properties
- **Fallback Values**: Display "Unknown" or "N/A" for missing data
- **Nested Error Handling**: Try-catch per metadata property

#### StatusBarComponent

**File**: `src/presentation/components/StatusBarComponent.ts`

- **Element Availability**: Check DOM elements exist before update
- **Safe Text Updates**: Handle undefined/null messages
- **Error Recovery**: Log errors, continue operation

#### LoadingOverlayComponent

**File**: `src/presentation/components/LoadingOverlayComponent.ts`

- **Element Validation**: Verify overlay exists before show/hide
- **Safe Message Updates**: Handle missing text elements gracefully
- **Consistent State**: Always attempt to show/hide even if errors occur

## Error Propagation Flow

### Example: Model Load Failure

1. **User Action**: User selects invalid file
2. **Controller**: `handleFileSelected()` receives event
3. **Service**: `modelService.loadModel(file)` validates and rejects
4. **Service**: Publishes `ModelLoadErrorEvent`
5. **Controller**: Catches exception in try-catch
6. **Controller**: Updates status bar with error message
7. **Controller**: Ensures loading overlay is hidden
8. **Controller**: Event handler receives `ModelLoadErrorEvent`
9. **Controller**: Displays user-friendly error
10. **Application**: Remains stable, ready for next interaction

### Example: Event Handler Error

1. **Event**: `MODEL_LOADED` published
2. **EventBus**: Iterates through all handlers
3. **Handler 1**: Executes successfully
4. **Handler 2**: Throws exception
5. **EventBus**: Catches error, logs with stack trace
6. **EventBus**: Continues to Handler 3
7. **Handler 3**: Executes successfully
8. **Result**: 2 of 3 handlers succeeded, application stable

## Best Practices

### 1. Input Validation

Always validate inputs at service boundaries:

```typescript
if (!file) {
  const error = new Error('No file provided');
  this.eventBus.publish(new ModelLoadErrorEvent({ error }));
  throw error;
}
```

### 2. Try-Catch Placement

Wrap all operations that can fail:

```typescript
async loadModel(file: File): Promise<void> {
  try {
    // Main logic
  } catch (error) {
    // Error handling
    console.error('[Service] Error:', error);
    this.eventBus.publish(new ModelLoadErrorEvent({ error }));
    throw error;
  }
}
```

### 3. Error Event Publishing

Publish error events for important failures:

```typescript
catch (error) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  this.eventBus.publish(new ModelLoadErrorEvent({ error: errorObj }));
}
```

### 4. Graceful Degradation

Continue operation when non-critical errors occur:

```typescript
setTimeout(() => {
  try {
    this.renderer.resize();
  } catch (error) {
    console.error('[ViewService] Error resizing:', error);
    // Application continues despite resize failure
  }
}, 100);
```

### 5. Detailed Logging

Include context in all error logs:

```typescript
console.error('[ComponentName] Operation description:', error);
```

### 6. Consistent Error Format

Always convert to Error objects:

```typescript
const errorObj = error instanceof Error ? error : new Error(String(error));
```

### 7. Cleanup in Finally

Use finally blocks for cleanup:

```typescript
try {
  await this.modelService.loadModel(file);
} catch (error) {
  // Handle error
} finally {
  input.value = ''; // Always reset
}
```

## Testing Error Scenarios

### Manual Testing Checklist

1. **Invalid File Formats**
   - Upload .txt file → Should show error message
   - Upload .zip file → Should show unsupported format error

2. **Large Files**
   - Upload file > 500MB → Should show size limit error

3. **Corrupt Model Files**
   - Upload malformed GLTF → Should handle parse error gracefully

4. **Missing DOM Elements**
   - Remove element from HTML → Should log error, not crash

5. **Network Issues**
   - Test with throttled network → Should handle timeouts

6. **Browser Compatibility**
   - Test fullscreen on unsupported browser → Should show API error

7. **Rapid User Actions**
   - Rapidly click multiple sections → No race conditions
   - Load new model while previous loading → Should cancel cleanly

8. **Memory Limits**
   - Load extremely complex model → Should handle OOM gracefully

## Event Flow Diagrams

### Model Loading Success Flow

```
User → FileInput → Controller.handleFileSelected()
                       ↓
                   ModelService.loadModel()
                       ↓
                   Publish: MODEL_LOADING
                       ↓
                   Controller → LoadingOverlay.show()
                       ↓
                   ModelLoader.load()
                       ↓
                   Renderer.loadModel()
                       ↓
                   Publish: MODEL_LOADED
                       ↓
                   Controller → LoadingOverlay.hide()
                   Controller → SectionTree.setModel()
                   Controller → StatusBar.setStatus('success')
```

### Model Loading Error Flow

```
User → FileInput → Controller.handleFileSelected()
                       ↓
                   ModelService.loadModel()
                       ↓
                   Validation Error
                       ↓
                   Publish: MODEL_LOAD_ERROR
                       ↓
                   Controller Catch Block
                       ↓
                   LoadingOverlay.hide()
                   StatusBar.setStatus('error')
                       ↓
                   Application Ready for Next Action
```

## Performance Considerations

### Event Queue Performance

- Events processed serially during recursion
- Minimal overhead: O(1) queue operations
- No significant latency for typical event rates

### Error Handling Overhead

- Try-catch has negligible performance impact in modern JavaScript engines
- Error objects only created when actual errors occur
- Logging to console is asynchronous, non-blocking

### Memory Management

- Event history has size limit (100 events)
- Old events automatically discarded
- Event handlers cleaned up on unsubscribe

## Future Enhancements

### Potential Improvements

1. **Error Recovery Strategies**
   - Automatic retry for transient failures
   - Model cache for quick reload
   - Partial model loading for large files

2. **Enhanced Diagnostics**
   - Performance metrics per event type
   - Handler execution time tracking
   - Event frequency analysis

3. **User Feedback**
   - Toast notifications for errors
   - Progress indicators for long operations
   - Undo/redo for operations

4. **Testing Infrastructure**
   - Unit tests for all error paths
   - Integration tests for event flows
   - Chaos engineering for robustness testing

## Conclusion

This event handling architecture provides a robust foundation for the 3D Geometric Search application. By implementing comprehensive error handling, validation, and graceful degradation throughout all layers, the application ensures a stable and predictable user experience even in error scenarios.

Key achievements:

- ✅ All events properly validated
- ✅ Error isolation prevents cascading failures
- ✅ Graceful degradation maintains application stability
- ✅ Comprehensive logging aids debugging
- ✅ User-friendly error messages
- ✅ No race conditions or recursive event cycles
- ✅ Production-ready error recovery
