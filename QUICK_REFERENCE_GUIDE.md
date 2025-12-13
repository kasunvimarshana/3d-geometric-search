# Quick Reference Guide

## 3D Geometric Search Application

---

## 🎨 Design System Quick Reference

### Colors

```css
/* Grays */
--gray-50: #f9fafb   (Lightest)
--gray-100: #f3f4f6
--gray-200: #e5e7eb  (Borders)
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280  (Secondary text)
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827  (Primary text)

/* Primary */
--primary-500: #3b82f6  (Blue accent)
--primary-600: #2563eb
--primary-700: #1d4ed8

/* Semantic */
--accent-success: #10b981  (Green)
--accent-warning: #f59e0b  (Orange)
--accent-error: #ef4444   (Red)
```

### Spacing Scale

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
```

---

## ⌨️ Keyboard Shortcuts

| Key       | Action             |
| --------- | ------------------ |
| `F`       | Toggle Fullscreen  |
| `R`       | Reset View         |
| `Shift+R` | Reset All Settings |
| `0`       | Fit to View        |
| `Space`   | Auto-rotate        |
| `G`       | Toggle Grid        |
| `A`       | Toggle Axes        |
| `W`       | Toggle Wireframe   |
| `S`       | Toggle Shadows     |
| `+` / `=` | Zoom In            |
| `-`       | Zoom Out           |
| `Esc`     | Close Modal        |

---

## 🎯 Component API Quick Reference

### Viewer3D

```javascript
// Loading
viewer.loadModel(model, filename);

// Highlighting
viewer.highlightObject(object, color, opacity);
viewer.unhighlightObject(object);
viewer.clearHighlights();

// Object Management
viewer.isolateObject(targetObject);
viewer.restoreAllObjects();
viewer.getObjectByUuid(uuid);

// Interaction
viewer.updateMousePosition(event);
viewer.getIntersections();

// Camera
viewer.setCameraView(view); // 'front', 'back', 'left', 'right', 'top', 'bottom'
viewer.resetView();
viewer.fitToView();
viewer.zoomIn();
viewer.zoomOut();

// Display
viewer.toggleWireframe();
viewer.toggleGrid();
viewer.toggleAxes();
viewer.toggleShadows();
viewer.toggleAutoRotate();
viewer.toggleFullscreen();

// Utilities
viewer.takeScreenshot();
```

### EventHandler

```javascript
// Setup (called in app.js)
eventHandler.setupAll();

// Individual Handlers
handleResetView();
handleZoomIn();
handleZoomOut();
handleFitView();
handleAutoRotate(e);
handleWireframe();
handleGrid();
handleAxes();
handleShadows();
handleScreenshot();
handleFullscreen();
handleSettings();
handleKeyboardHelp();
handleSectionClick(object);
handleSectionHover(object);
clearSectionHover();

// Cleanup
eventHandler.cleanup();
```

### SectionHighlightManager

```javascript
// Highlighting
highlightSection(sectionId, source); // source: 'model' or 'list'
hoverSection(sectionId);
clearHighlight();

// Cleanup
destroy();
```

### EventBus

```javascript
// Emit Events
eventBus.emit("event:name", data);

// Listen to Events
eventBus.on("event:name", handler);

// Remove Listeners
eventBus.off("event:name", handler);
```

---

## 📡 Event Reference

### Model Events

```javascript
"model:section:click"; // { sectionId, object }
"model:section:hover"; // { sectionId, object }
"model:section:hover:clear"; // {}
```

### List Events

```javascript
"list:section:click"; // { sectionId }
"list:section:hover"; // { sectionId }
```

### Highlight Events

```javascript
"highlight:section"; // { sectionId, source }
"section:highlighted"; // { sectionId, source }
"hover:section"; // { sectionId }
"highlight:clear"; // {}
```

### Viewer Events

```javascript
"viewer:object-highlighted"; // { object, color, opacity, timestamp }
"viewer:object-unhighlighted"; // { object, timestamp }
"viewer:object-isolated"; // { object, timestamp }
"viewer:objects-restored"; // { timestamp }
```

---

## 🎨 CSS Class Reference

### Buttons

```css
.btn-primary      /* Primary action button */
/* Primary action button */
.btn-secondary    /* Secondary action button */
.btn-icon         /* Icon-only button */
.btn-preset       /* Camera preset button */
.active; /* Active state for toggle buttons */
```

### Model Cards

```css
.model-card           /* Library/results card */
/* Library/results card */
.model-card.active    /* Selected card */
.model-card.highlighted /* Highlighted card */
.model-thumbnail; /* Card thumbnail */
```

### Navigation

```css
.sidebar-nav              /* Left sidebar */
/* Left sidebar */
.sidebar-nav.open         /* Open state */
.nav-section-link         /* Section link */
.nav-section-link.active  /* Active section */
.nav-section-link.highlighted; /* Highlighted section */
```

### Hierarchy Panel

```css
.model-hierarchy-panel       /* Right panel */
/* Right panel */
.model-hierarchy-panel.open  /* Open state */
.hierarchy-node              /* Tree node */
.node-content                /* Node content wrapper */
.node-content.selected       /* Selected node */
.node-content.highlighted    /* Highlighted node */
.node-content.isolated       /* Isolated node */
.node-badge; /* Info badge (subtle) */
```

### Indicators

```css
.zoom-indicator       /* Zoom level (top-left) */
/* Zoom level (top-left) */
.isolation-indicator; /* Isolation state (top-right) */
```

### States

```css
.highlighted  /* Highlighted state */
/* Highlighted state */
.hover        /* Hover state */
.active       /* Active/selected state */
.isolated     /* Isolated state */
.drag-over; /* Drag-over state */
```

---

## 🔧 Common Patterns

### Adding a New Button Control

```javascript
// 1. Add button to HTML
<button class="btn-icon" id="myNewBtn" title="My Action">Icon</button>

