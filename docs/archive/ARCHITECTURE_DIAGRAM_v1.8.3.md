# System Architecture Diagram - Model Hierarchy v1.8.3

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐              ┌──────────────────────────┐    │
│  │   3D Viewer      │              │  Hierarchy Panel          │    │
│  │   (viewer.js)    │              │  (modelHierarchyPanel.js) │    │
│  │                  │              │                            │    │
│  │  • Three.js      │◄────────────►│  • Tree Display           │    │
│  │  • Raycasting    │   Bi-Sync    │  • Node Selection         │    │
│  │  • Camera Focus  │              │  • State Monitoring       │    │
│  │  • Selection     │              │  • Search/Filter          │    │
│  └──────────────────┘              │  • Refresh Mechanism      │    │
│                                     │  • Statistics Display     │    │
│                                     └──────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                         ┌──────────▼──────────┐
                         │     EventBus         │
                         │  (eventBus.js)       │
                         │                      │
                         │  • model:loaded      │
                         │  • model:removed     │
                         │  • modelClick        │
                         │  • hierarchy:analyzed│
                         └──────────────────────┘
                                    │
                                    │
                         ┌──────────▼──────────┐
                         │   App Controller     │
                         │     (app.js)         │
                         │                      │
                         │  • displayModel()    │
                         │  • Model Library     │
                         │  • Integration       │
                         └──────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Model Load Flow

```
User Action: Load Model
        │
        ▼
┌───────────────────┐
│ app.displayModel()│
└────────┬──────────┘
         │
         ├──► viewer.loadModel(model)
         │         │
         │         ├──► Renders in 3D
         │         └──► Auto-focuses camera
         │
         └──► eventBus.emit('model:loaded', {...})
                    │
                    ▼
         ┌─────────────────────────┐
         │ hierarchyPanel receives │
         └────────┬────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ analyzeModel()     │
         │  • Clear old data  │
         │  • Build hierarchy │
         │  • Create mappings │
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ renderTree()       │
         │  • Generate DOM    │
         │  • Add event hdlrs │
         │  • Auto-expand root│
         └────────┬───────────┘
                  │
                  ▼
         ┌────────────────────┐
         │ updateStats()      │
         │  • Calculate counts│
         │  • Update display  │
         │  • Status: Synced ✓│
         └────────────────────┘
```

---

### 2. Bidirectional Sync Flow

#### A. Hierarchy → Viewer (Click)

```
User: Click Node in Hierarchy
        │
        ▼
┌──────────────────┐
│ selectNode(id)   │
└────────┬─────────┘
         │
         ├──► Update DOM (selected class)
         │
         ├──► Get object from nodeMap
         │
         └──► Viewer updates selection
                  │
                  └──► Object highlighted in 3D
```

#### B. Hierarchy → Viewer (Double-Click)

```
User: Double-Click Node
        │
        ▼
┌──────────────────┐
│ focusOnNode(id)  │
└────────┬─────────┘
         │
         ├──► Get object from nodeMap
         │
         └──► viewer.focusOnObject(obj)
                  │
                  ├──► Calculate bounding box
                  ├──► Compute camera position
                  └──► Animate camera to object
```

#### C. Viewer → Hierarchy (Click 3D Object)

```
User: Click Object in 3D Viewer
        │
        ▼
┌─────────────────────┐
│ viewer.onModelClick()│
│  • Raycasting        │
│  • Find intersect    │
└────────┬────────────┘
         │
         ▼
┌────────────────────────────┐
│ dispatch modelClick event  │
└────────┬───────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ hierarchyPanel receives      │
└────────┬─────────────────────┘
         │
         ├──► selectObjectInTree(object)
         │         │
         │         └──► Find nodeId from objectToNode Map
         │
         └──► highlightInHierarchy(object)
                  │
                  ├──► Find all parent nodes
                  ├──► Expand parent nodes
                  ├──► Scroll to node
                  └──► Apply pulse animation (1.5s)
```

---

### 3. State Monitoring Flow

