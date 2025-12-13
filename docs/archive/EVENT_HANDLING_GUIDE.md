# Event Handling Guide

## Overview

The 3D Geometric Search application now features a comprehensive, production-grade event handling system that ensures consistency, efficiency, and resilience across the entire codebase. This guide documents the architecture, patterns, and best practices for event handling in the application.

## Architecture

### Core Components

#### 1. EventBus (`js/eventBus.js`)

A centralized pub/sub system for application-wide events with advanced features:

- **Event Management**: `on()`, `once()`, `off()`, `emit()`, `emitAsync()`
- **Namespacing**: Support for event namespaces (e.g., `'app:loaded'`)
- **Wildcard Patterns**: Listen to multiple events with patterns (e.g., `'model:*'`)
- **Throttling/Debouncing**: Built-in performance optimizations
- **Event History**: Optional event replay and history tracking (max 100 events)
- **Error Handling**: Comprehensive error catching and logging

```javascript
import { globalEventBus } from "./eventBus.js";

// Basic usage
globalEventBus.on("model:loaded", (data) => {
  console.log("Model loaded:", data);
});

// With options
globalEventBus.on("viewport:scroll", handler, {
  throttle: 100,
  context: this,
});
```

#### 2. EventHandlerManager (`js/eventBus.js`)

Manages DOM event listeners with automatic cleanup tracking:

- **Automatic Tracking**: All event listeners are tracked in a Map structure
- **AbortController**: Uses modern AbortController for proper cleanup
- **Element-Event Mapping**: Organized by element ID and event type
- **Batch Cleanup**: Remove all listeners for an element, event, or the entire manager

```javascript
import { EventHandlerManager } from "./eventBus.js";

const eventManager = new EventHandlerManager();

// Add event listener (automatically tracked)
eventManager.add(button, "click", handleClick);

// Remove specific listener
eventManager.remove(button, "click", handleClick);

// Remove all listeners for an element
eventManager.removeAll(button);

// Remove all tracked listeners
eventManager.clear();
```

## Implementation Patterns

### App-Level Event Handling (`js/app.js`)

The main App class uses EventHandlerManager to track all DOM event listeners:

```javascript
class App {
  constructor() {
    this.eventManager = new EventHandlerManager();
    // ... other initialization
  }

  setupEventListeners() {
    // Organized into logical groups
    this._setupUploadHandlers();
    this._setupViewerControlHandlers();
    this._setupKeyboardHandlers();
    this._setupModelEventHandlers();
    this._setupAdvancedControlHandlers();
    this._setupLibraryHandlers();
  }

  cleanup() {
    // Clean up all event listeners when app is destroyed
    this.eventManager.clear();
    this.sectionManager.cleanup();
    if (this.viewer) {
      this.viewer.cleanup();
    }
  }
}
```

### Viewer Event Handling (`js/viewer.js`)

The Viewer3D class implements throttled event handlers for high-frequency events:

```javascript
export class Viewer3D {
  constructor(containerId) {
    this.eventManager = new EventHandlerManager();
    // ... other initialization
    this._setupEventListeners();
  }

  _setupEventListeners() {
    // Throttled window resize (250ms)
    let resizeTimer = null;
    this.eventManager.add(window, "resize", () => {
      if (!resizeTimer) {
        resizeTimer = setTimeout(() => {
          this.onWindowResize();
          resizeTimer = null;
        }, 250);
      }
    });

    // Throttled mousemove (50ms for 20fps)
    let mouseMoveTimer = null;
    this.eventManager.add(this.renderer.domElement, "mousemove", (event) => {
      if (!mouseMoveTimer) {
        mouseMoveTimer = setTimeout(() => {
          this.onModelHover(event);
          mouseMoveTimer = null;
        }, 50);
      }
    });
  }

  cleanup() {
    this.eventManager.clear();
  }

  dispose() {
    this.cleanup();
    // ... other disposal logic
  }
}
```

### Section Manager Event Handling (`js/sectionManager.js`)

The SectionManager uses EventHandlerManager for lazy-loaded section triggers:

```javascript
class SectionManager {
  constructor() {
    this.eventManager = new EventHandlerManager();
    this.cleanupFunctions = new Map();
    // ... other initialization
  }

  _setupTrigger(section, sectionId) {
    const trigger = document.getElementById(section.trigger);
    if (trigger) {
      const handler = () => {
        try {
          this.toggleSection(sectionId);
        } catch (error) {
          console.error(`[SectionManager] Error toggling ${sectionId}:`, error);
        }
      };

      this.eventManager.add(trigger, "click", handler);
    }
  }

  cleanup() {
    this.eventManager.clear();
    this.cleanupFunctions.forEach((cleanup, sectionId) => {
      cleanup();
    });
    this.cleanupFunctions.clear();
  }
}
```

