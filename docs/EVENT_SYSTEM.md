# Event System Documentation

## Overview

The 3D Geometric Search application uses a centralized, enterprise-grade event system built on the `EventDispatcher` class. This system ensures stable, predictable, and graceful handling of all application events with comprehensive validation, error handling, and race condition prevention.

## Architecture

### Core Components

1. **EventDispatcher** (`src/events/EventDispatcher.js`)

   - Centralized event bus for all application events
   - Singleton pattern for consistent event handling
   - Priority queue system (high/normal/low)
   - Debouncing and throttling capabilities
   - Automatic retry with exponential backoff
   - Custom error handler registration

2. **State Actions** (`src/state/actions.js`)

   - Action creators for state transitions
   - Input validation before state updates
   - Integration with EventDispatcher options
   - Boolean success/failure return values
   - Context-aware error dispatching

3. **StateManager** (`src/state/StateManager.js`)
   - Immutable state management
   - Listener notification system
   - State validation and integrity checks

## Event Dispatch Options

The `dispatch()` method accepts an options object with the following properties:

```javascript
dispatch(eventType, payload, {
  priority: "high" | "normal" | "low", // Default: 'normal'
  debounce: number, // Delay in ms (0-3000)
  throttle: number, // Minimum time between events in ms
  retry: boolean, // Enable auto-retry (max 3 attempts)
  silent: boolean, // Suppress console output
});
```

### Priority Levels

- **high**: Processed immediately, bypasses normal queue

  - Use for: Focus events, visibility changes, critical UI updates
  - Example: `focusNode()`, `isolateNode()`, `showAll()`

- **normal**: Standard processing order (default)

  - Use for: Most application events
  - Example: Model loading, selection changes

- **low**: Processed after higher priority events
  - Use for: Analytics, logging, non-critical updates

### Debouncing

Delays event execution and cancels previous pending events of the same type.

**Use cases:**

- Preventing rapid model reloads (100ms)
- Smoothing user input (50-100ms)
- Reducing API calls

**Example:**

```javascript
// Only executes once after user stops typing for 100ms
dispatch(EventType.MODEL_LOAD, { model }, { debounce: 100 });
```

### Throttling

Ensures minimum time between consecutive event executions.

**Use cases:**

- Limiting selection updates (50ms)
- Controlling highlight frequency (100ms)
- Preventing event flooding

**Example:**

```javascript
// Executes at most once every 50ms
dispatch(EventType.NODE_SELECT, { nodeId }, { throttle: 50 });
```

### Retry Logic

Automatically retries failed events with exponential backoff.

**Configuration:**

- Max attempts: 3
- Backoff formula: `100ms * 2^retryCount`
- Max delay: 3000ms

**Use cases:**

- Browser API calls (fullscreen)
- Network requests
- Transient failures

**Example:**

```javascript
// Retries up to 3 times if fullscreen API fails
dispatch(EventType.FULLSCREEN_ENTER, {}, { retry: true });
```

### Silent Mode

Suppresses console output and error notifications.

**Use cases:**

- Cleanup operations
- Internal state updates
- Background processing

**Example:**

```javascript
// No console output for cleanup
dispatch(EventType.SELECTION_CLEAR, {}, { silent: true });
```

## Race Condition Prevention

### Mechanisms

1. **isDispatching Flag**

   - Prevents recursive event dispatch
   - Queues events during dispatch
   - Processes queue after completion

2. **Priority Queue System**

   - Separates high-priority from normal events
   - Prevents queue starvation
   - Maintains event order within priorities

3. **Batch Processing**

   - Processes max 10 events per batch
   - Uses `setTimeout(0)` for async scheduling
   - Prevents UI blocking

4. **Debounce/Throttle**
   - Prevents rapid-fire events
   - Reduces event flooding
   - Smooths user interactions

### Example Scenario

```javascript
// User rapidly clicks nodes
nodes.forEach((node) => {
  selectNodes([node.id]); // Uses throttle: 50ms
});

// Result: Events are throttled to max 1 per 50ms
// No race conditions or UI blocking
```

## State Action Patterns

All state actions follow consistent patterns:

### Input Validation

```javascript
export function selectNodes(nodeIds) {
  try {
    // Validate input type
    if (!Array.isArray(nodeIds)) {
      console.warn("selectNodes: nodeIds must be an array");
      return false;
    }

    // Filter valid values
    const validNodeIds = nodeIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0
    );

    if (validNodeIds.length === 0) {
      clearSelection();
      return true;
    }

    // Proceed with valid data...
  } catch (error) {
    console.error("Error in selectNodes action:", error);
    return false;
  }
}
```

### Error Handling

