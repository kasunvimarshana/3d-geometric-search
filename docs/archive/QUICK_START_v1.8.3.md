# Quick Start Guide - Model Hierarchy Panel v1.8.3

## 🚀 Getting Started in 3 Steps

### Step 1: Open the Application

1. Open `index.html` in your browser
2. The hierarchy panel toggle button appears on the right side
3. Click the toggle to open the panel (or it opens automatically on model load)

### Step 2: Load a Model

1. Click **"Upload Model"** section
2. Upload a 3D model file, OR
3. Click **"Model Library"** and select a pre-loaded model

**✨ What Happens:**

- Hierarchy panel automatically opens
- Model structure appears as a tree
- Root node expands automatically
- Statistics show: `✓ Synced | Nodes: X | Visible: X`

### Step 3: Explore!

- **Click any node** → Selects object in 3D viewer
- **Double-click any node** → Camera focuses on that object
- **Click objects in 3D** → Highlights in hierarchy with pulse animation

---

## 🎮 Controls Overview

### Panel Controls

```
┌─────────────────────────────────────┐
│ Model Hierarchy               [×]   │  ← Click [×] to close
├─────────────────────────────────────┤
│ [Search...          ] [🔄 Refresh]  │  ← Search or refresh
├─────────────────────────────────────┤
│ ✓ Synced | Nodes: 24 | Visible: 22 │  ← Live statistics
└─────────────────────────────────────┘
```

| Control        | Action    | Result                                |
| -------------- | --------- | ------------------------------------- |
| **Search Box** | Type text | Filters nodes in real-time            |
| **🔄 Refresh** | Click     | Reloads hierarchy, preserves state    |
| **✓ Synced**   | Info only | Shows current sync status             |
| **[×] Close**  | Click     | Closes panel (can reopen with toggle) |

### Tree Navigation

| Action                | Result                     |
| --------------------- | -------------------------- |
| **▸ Click arrow**     | Expands/collapses children |
| **Click node**        | Selects in 3D viewer       |
| **Double-click node** | Focuses camera on object   |
| **Hover node**        | Shows tooltip with details |

### 3D Viewer Integration

| Action              | Result                                    |
| ------------------- | ----------------------------------------- |
| **Click 3D object** | Highlights in hierarchy + pulse animation |
| **Hide object**     | 👁️ indicator appears (within 1 second)    |
| **Show object**     | 👁️ indicator disappears automatically     |

---

## 💡 Common Tasks

### Task 1: Find and Focus on a Specific Part

```
1. Open hierarchy panel
2. Type part name in search box
3. Node appears (parents auto-expand)
4. Double-click the node
5. Camera focuses on that part in 3D
```

**Example:** Finding "front wheel" in a car model

```
Type: "wheel"
  → Filters to show "Front Wheel" and "Rear Wheel"
Double-click: "Front Wheel"
  → Camera zooms to front wheel
```

### Task 2: Select Multiple Parts of Same Type

```
1. Search for type (e.g., "mesh")
2. All meshes appear in filtered view
3. Click each node to select in viewer
4. Use for comparison or inspection
```

### Task 3: Check Hidden Objects

```
1. Look at statistics bar
2. If "Hidden: X" appears (orange), you have hidden objects
3. Look for 👁️ icons in tree
4. Click those nodes to inspect hidden objects
5. Use viewer controls to show/hide
```

### Task 4: Reload After External Changes

```
1. If model structure changed programmatically
2. Click the 🔄 Refresh button
3. Hierarchy rebuilds (keeps your view state)
4. New structure appears
5. Status: ✓ Synced
```

---

## 📖 Status Guide

### Understanding Statistics

```
✓ Synced | Nodes: 24 | Visible: 22 | Hidden: 2
```

| Part                   | Meaning                   |
| ---------------------- | ------------------------- |
| **✓ Synced** (green)   | Everything synchronized   |
| **Nodes: 24**          | Total objects in model    |
| **Visible: 22**        | Objects currently visible |
| **Hidden: 2** (orange) | Objects currently hidden  |

### Status Indicators

| Status           | Color           | Meaning          | Action Needed       |
| ---------------- | --------------- | ---------------- | ------------------- |
| **✓ Synced**     | Green           | All good         | None                |
| **⟳ Updated**    | Blue            | Changes detected | None (auto-updated) |
| **⟳ Refreshing** | Amber (pulsing) | Reloading        | Wait a moment       |
| **○ Cleared**    | Gray            | No model         | Load a model        |
| **● Ready**      | White           | Ready for model  | Load a model        |

---

## 🔍 Node Information

### Understanding Node Display