## Performance Optimizations

### Throttling

Used for high-frequency events that don't require immediate response:

| Event Type      | Throttle Delay | Rationale                                                |
| --------------- | -------------- | -------------------------------------------------------- |
| Window resize   | 250ms (4fps)   | Prevents excessive reflow calculations                   |
| Controls change | 100ms (10fps)  | Balance between UI responsiveness and performance        |
| Mousemove       | 50ms (20fps)   | Smooth enough for hover effects without overwhelming CPU |

**Implementation Pattern:**

```javascript
let throttleTimer = null;
element.addEventListener("event", () => {
  if (!throttleTimer) {
    throttleTimer = setTimeout(() => {
      // Handle event
      throttleTimer = null;
    }, delay);
  }
});
```

### Debouncing

Used for events where only the final value matters:

| Control Type  | Debounce Delay | Rationale                                        |
| ------------- | -------------- | ------------------------------------------------ |
| Sliders       | 50ms           | Real-time visual feedback with minimal lag       |
| Color pickers | 100ms          | Balance between responsiveness and color updates |
| Text inputs   | 500ms          | Wait for user to finish typing                   |

**Implementation Pattern:**

```javascript
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

element.addEventListener(
  "input",
  debounce((e) => {
    // Handle input
  }, delay)
);
```

## Error Handling

All event handlers include comprehensive error handling:

### Standard Error Handler Pattern

```javascript
eventManager.add(element, "click", () => {
  try {
    // Event handler logic
    performAction();
    showToast("Action completed", "success");
  } catch (error) {
    console.error("[Component] Error in event handler:", error);
    showToast("Error performing action", "error");
  }
});
```

### Async Error Handler Pattern

```javascript
eventManager.add(button, "click", async () => {
  try {
    await performAsyncAction();
    showToast("Action completed", "success");
  } catch (error) {
    console.error("[Component] Async error:", error);
    showToast("Error performing action", "error");
  }
});
```

## Memory Leak Prevention

### Problem: Event Listener Leaks

Without proper cleanup, adding event listeners can lead to memory leaks when:

- Components are destroyed but listeners remain attached
- The same handler is added multiple times
- Event listeners reference large objects or closures

### Solution: EventHandlerManager

The EventHandlerManager automatically tracks all event listeners and provides cleanup mechanisms:

```javascript
// Automatic tracking
this.eventManager.add(button, "click", handler);

// When component is destroyed
this.eventManager.clear(); // Removes ALL tracked listeners
```

### AbortController Pattern

Under the hood, EventHandlerManager uses AbortController for cleanup:

```javascript
const controller = new AbortController();
element.addEventListener("click", handler, {
  signal: controller.signal,
});

// Later, to cleanup
controller.abort(); // Automatically removes the listener
```

## Custom Events

### Dispatching Custom Events

Use the helper method for consistent custom event dispatching:

```javascript
_dispatchSectionEvent(element, eventName, detail = {}) {
  if (!element) return;

  try {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  } catch (error) {
    console.error(`Error dispatching ${eventName}:`, error);
  }
}

// Usage
this._dispatchSectionEvent(section.element, 'sectionShown', {
  sectionId,
  loadTime: section.loadTime || 0,
  timestamp: Date.now()
});
```

### Listening to Custom Events

```javascript
eventManager.add(viewer.container, "modelSelect", (event) => {
  try {
    const { objectName, modelName } = event.detail;
    console.log("Model selected:", objectName, modelName);
  } catch (error) {
    console.error("Error handling modelSelect:", error);
  }
});
```

## Event Naming Conventions

### Standard Event Names

- Use lowercase with hyphens for DOM events: `'click'`, `'mouse-move'`
- Use camelCase for custom events: `'modelSelect'`, `'sectionShown'`
- Use namespacing for application events: `'app:loaded'`, `'model:changed'`

### Event Detail Objects

Always include relevant context in custom event details:

```javascript
{
  sectionId: 'results-section',
  loadTime: 125.6,
  timestamp: 1234567890,
  error: null
}
```

## Testing Event Handlers

### Manual Testing Checklist