// 2. Add handler in eventHandler.js
const controlHandlers = {
  // ... existing handlers
  myNewBtn: () => this.handleMyNewAction(),
};

handleMyNewAction() {
  // Implementation
  this.app.viewer?.doSomething();
  this.showToast("Action completed", "success");
}
```

### Adding a New Event

```javascript
// 1. Emit event
this.eventBus.emit("my:new:event", { data: "value" });

// 2. Listen to event
this.eventBus.on("my:new:event", (data) => {
  console.log("Event received:", data);
  // Handle event
});

// 3. Clean up (in destroy/cleanup method)
this.eventBus.off("my:new:event");
```

### Creating a New Section

```javascript
// 1. Register section in app.js
this.sectionManager.registerSection('my-section', {
  trigger: 'myTriggerBtn',
  onLoad: () => this.loadMySection(),
  persistent: true,
});

// 2. Implement loader
loadMySection() {
  console.log('Loading my section');
  // Load section content
}
```

---

## 🐛 Debugging Tips

### Check Event Flow

```javascript
// Add to eventBus.js emit method
console.log("[EventBus] Emit:", eventName, data);

// Add to eventBus.js on method
console.log("[EventBus] Subscribe:", eventName);
```

### Verify Section IDs

```javascript
// In handleSectionClick
console.log("Section clicked:", object.uuid);
console.log("Object:", object);
```

### Check Highlight State

```javascript
// In SectionHighlightManager
console.log("Current highlight:", this.currentHighlight);
console.log("Highlighted elements:", Array.from(this.highlightedElements));
```

### Verify Viewer State

```javascript
// In viewer.js
console.log("Current model:", this.currentModel);
console.log("Original materials:", this.originalMaterials.size);
console.log("Isolated object:", this.isolatedObject);
```

---

## 📊 Performance Monitoring

### Check Render Performance

```javascript
// In animate() method
const startTime = performance.now();
this.renderer.render(this.scene, this.camera);
const renderTime = performance.now() - startTime;
if (renderTime > 16.67) {
  console.warn("Slow render:", renderTime.toFixed(2), "ms");
}
```

### Monitor Event Frequency

```javascript
// In event handler
let eventCount = 0;
setInterval(() => {
  console.log("Events per second:", eventCount);
  eventCount = 0;
}, 1000);

// In handler
eventCount++;
```

---

## 📚 File Structure Reference

```
├── index.html                    # Main HTML
├── styles.css                    # Complete design system
├── js/
│   ├── app.js                    # Main application controller
│   ├── viewer.js                 # Three.js 3D viewer
│   ├── eventHandler.js           # Event handling (SOLID)
│   ├── sectionHighlightManager.js # Bidirectional highlighting
│   ├── eventBus.js               # Global pub/sub
│   ├── modelLoader.js            # File loading
│   ├── geometryAnalyzer.js       # Geometry analysis
│   ├── exportManager.js          # Data export
│   ├── navigationManager.js      # Section navigation
│   ├── sectionManager.js         # Lazy loading
│   ├── modelHierarchyPanel.js    # Hierarchy UI
│   ├── stateManager.js           # State management
│   ├── config.js                 # Configuration
│   ├── logger.js                 # Logging utilities
│   └── utils.js                  # Helper utilities
├── COMPREHENSIVE_REFACTORING_GUIDE.md
├── END_TO_END_REFACTORING_SUMMARY.md
└── QUICK_REFERENCE_GUIDE.md (this file)
```

---

## 🚀 Quick Start Checklist

### For Development

- [ ] Open `index.html` in browser
- [ ] Open DevTools Console
- [ ] Check for any errors
- [ ] Test upload functionality
- [ ] Test viewer controls
- [ ] Test section highlighting

### For Production

- [ ] Run tests (if available)
- [ ] Check console for errors
- [ ] Verify all features work
- [ ] Test on multiple browsers
- [ ] Test responsive layouts
- [ ] Optimize assets if needed

---

## 💡 Tips & Tricks

### CSS Customization

- All colors defined in `:root` variables
- Easy theme changes by modifying variables
- Consistent spacing via `--space-*` variables
- Shadows controlled by `--shadow-*` variables

### Adding Features

1. Start with event handler
2. Emit events via EventBus
3. Update viewer/UI as needed
4. Add documentation
5. Test thoroughly

### Performance

- Use throttle for frequent events
- Cache DOM queries
- Batch DOM updates
- Use event delegation
- Lazy load when possible

### Debugging

- Check EventBus logs
- Verify section IDs match
- Ensure viewer has model loaded
- Check for DOM element existence
- Use browser DevTools Timeline

---

**Last Updated:** December 14, 2025  
**Version:** 2.0  
**Status:** Production Ready ✅
