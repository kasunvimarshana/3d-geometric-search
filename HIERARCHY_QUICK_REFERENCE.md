# Quick Reference: Model Hierarchy Panel v1.8.3

## 🎯 At a Glance

**What's New:**

- Real-time state monitoring (checks every 1 second)
- Manual refresh button to reload hierarchy
- Enhanced bidirectional sync with pulse animations
- Live statistics display (nodes, visible, hidden counts)
- Better visual feedback for all interactions

---

## 🖱️ User Interactions

### In the Hierarchy Panel

| Action                  | Result                              |
| ----------------------- | ----------------------------------- |
| **Click node**          | Selects object in 3D viewer         |
| **Double-click node**   | Focuses camera on object            |
| **Type in search**      | Filters nodes in real-time          |
| **Click refresh 🔄**    | Reloads hierarchy (preserves state) |
| **Click expand ▸**      | Expands/collapses children          |
| **Click toggle button** | Opens/closes panel                  |

### In the 3D Viewer

| Action           | Result                                                                               |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Click object** | Highlights in hierarchy + auto-expands parents + scrolls into view + pulse animation |
| **Hide object**  | 👁️ indicator appears in hierarchy within 1 second                                    |
| **Show object**  | 👁️ indicator disappears automatically                                                |

---

## 📊 Status Indicators

| Status         | Icon | Color           | Meaning                           |
| -------------- | ---- | --------------- | --------------------------------- |
| **Synced**     | ✓    | Green           | Hierarchy synchronized with model |
| **Updated**    | ⟳    | Blue            | Changes detected and applied      |
| **Cleared**    | ○    | Gray            | No model loaded                   |
| **Refreshing** | ⟳    | Amber (pulsing) | Reloading in progress             |
| **Ready**      | ●    | Default         | Ready for interaction             |

---

## 🔧 Technical Quick Checks

### Verify Installation

1. Check `modelHierarchyPanel.js` has these methods:

   ```javascript
   -startStateMonitoring() -
     checkStateChanges() -
     refreshHierarchy() -
     highlightInHierarchy() -
     updateStats();
   ```

2. Check `styles.css` has these classes:

   ```css
   - .hierarchy-controls
   - .hierarchy-refresh-btn
   - .hierarchy-stats
   - .stats-status
   - .highlight-pulse
   - .object-hidden
   ```

3. Check EventBus events:
   - `model:loaded` → triggers analyzeModel()
   - `model:removed` → triggers clearHierarchy()
   - `modelClick` → triggers highlightInHierarchy()

### Debug Checklist

**Hierarchy not updating?**

- Check EventBus is emitting `model:loaded` in app.js `displayModel()`
- Verify `subscribeToEvents()` is called in init()
- Check console for `[ModelHierarchy]` logs

**State monitoring not working?**

- Verify `startStateMonitoring()` is called
- Check `this.stateMonitorInterval` is set
- Look for `checkStateChanges()` in code flow

**Bidirectional sync issues?**

- Verify `modelClick` event fires in viewer
- Check `objectToNode` Map has entries
- Confirm `highlightInHierarchy()` is called

**Refresh not working?**

- Check refresh button click handler
- Verify `refreshHierarchy()` method exists
- Look for "Refreshing..." status in stats bar

---

## 📝 Code Snippets

### Programmatic Refresh

```javascript
// Access the hierarchy panel instance
const hierarchyPanel = app.hierarchyPanel;

// Trigger refresh
hierarchyPanel.refreshHierarchy();
```

### Get Statistics

```javascript
// Node count
const nodeCount = hierarchyPanel.nodeMap.size;

// Visible count
const visibleCount = Array.from(hierarchyPanel.nodeMap.values()).filter(
  (obj) => obj.visible
).length;

// Hidden count
const hiddenCount = nodeCount - visibleCount;
```

### Monitor State Changes

```javascript
// The state monitoring runs automatically every 1 second
// To manually check:
hierarchyPanel.checkStateChanges();
```

### Highlight Specific Object

```javascript
// From a Three.js object
const myObject = scene.getObjectByName("MyMesh");
hierarchyPanel.highlightInHierarchy(myObject);
```

---

## 🎨 Customization

### Adjust Monitoring Interval

In `modelHierarchyPanel.js`, change the interval:

```javascript
startStateMonitoring() {
  this.stateMonitorInterval = setInterval(() => {
    if (this.currentModel && this.modelHierarchy) {
      this.checkStateChanges();
    }
  }, 2000); // Change from 1000ms to 2000ms (2 seconds)
}
```

### Customize Status Colors

In `styles.css`, modify status colors:

```css
.stats-status.synced {
  color: #your-color;
  background: rgba(your, rgb, values, 0.2);
}
```

### Adjust Pulse Animation

In `styles.css`, modify highlight pulse:

```css
@keyframes highlightPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
  50% {
    box-shadow: 0 0 20px 8px rgba(102, 126, 234, 0.8); /* Stronger glow */
  }
}
```

---

## 🐛 Common Issues

### Issue: Statistics not updating

**Solution:** Check that `updateStats()` is called after state changes

### Issue: Refresh loses selection

**Solution:** Verify `selectedNode` is stored before re-analysis

### Issue: Hidden objects don't show indicator

**Solution:** Ensure `object-hidden` class is added and CSS is loaded

### Issue: Pulse animation not visible

**Solution:** Check that `.highlight-pulse` animation is defined in CSS

### Issue: Memory leak from monitoring

**Solution:** Ensure `destroy()` method clears the interval

---

## ✅ Testing Steps

1. **Load Model**

   - Load any 3D model
   - Verify hierarchy appears
   - Check status shows "✓ Synced"
   - Confirm statistics display node count

2. **Test Bidirectional Sync**

   - Click node in hierarchy → object selected in viewer
   - Double-click node → camera focuses on object
   - Click object in viewer → node highlighted in hierarchy
   - Verify pulse animation appears

3. **Test State Monitoring**

   - Hide an object in the viewer (via code or UI)
   - Wait 1 second
   - Verify 👁️ indicator appears
   - Check statistics show hidden count

4. **Test Refresh**

   - Expand some nodes
   - Select a node
   - Click refresh button
   - Verify expanded state preserved
   - Verify selection maintained

5. **Test Search**
   - Type search term
   - Verify filtering works
   - Clear search
   - Verify full tree restored

---

## 📞 Support

For issues or questions:

1. Check the console for `[ModelHierarchy]` logs
2. Verify all files are loaded (no 404 errors)
3. Confirm EventBus is available (`window.eventBus`)
4. Review HIERARCHY_FEATURES_v1.8.3.md for detailed documentation

Version: **1.8.3**  
Last Updated: **December 13, 2024**