```javascript
export function loadModel(model) {
  try {
    // Validation
    if (!model || typeof model !== "object") {
      dispatch(EventType.ERROR, {
        error: new Error("Invalid model object"),
        context: "loadModel",
      });
      return false;
    }

    // Action execution
    stateManager.setModel(model);
    dispatch(EventType.MODEL_LOAD, { model }, { debounce: 100 });
    return true;
  } catch (error) {
    console.error("Error in loadModel action:", error);
    dispatch(EventType.ERROR, { error, context: "loadModel" });
    return false;
  }
}
```

### Return Values

All actions return `boolean` to indicate success/failure:

```javascript
const success = selectNodes(["node1", "node2"]);
if (!success) {
  // Handle failure
  console.error("Failed to select nodes");
}
```

## Event Types and Dispatch Options

| Event Type       | Priority | Debounce | Throttle | Retry | Use Case           |
| ---------------- | -------- | -------- | -------- | ----- | ------------------ |
| MODEL_LOAD       | normal   | 100ms    | -        | -     | Model loading      |
| NODE_SELECT      | normal   | -        | 50ms     | -     | Node selection     |
| FOCUS_NODE       | high     | 50ms     | -        | -     | Node focus         |
| NODE_HIGHLIGHT   | normal   | -        | 100ms    | -     | Highlighting       |
| NODE_UNHIGHLIGHT | normal   | -        | -        | -     | Unhighlighting     |
| SELECTION_CLEAR  | normal   | -        | -        | -     | Clear selection    |
| FOCUS_CLEAR      | normal   | -        | -        | -     | Clear focus        |
| NODE_ISOLATE     | high     | -        | -        | -     | Isolate node       |
| SHOW_ALL         | high     | -        | -        | -     | Show all nodes     |
| DISASSEMBLE      | normal   | 200ms    | -        | -     | Disassemble model  |
| REASSEMBLE       | normal   | 200ms    | -        | -     | Reassemble model   |
| CAMERA_RESET     | normal   | 100ms    | -        | -     | Reset camera       |
| FULLSCREEN_ENTER | normal   | -        | -        | true  | Enter fullscreen   |
| FULLSCREEN_EXIT  | normal   | -        | -        | true  | Exit fullscreen    |
| ERROR            | high     | -        | -        | -     | Error notification |

## Custom Error Handlers

Register custom error handlers for application-specific processing:

```javascript
import { eventDispatcher } from "./events/EventDispatcher.js";

// Register error handler
eventDispatcher.onError((error, event) => {
  // Log to analytics
  analytics.trackError(error, {
    eventType: event.type,
    timestamp: event.timestamp,
  });

  // Show user notification
  if (!error.silent) {
    notificationService.showError(error.message);
  }
});
```

## Best Practices

### 1. Always Validate Inputs

```javascript
// ❌ Bad: No validation
export function selectNodes(nodeIds) {
  stateManager.setSelection(nodeIds);
}

// ✅ Good: Validate and filter
export function selectNodes(nodeIds) {
  if (!Array.isArray(nodeIds)) return false;
  const valid = nodeIds.filter((id) => typeof id === "string");
  stateManager.setSelection(valid);
  return true;
}
```

### 2. Use Appropriate Options

```javascript
// ❌ Bad: No debounce for rapid events
dispatch(EventType.MODEL_LOAD, { model });

// ✅ Good: Debounce to prevent rapid reloads
dispatch(EventType.MODEL_LOAD, { model }, { debounce: 100 });
```

### 3. Handle Errors Gracefully

```javascript
// ❌ Bad: Let errors propagate
export function focusNode(nodeId) {
  stateManager.setFocus(nodeId);
  dispatch(EventType.FOCUS_NODE, { nodeId });
}

// ✅ Good: Catch and report errors
export function focusNode(nodeId) {
  try {
    if (!nodeId) return false;
    stateManager.setFocus(nodeId);
    dispatch(EventType.FOCUS_NODE, { nodeId }, { priority: "high" });
    return true;
  } catch (error) {
    console.error("Error in focusNode:", error);
    dispatch(EventType.ERROR, { error, context: "focusNode" });
    return false;
  }
}
```

### 4. Use Silent Mode for Cleanup

```javascript
// Clear operations that shouldn't trigger notifications
dispatch(EventType.SELECTION_CLEAR, {}, { silent: true });
dispatch(EventType.NODE_UNHIGHLIGHT, { nodeId }, { silent: true });
```

### 5. Prioritize Critical Events

```javascript
// High priority for immediate user feedback
dispatch(EventType.FOCUS_NODE, { nodeId }, { priority: "high" });
dispatch(EventType.NODE_ISOLATE, { nodeId }, { priority: "high" });
dispatch(EventType.ERROR, { error }, { priority: "high" });
```

