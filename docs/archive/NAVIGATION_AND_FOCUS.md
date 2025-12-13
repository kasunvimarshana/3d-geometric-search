# Model Hierarchy: Seamless Navigation and Automatic Focus

## Overview

Version 1.8.3+ includes enhanced **bidirectional navigation and automatic focus** capabilities, providing intuitive, responsive, and reliable interaction between the Model Hierarchy Panel and the 3D viewer.

## Key Features

### 🎯 Automatic Focus Management

- **Seamless camera navigation** to focused objects
- **Bidirectional synchronization** between hierarchy and viewer
- **Automatic panel opening** when needed
- **Enhanced visual feedback** with focus rings and animations

### 🔄 Bidirectional Navigation

#### Hierarchy → Viewer

```
Single Click → Select and highlight (visual only)
Double Click → Focus camera + select (full navigation)
```

#### Viewer → Hierarchy

```
Click 3D Object → Auto-open panel + scroll to node + highlight + select
```

## User Interaction Patterns

### From Hierarchy Panel

**1. Single Click on Node**

- ✅ Selects node in hierarchy (blue gradient background)
- ✅ Highlights corresponding object in 3D viewer
- ✅ Scrolls node into view if needed
- ✅ Adds temporary "focused" class with ring animation (2s)
- ❌ Does NOT move camera (preserves current view)

**2. Double Click on Node**

- ✅ Full camera focus and zoom to object
- ✅ Automatic panel opening if closed
- ✅ Expands all parent nodes for visibility
- ✅ Scrolls node into center of panel
- ✅ Adds "focus-active" class with enhanced visual feedback (1.5s)
- ✅ Emits `hierarchy:node-focused` event

### From 3D Viewer

**1. Click on 3D Object**

- ✅ Automatically opens hierarchy panel if closed
- ✅ Finds corresponding node in tree
- ✅ Expands all parent nodes
- ✅ Scrolls node into view (centered)
- ✅ Adds selection highlight
- ✅ Applies pulse animation for feedback
- ✅ Emits `viewer:object-selected` event

## Visual Feedback System

### Selection States

| State               | Visual Indicator                       | Duration    |
| ------------------- | -------------------------------------- | ----------- |
| **Selected**        | Blue gradient background + left border | Persistent  |
| **Focused**         | Focus ring animation (pulsing glow)    | 2 seconds   |
| **Focus Active**    | Enhanced glow + scale + shadow         | 1.5 seconds |
| **Highlight Pulse** | Pulsing box shadow (from viewer click) | 1.5 seconds |

### CSS Classes

```css
.node-content.selected {
  /* Persistent selection indicator */
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.3),
    rgba(118, 75, 162, 0.3)
  );
  border-left: 3px solid #667eea;
}

.node-content.focused {
  /* Temporary focus ring (2s) */
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.3);
  animation: focusRing 2s ease-in-out;
}

.node-content.focus-active {
  /* Active camera focus (1.5s) */
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.7), 0 0 25px rgba(102, 126, 234, 0.4),
    inset 0 0 10px rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.node-content.highlight-pulse {
  /* Viewer interaction feedback (1.5s) */
  animation: highlightPulse 1.5s ease-in-out;
}
```

## API Reference

### Core Methods

#### `selectNode(nodeId, options)`

Selects a node in the hierarchy with flexible behavior control.

**Parameters:**

```javascript
{
  fromViewer: boolean,     // Flag to prevent circular updates (default: false)
  autoFocus: boolean,      // Enable camera focus (default: false)
  scrollIntoView: boolean, // Scroll node into view (default: true)
  openPanel: boolean       // Auto-open panel (default: true)
}
```

**Example:**

```javascript
// Select without camera movement
hierarchyPanel.selectNode("root/mesh_001", {
  autoFocus: false,
  scrollIntoView: true,
});

// Select with automatic camera focus
hierarchyPanel.selectNode("root/mesh_001", {
  autoFocus: true,
  openPanel: true,
});
```

#### `focusOnNode(nodeId)`

Focuses camera on node with full navigation and visual feedback.

**Behavior:**