```
┌──────────────────────────────┐
│ startStateMonitoring()       │
│  (called on init)            │
└────────┬─────────────────────┘
         │
         ▼
    setInterval(1000ms)
         │
         ▼
    Every 1 second:
         │
         ▼
┌──────────────────────────────┐
│ checkStateChanges()          │
└────────┬─────────────────────┘
         │
         ▼
    Iterate nodeMap:
         │
         ├──► Get current DOM state
         │
         ├──► Get object.visible property
         │
         ├──► Compare states
         │
         └──► If different:
                  │
                  ├──► Update DOM class (object-hidden)
                  ├──► Set changesDetected = true
                  └──► Continue to next node
         │
         ▼
    If changesDetected:
         │
         └──► updateStats('updated')
```

---

### 4. Refresh Flow

```
User: Click Refresh Button
        │
        ▼
┌──────────────────────────────┐
│ refreshHierarchy()           │
└────────┬─────────────────────┘
         │
         ├──► updateStats('refreshing')
         │
         ├──► Store current state:
         │         │
         │         ├──► expanded nodes
         │         └──► selected node
         │
         ├──► Re-analyze model:
         │         │
         │         ├──► analyzeModel()
         │         ├──► buildHierarchy()
         │         └──► renderTree()
         │
         └──► setTimeout(100ms):
                  │
                  ├──► Restore expanded nodes
                  ├──► Restore selection
                  └──► updateStats('synced')
```

---

## 🗺️ Data Structure Map

### Core Data Structures

```javascript
ModelHierarchyPanel {
  // State
  currentModel: THREE.Object3D          // Current loaded model
  modelHierarchy: Node                  // Root hierarchy node
  selectedNode: string                  // Currently selected node ID

  // Data Structures
  nodeMap: Map<nodeId, THREE.Object3D>  // Node ID → 3D Object
  objectToNode: Map<THREE.Object3D, nodeId>  // 3D Object → Node ID
  expandedNodes: Set<nodeId>            // Set of expanded node IDs

  // Monitoring
  stateMonitorInterval: number          // Interval ID for monitoring

  // References
  viewer: Viewer3D                      // Reference to 3D viewer
  eventBus: EventBus                    // Event system
  eventManager: EventHandlerManager     // Event cleanup

  // DOM
  panel: HTMLElement                    // Panel container
  treeContainer: HTMLElement            // Tree display area
  toggleButton: HTMLElement             // Panel toggle button
}

Node Structure {
  id: string                  // Unique identifier
  name: string               // Display name
  type: string               // Object type (Group, Mesh, etc.)
  object: THREE.Object3D     // Reference to 3D object
  depth: number              // Nesting level
  children: Node[]           // Child nodes
  hasGeometry: boolean       // Has mesh geometry
  visible: boolean           // Visibility state
  meshCount: number          // Count of meshes
  vertexCount: number        // Total vertices
}
```

---

## 🎭 Event Flow Matrix

### Event Emissions

| Source            | Event              | Payload                 | Listeners      |
| ----------------- | ------------------ | ----------------------- | -------------- |
| app.js            | model:loaded       | {name, model, features} | hierarchyPanel |
| app.js            | model:removed      | -                       | hierarchyPanel |
| viewer.js         | modelClick         | {object}                | hierarchyPanel |
| hierarchyPanel.js | hierarchy:analyzed | {hierarchy, stats}      | (any)          |

### Event Handlers

| Component      | Listens For   | Action                                        |
| -------------- | ------------- | --------------------------------------------- |
| hierarchyPanel | model:loaded  | analyzeModel() + updateStats('synced')        |
| hierarchyPanel | model:removed | clearHierarchy() + updateStats('cleared')     |
| hierarchyPanel | modelClick    | selectObjectInTree() + highlightInHierarchy() |

---

## 🔐 State Management

### State Transitions