## Performance Considerations

### Event Batching

The event system processes events in batches of 10 to prevent UI blocking:

```javascript
// Processes 100 highlight events in batches
for (let i = 0; i < 100; i++) {
  dispatch(EventType.NODE_HIGHLIGHT, { nodeId: `node${i}` });
}
// Result: 10 batches of 10 events each, UI remains responsive
```

### Memory Management

Always call `destroy()` when cleaning up:

```javascript
// Cleanup when disposing application
eventDispatcher.destroy();
```

This clears:

- All event listeners
- Pending debounce timers
- Throttle state
- Retry counters
- Error handlers

### Event History

By default, the last 100 events are kept in history for debugging:

```javascript
// Get recent events
const history = eventDispatcher.getEventHistory();
console.log("Recent events:", history);
```

## Testing

### Unit Testing Events

```javascript
import { eventDispatcher } from "./events/EventDispatcher.js";
import { selectNodes } from "./state/actions.js";

describe("selectNodes", () => {
  it("should validate input", () => {
    const result = selectNodes("not-an-array");
    expect(result).toBe(false);
  });

  it("should dispatch with throttle", (done) => {
    let callCount = 0;

    eventDispatcher.on("NODE_SELECT", () => {
      callCount++;
    });

    // Rapid calls
    for (let i = 0; i < 10; i++) {
      selectNodes([`node${i}`]);
    }

    // Check throttling worked
    setTimeout(() => {
      expect(callCount).toBeLessThan(10);
      done();
    }, 1000);
  });
});
```

### Integration Testing

```javascript
describe("Event System Integration", () => {
  it("should prevent race conditions", (done) => {
    const order = [];

    eventDispatcher.on("HIGH_PRIORITY", () => order.push("high"));
    eventDispatcher.on("NORMAL_PRIORITY", () => order.push("normal"));

    dispatch("NORMAL_PRIORITY", {});
    dispatch("HIGH_PRIORITY", {}, { priority: "high" });

    setTimeout(() => {
      expect(order).toEqual(["high", "normal"]);
      done();
    }, 100);
  });
});
```

## Troubleshooting

### Events Not Firing

**Symptoms:** Event listeners not called

**Solutions:**

1. Check if event type is correct
2. Verify listener is registered before dispatch
3. Check if event was debounced/throttled
4. Inspect event history: `eventDispatcher.getEventHistory()`

### Race Conditions

**Symptoms:** Inconsistent state, events out of order

**Solutions:**

1. Use priority for critical events
2. Add debouncing to rapid events
3. Check for recursive dispatch (use queue instead)
4. Verify isDispatching flag is working

### Memory Leaks

**Symptoms:** Memory usage grows over time

**Solutions:**

1. Call `off()` to remove listeners
2. Use `once()` for one-time listeners
3. Call `destroy()` on cleanup
4. Clear debounce timers manually if needed

### Performance Issues

**Symptoms:** UI lag, slow response

**Solutions:**

1. Add throttling to high-frequency events
2. Reduce batch size if needed
3. Use silent mode for internal events
4. Check event history size (max 100)

## Migration Guide

### From Direct Dispatch

```javascript
// Before
eventDispatcher.dispatch("NODE_SELECT", { nodeId });

// After
dispatch(EventType.NODE_SELECT, { nodeId }, { throttle: 50 });
```

### From Unvalidated Actions

```javascript
// Before
export function selectNodes(nodeIds) {
  stateManager.setSelection(nodeIds);
  dispatch(EventType.NODE_SELECT, { nodeIds });
}

// After
export function selectNodes(nodeIds) {
  try {
    if (!Array.isArray(nodeIds)) return false;
    const valid = nodeIds.filter((id) => typeof id === "string");
    stateManager.setSelection(valid);
    dispatch(EventType.NODE_SELECT, { nodeIds: valid }, { throttle: 50 });
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
```

## Future Enhancements

Planned improvements:

1. **Event Replay**: Record and replay event sequences for debugging
2. **Event Analytics**: Track event frequency and patterns
3. **Dynamic Throttling**: Adjust throttle based on system load
4. **Event Middleware**: Allow transformation/filtering before dispatch
5. **Event Transactions**: Batch multiple events as atomic operations

## Related Documentation

- [Highlight Effects](./HIGHLIGHT_EFFECTS.md)
- [Highlight Implementation](./HIGHLIGHT_IMPLEMENTATION.md)
- [Architecture Overview](./ARCHITECTURE.md)

## Version History

- **v1.0.0** (Current): Initial release with priority queues, debouncing, throttling, retry logic