- [ ] Event handlers fire when expected
- [ ] Error handling prevents crashes
- [ ] Throttling/debouncing works as expected
- [ ] No duplicate event listeners added
- [ ] Cleanup removes all listeners
- [ ] No memory leaks after component destruction
- [ ] Event handlers don't interfere with each other

### Browser Console Testing

```javascript
// Check tracked event listeners
console.log(app.eventManager.handlers);

// Check section manager state
console.log(app.sectionManager.getStats());

// Verify cleanup
app.cleanup();
console.log(app.eventManager.handlers.size); // Should be 0
```

## Migration Guide

### From Direct addEventListener

**Before:**

```javascript
button.addEventListener("click", () => {
  this.handleClick();
});
```

**After:**

```javascript
this.eventManager.add(button, "click", () => {
  try {
    this.handleClick();
  } catch (error) {
    console.error("[Component] Error:", error);
  }
});
```

### Adding Cleanup

**Before:**

```javascript
class Component {
  constructor() {
    window.addEventListener("resize", this.onResize);
  }
}
```

**After:**

```javascript
class Component {
  constructor() {
    this.eventManager = new EventHandlerManager();
    this.eventManager.add(window, "resize", () => this.onResize());
  }

  cleanup() {
    this.eventManager.clear();
  }
}
```

## Best Practices

### 1. Always Use EventHandlerManager

❌ **Bad:**

```javascript
element.addEventListener("click", handler);
```

✅ **Good:**

```javascript
this.eventManager.add(element, "click", handler);
```

### 2. Implement Cleanup Methods

❌ **Bad:**

```javascript
class Component {
  constructor() {
    this.eventManager = new EventHandlerManager();
    this.setupEvents();
  }
}
```

✅ **Good:**

```javascript
class Component {
  constructor() {
    this.eventManager = new EventHandlerManager();
    this.setupEvents();
  }

  cleanup() {
    this.eventManager.clear();
  }
}
```

### 3. Use Try-Catch in Handlers

❌ **Bad:**

```javascript
this.eventManager.add(button, "click", () => {
  this.dangerousOperation();
});
```

✅ **Good:**

```javascript
this.eventManager.add(button, "click", () => {
  try {
    this.dangerousOperation();
  } catch (error) {
    console.error("[Component] Error:", error);
  }
});
```

### 4. Throttle High-Frequency Events

❌ **Bad:**

```javascript
window.addEventListener("resize", () => {
  this.expensiveOperation();
});
```

✅ **Good:**

```javascript
let timer = null;
this.eventManager.add(window, "resize", () => {
  if (!timer) {
    timer = setTimeout(() => {
      this.expensiveOperation();
      timer = null;
    }, 250);
  }
});
```

### 5. Check Element Existence

❌ **Bad:**

```javascript
this.eventManager.add(document.getElementById("button"), "click", handler);
// Throws error if element doesn't exist
```

✅ **Good:**

```javascript
const button = document.getElementById("button");
if (button) {
  this.eventManager.add(button, "click", handler);
} else {
  console.warn("[Component] Button element not found");
}
```

## Troubleshooting

### Problem: Event Handler Not Firing

**Possible Causes:**

1. Element doesn't exist when adding listener
2. Event is being prevented/stopped elsewhere
3. Handler throws error (check console)

**Solution:**

- Check element exists: `console.log(element)`
- Add logging: `console.log('Event fired')`
- Check error handler catches issue

### Problem: Multiple Event Fires

**Possible Causes:**

1. Handler added multiple times
2. Event bubbling from child elements
3. Multiple elements with same handler

**Solution:**

- Use `eventManager.remove()` before re-adding
- Use `e.stopPropagation()` if needed
- Check with `eventManager.handlers` Map

### Problem: Memory Leak

**Possible Causes:**

1. Cleanup not called on component destruction
2. EventHandlerManager not used
3. Large objects captured in closure

**Solution:**

- Always call `cleanup()` in disposal
- Use EventHandlerManager for all listeners
- Avoid capturing large objects in handlers

## Additional Resources

- [MDN: EventTarget.addEventListener()](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN: CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [Debouncing and Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)

## Version History

- **v1.7.0** (Current): Complete event handling system overhaul
  - Added EventBus and EventHandlerManager
  - Refactored all components to use new system
  - Added throttling and debouncing
  - Implemented comprehensive error handling
  - Added cleanup methods across all components

---

_Last Updated: 2024_
_Maintained by: Development Team_