```
▾ 📦 CarBody (12 nodes)
  ▸ 🎨 Exterior (8 nodes)
  ▾ 🎨 Interior (4 nodes)
    ▫ 📐 Seat (1.2K vertices)
    ▫ 📐 Dashboard (850 vertices) 👁️
```

| Symbol              | Meaning                      |
| ------------------- | ---------------------------- |
| **▸**               | Collapsed (click to expand)  |
| **▾**               | Expanded (click to collapse) |
| **📦**              | Group/Container              |
| **🎨**              | Object3D                     |
| **📐**              | Mesh (has geometry)          |
| **▫**               | Leaf node (no children)      |
| **(12 nodes)**      | Total children count         |
| **(1.2K vertices)** | Geometry vertex count        |
| **👁️**              | Object is hidden             |

---

## ⚡ Keyboard Tips

While in hierarchy panel:

| Key        | Action                            |
| ---------- | --------------------------------- |
| **Tab**    | Navigate between search and tree  |
| **Enter**  | Select focused node               |
| **Escape** | Clear search                      |
| **↑/↓**    | Navigate nodes (if focus in tree) |

---

## 🐛 Troubleshooting

### Problem: Hierarchy not appearing

**Solutions:**

1. Check that model is loaded (look for 3D object in viewer)
2. Click the toggle button on right side to open panel
3. Check browser console for errors
4. Try clicking refresh button

### Problem: Statistics show "Hidden" objects but I don't see indicators

**Solutions:**

1. Scroll through the tree (indicators on hidden nodes)
2. Use search to find hidden objects: type name
3. Click refresh to update display
4. Check if objects are deeply nested (expand parents)

### Problem: Clicking nodes doesn't select in viewer

**Solutions:**

1. Make sure model is fully loaded
2. Check that viewer section is visible
3. Try clicking refresh
4. Check browser console for errors

### Problem: State not updating automatically

**Solutions:**

1. Wait 1 second (monitoring interval)
2. Click refresh for immediate update
3. Check that hierarchy panel is open
4. Verify model is loaded

---

## 🎯 Best Practices

### For Large Models

1. **Use Search**: Filter to find specific parts
2. **Selective Expansion**: Only expand needed branches
3. **Refresh Sparingly**: Only when structure changes
4. **Monitor Statistics**: Watch node counts for performance

### For Complex Hierarchies

1. **Start at Root**: Expand level by level
2. **Use Double-Click**: Quick focus on deep nodes
3. **Bookmark Nodes**: Remember names of important parts
4. **Use Viewer Clicks**: Let hierarchy highlight for you

### For Performance

1. **Close When Not Needed**: Reduces monitoring overhead
2. **Clear Searches**: Restore full tree when done
3. **Limit Deep Expansion**: Don't expand all at once
4. **Use Focus**: Double-click is faster than manual navigation

---

## 📱 Mobile Usage

On mobile devices:

1. **Toggle Button**: Tap to open/close panel
2. **Slide Gesture**: Panel slides from right
3. **Touch Nodes**: Single tap to select, double-tap to focus
4. **Search**: Use on-screen keyboard
5. **Scroll**: Use touch scroll in tree area

---

## 🎓 Learning Path

### Beginner (5 minutes)

1. Load a model
2. Click nodes to see selection
3. Double-click to focus camera
4. Try searching for parts

### Intermediate (10 minutes)

5. Click objects in 3D viewer
6. Observe hierarchy highlighting
7. Expand/collapse branches
8. Check statistics bar

### Advanced (15 minutes)

9. Hide objects and see indicators
10. Use refresh to reload
11. Monitor state changes
12. Explore nested structures

---

## 📞 Need Help?

### Check These Resources:

1. **Detailed Guide**: Read `HIERARCHY_FEATURES_v1.8.3.md`
2. **Quick Reference**: See `HIERARCHY_QUICK_REFERENCE.md`
3. **Architecture**: Understand flow in `ARCHITECTURE_DIAGRAM_v1.8.3.md`
4. **Implementation**: Check `IMPLEMENTATION_SUMMARY_v1.8.3.md`

### Still Stuck?

1. Check browser console (F12) for errors
2. Verify all files are loaded (no 404s)
3. Try reloading the page
4. Test with a simple model first

---

## 🎉 You're Ready!

Start by:

1. Loading a model
2. Opening the hierarchy panel
3. Exploring the tree structure
4. Clicking nodes and objects

**Remember:**

- Single click = Select
- Double click = Focus
- Search = Filter
- Refresh = Reload

Enjoy exploring your 3D models! 🚀

---

**Version**: 1.8.3  
**Last Updated**: December 13, 2024