- Expands all parent nodes
- Opens panel if closed
- Scrolls node into center view
- Moves camera to focus on object
- Adds "focus-active" visual indicator
- Emits `hierarchy:node-focused` event

**Example:**

```javascript
hierarchyPanel.focusOnNode("root/mesh_001");
```

#### `selectObjectInTree(object)`

Selects node from 3D viewer interaction with automatic panel management.

**Parameters:**

- `object`: THREE.Object3D instance

**Behavior:**

- Auto-opens panel if closed
- Finds node ID from object mapping
- Expands parent nodes
- Scrolls into view
- Applies pulse animation
- Prevents circular updates with `fromViewer: true` flag

**Example:**

```javascript
// Called automatically on viewer click
viewer.container.addEventListener("modelClick", (e) => {
  hierarchyPanel.selectObjectInTree(e.detail.object);
});
```

#### `expandParentNodes(nodeId)`

Helper method to ensure node visibility by expanding all parent folders.

**Parameters:**

- `nodeId`: Full node path (e.g., "root/group1/mesh_001")

**Behavior:**

- Splits node path by '/'
- Iterates through parent levels
- Adds 'expanded' class to parent nodes
- Updates expandedNodes Set for state tracking

**Example:**

```javascript
// Ensure mesh_001 is visible
hierarchyPanel.expandParentNodes("root/group1/mesh_001");
// Result: 'root' and 'root/group1' are expanded
```

### Events

#### Emitted Events

| Event                     | Data                                        | Description                |
| ------------------------- | ------------------------------------------- | -------------------------- |
| `hierarchy:node-selected` | `{ nodeId, object, fromViewer, autoFocus }` | Node selected in hierarchy |
| `hierarchy:node-focused`  | `{ nodeId, object, timestamp }`             | Camera focused on node     |
| `viewer:object-selected`  | `{ object, timestamp }`                     | Object clicked in viewer   |
| `hierarchy:analyzed`      | `{ nodeCount, timestamp }`                  | Model analysis complete    |

#### Subscribed Events

| Event                     | Handler                | Description                        |
| ------------------------- | ---------------------- | ---------------------------------- |
| `model:loaded`            | `analyzeModel()`       | Rebuild hierarchy when model loads |
| `model:removed`           | `clearHierarchy()`     | Clear panel when model removed     |
| `modelClick`              | `selectObjectInTree()` | Sync viewer clicks to hierarchy    |
| `hierarchy:focus-request` | `focusOnNode()`        | External focus requests            |

### EventBus Integration

**Request Focus Programmatically:**

```javascript
// Focus by node ID
eventBus.emit("hierarchy:focus-request", {
  nodeId: "root/mesh_001",
});

// Focus by object reference
eventBus.emit("hierarchy:focus-request", {
  object: threeJsObject,
});
```

**Listen for Focus Events:**

```javascript
eventBus.on("hierarchy:node-focused", (data) => {
  console.log("Focused on:", data.nodeId);
  console.log("Object:", data.object);
  console.log("Timestamp:", data.timestamp);
});

eventBus.on("viewer:object-selected", (data) => {
  console.log("Viewer clicked:", data.object);
  console.log("Timestamp:", data.timestamp);
});
```

## Implementation Details

### Panel Auto-Opening Logic

The panel automatically opens in these scenarios:

1. **Node Selection (from hierarchy)**

   - Opens if closed AND `openPanel: true`
   - Skips if already open

2. **Viewer Interaction**

   - Always opens to show selection
   - Prevents missing user feedback

3. **Focus Request**
   - Opens as part of `focusOnNode()`
   - Ensures visibility of focused item

### Circular Update Prevention

To prevent infinite loops between viewer and hierarchy:

```javascript
// Hierarchy → Viewer
selectNode(nodeId, {
  fromViewer: false, // Normal click from hierarchy
});

// Viewer → Hierarchy
selectNode(nodeId, {
  fromViewer: true, // Prevents updating viewer again
});
```

### State Preservation

During operations, the system maintains:

- **Expanded nodes**: `Set` of expanded node IDs
- **Selected node**: Current selection (single)
- **Node mappings**: Bidirectional object ↔ node ID
- **Scroll position**: Preserved during refresh