```
[No Model]
    │
    │ model:loaded
    ▼
[Model Loaded] ────────► updateStats('synced')
    │
    │ State changes detected
    ▼
[Changes Detected] ────► updateStats('updated')
    │
    │ User clicks refresh
    ▼
[Refreshing] ──────────► updateStats('refreshing')
    │
    │ Refresh complete
    ▼
[Synced] ──────────────► updateStats('synced')
    │
    │ model:removed
    ▼
[Cleared] ─────────────► updateStats('cleared')
    │
    │ Back to start
    ▼
[No Model]
```

### Statistics State Machine

```
          ┌─────────────┐
    ┌────►│   Ready ●   │◄────┐
    │     └─────────────┘     │
    │                         │
    │ Load model              │ Clear model
    │                         │
    ▼                         │
┌─────────────┐         ┌─────────────┐
│  Synced ✓   │────────►│  Cleared ○  │
└─────────────┘ Remove  └─────────────┘
    │     ▲
    │     │
    │     │ Refresh complete
    │     │
    │     │
    ▼     │
┌─────────────┐
│ Updated ⟳   │
└─────────────┘
    │     ▲
    │     │
    │     │ State restored
    │     │
    │     │
    ▼     │
┌─────────────┐
│Refreshing⟳  │
└─────────────┘
```

---

## 🎯 Interaction Points

### User → System Interactions

```
USER ACTIONS                    SYSTEM RESPONSES
─────────────                   ─────────────────

Click Node          ─────►      • Select in viewer
                                • Highlight in 3D
                                • Visual feedback

Double-Click Node   ─────►      • Focus camera
                                • Animate transition
                                • Center object

Click 3D Object     ─────►      • Find node
                                • Expand parents
                                • Scroll to node
                                • Pulse animation

Type Search Query   ─────►      • Filter nodes
                                • Expand matches
                                • Hide non-matches

Click Refresh       ─────►      • Store state
                                • Re-analyze
                                • Restore state
                                • Update display

Object Hidden       ─────►      • Detect change (1s)
                                • Add indicator 👁️
                                • Update stats
```

---

## 🧩 Module Dependencies

```
index.html
    │
    ├──► eventBus.js (non-module script)
    │       └──► window.eventBus
    │       └──► window.EventHandlerManager
    │
    ├──► sectionManager.js (non-module)
    │       └──► window.SectionManager
    │
    ├──► navigationManager.js (non-module)
    │       └──► window.NavigationManager
    │
    ├──► modelHierarchyPanel.js (non-module)
    │       └──► window.ModelHierarchyPanel
    │       └──► Depends on: eventBus, EventHandlerManager
    │
    └──► app.js (ES6 module)
            └──► Imports: viewer.js, modelLoader.js, geometryAnalyzer.js
            └──► Uses: SectionManager, NavigationManager, ModelHierarchyPanel
            └──► Depends on: eventBus
```

---

## 📊 Performance Profile

### Time Complexity

| Operation       | Complexity | Notes                    |
| --------------- | ---------- | ------------------------ |
| Build Hierarchy | O(n)       | n = number of objects    |
| Render Tree     | O(n)       | n = number of nodes      |
| State Check     | O(n)       | n = nodes, runs every 1s |
| Find Node       | O(1)       | Using Map lookup         |
| Expand Parents  | O(log n)   | Tree depth               |
| Filter Nodes    | O(n)       | Full tree scan           |

### Memory Usage

| Structure     | Size | Growth              |
| ------------- | ---- | ------------------- |
| nodeMap       | O(n) | Linear with objects |
| objectToNode  | O(n) | Linear with objects |
| expandedNodes | O(k) | k = expanded nodes  |
| DOM Tree      | O(n) | Linear with nodes   |

---

## 🔒 Memory Management

### Cleanup Chain

```
Panel Destroy
    │
    ├──► Clear state monitor interval
    │
    ├──► eventManager.cleanup()
    │       │
    │       └──► Remove all event listeners
    │
    ├──► clearHierarchy()
    │       │
    │       ├──► Clear nodeMap
    │       ├──► Clear objectToNode
    │       ├──► Clear expandedNodes
    │       └──► Set references to null
    │
    └──► Remove DOM element
```

---

This architecture ensures clean separation of concerns, efficient data flow, proper memory management, and seamless user experience!