## Best Practices

### For Users

1. **Single-click** to browse and highlight without moving camera
2. **Double-click** for full camera focus and zoom
3. **Use search** to quickly find and navigate to specific nodes
4. **Refresh** when model structure changes
5. **Collapse/expand** folders to organize view

### For Developers

#### Custom Focus Behavior

```javascript
// Implement custom focus with delayed camera movement
hierarchyPanel.selectNode(nodeId, { autoFocus: false });
setTimeout(() => {
  hierarchyPanel.focusOnNode(nodeId);
}, 500);
```

#### Batch Selection

```javascript
// Select multiple nodes without triggering focus
nodes.forEach((nodeId, index) => {
  hierarchyPanel.selectNode(nodeId, {
    autoFocus: false,
    scrollIntoView: index === nodes.length - 1, // Only scroll for last
    openPanel: index === 0, // Only open for first
  });
});
```

#### Track Focus History

```javascript
const focusHistory = [];

eventBus.on("hierarchy:node-focused", (data) => {
  focusHistory.push({
    nodeId: data.nodeId,
    timestamp: data.timestamp,
  });

  // Limit history size
  if (focusHistory.length > 50) {
    focusHistory.shift();
  }
});

// Navigate back
function goBack() {
  if (focusHistory.length > 1) {
    const previous = focusHistory[focusHistory.length - 2];
    hierarchyPanel.focusOnNode(previous.nodeId);
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Event Throttling**: Click events use `stopPropagation()` to prevent bubbling
2. **Batch DOM Updates**: `requestAnimationFrame` for scroll operations
3. **Selective Rendering**: Only visible nodes are interactable
4. **Memory Management**: Event cleanup via `EventManager`

### Timing Guidelines

| Operation            | Duration                   | Purpose                     |
| -------------------- | -------------------------- | --------------------------- |
| Focus ring animation | 2000ms                     | Clear visual feedback       |
| Focus active state   | 1500ms                     | Camera movement indicator   |
| Highlight pulse      | 1500ms                     | Viewer interaction feedback |
| Smooth scroll        | ~500ms (browser-dependent) | Comfortable navigation      |

## Troubleshooting

### Panel Doesn't Open Automatically

**Issue**: Panel stays closed when clicking 3D objects

**Solution**:

```javascript
// Check if panel instance exists
if (!window.modelHierarchyPanel) {
  console.error("Hierarchy panel not initialized");
}

// Verify viewer integration
if (!viewer.container) {
  console.error("Viewer container not found");
}

// Check event subscription
eventBus.hasListener("modelClick"); // Should return true
```

### Focus Doesn't Work

**Issue**: Double-click doesn't move camera

**Solution**:

```javascript
// Verify viewer has focus capability
if (typeof viewer.focusOnObject !== "function") {
  console.error("Viewer missing focusOnObject method");
}

// Check node mapping
const object = hierarchyPanel.nodeMap.get(nodeId);
if (!object) {
  console.error("Node not found in mapping:", nodeId);
}

// Verify object is in scene
if (!viewer.scene.getObjectById(object.id)) {
  console.error("Object not in scene");
}
```

### Selection Out of Sync

**Issue**: Hierarchy selection doesn't match viewer

**Solution**:

```javascript
// Force sync from viewer
const selectedObject = viewer.getSelectedObject();
if (selectedObject) {
  hierarchyPanel.selectObjectInTree(selectedObject);
}

// Clear and rebuild mappings
hierarchyPanel.refreshHierarchy();
```

### Visual Feedback Missing

**Issue**: No animations or highlights appear

**Solution**:

1. Check CSS is loaded: `getComputedStyle(element).animation`
2. Verify classes are applied: DevTools > Elements
3. Check browser animation support
4. Disable hardware acceleration if glitchy

## Examples

### Complete Integration

```javascript
// Initialize hierarchy panel with viewer
const hierarchyPanel = new ModelHierarchyPanel(viewer);

// Load model and auto-analyze
loader.loadModel("model.glb").then((model) => {
  viewer.addModel(model, "MyModel");
  // hierarchyPanel automatically analyzes via model:loaded event
});

// Handle viewer clicks (automatic via event subscription)
// No manual code needed - already integrated

// Programmatic navigation
document.getElementById("myButton").addEventListener("click", () => {
  // Find node by name
  const nodeId = Array.from(hierarchyPanel.nodeMap.entries()).find(
    ([id, obj]) => obj.name === "TargetMesh"
  )?.[0];

  if (nodeId) {
    hierarchyPanel.focusOnNode(nodeId);
  }
});

// Track user interactions
eventBus.on("hierarchy:node-focused", (data) => {
  analytics.track("model_navigation", {
    nodeId: data.nodeId,
    timestamp: data.timestamp,
  });
});

eventBus.on("viewer:object-selected", (data) => {
  analytics.track("viewer_interaction", {
    objectId: data.object.id,
    timestamp: data.timestamp,
  });
});
```

### Custom Navigation Controls

```javascript
// Back/Forward navigation
class NavigationHistory {
  constructor(hierarchyPanel) {
    this.panel = hierarchyPanel;
    this.history = [];
    this.currentIndex = -1;

    // Track focus changes
    eventBus.on("hierarchy:node-focused", (data) => {
      this.push(data.nodeId);
    });
  }

  push(nodeId) {
    // Remove forward history
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(nodeId);
    this.currentIndex++;
  }

  back() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.panel.focusOnNode(this.history[this.currentIndex]);
    }
  }

  forward() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.panel.focusOnNode(this.history[this.currentIndex]);
    }
  }
}

// Usage
const navHistory = new NavigationHistory(hierarchyPanel);
document
  .getElementById("backBtn")
  .addEventListener("click", () => navHistory.back());
document
  .getElementById("forwardBtn")
  .addEventListener("click", () => navHistory.forward());
```

## Technical Specifications

### Browser Compatibility

| Feature          | Chrome | Firefox | Safari   | Edge   |
| ---------------- | ------ | ------- | -------- | ------ |
| Focus animations | ✅ 88+ | ✅ 85+  | ✅ 14+   | ✅ 88+ |
| Smooth scroll    | ✅ 61+ | ✅ 36+  | ✅ 15.4+ | ✅ 79+ |
| CSS transforms   | ✅ 36+ | ✅ 16+  | ✅ 9+    | ✅ 12+ |
| Custom events    | ✅ All | ✅ All  | ✅ All   | ✅ All |

### Performance Metrics

| Operation              | Time    | Description                  |
| ---------------------- | ------- | ---------------------------- |
| `selectNode()`         | <5ms    | DOM class manipulation       |
| `focusOnNode()`        | 10-50ms | Includes camera animation    |
| `expandParentNodes()`  | <10ms   | Tree traversal + DOM updates |
| `selectObjectInTree()` | <20ms   | Mapping lookup + scroll      |

### Memory Footprint

| Data Structure  | Size            | Purpose                    |
| --------------- | --------------- | -------------------------- |
| `nodeMap`       | ~100 bytes/node | Node ID → Object3D mapping |
| `objectToNode`  | ~100 bytes/node | Object3D → Node ID mapping |
| `expandedNodes` | ~50 bytes/node  | Expansion state tracking   |

## Version History

### v1.8.3+ (Current)

- ✅ Enhanced automatic focus with configurable options
- ✅ Focus ring animations and visual feedback
- ✅ Automatic panel opening on interactions
- ✅ `expandParentNodes()` helper method
- ✅ `focus-active` and `focused` CSS states
- ✅ External focus requests via EventBus
- ✅ Circular update prevention with `fromViewer` flag
- ✅ Enhanced event data with timestamps

### v1.8.3

- ✅ Bidirectional selection synchronization
- ✅ Pulse animations for viewer clicks
- ✅ State monitoring (1s intervals)
- ✅ Refresh mechanism with state preservation
- ✅ Statistics display with status indicators
- ✅ Search and filter functionality

---

**Last Updated**: January 2025  
**Version**: 1.8.3+  
**Author**: Model Hierarchy Panel Development Team
