# Quick Start - Model Interaction (v1.5.0)

## 🚀 New in v1.5.0: Interactive Model Selection

You can now click on 3D model parts to select and interact with them!

## How to Use

### 1. Load a Model

- Drag and drop a 3D file (glTF, GLB, OBJ, STL) into the viewer
- OR click the upload button to browse for a file

### 2. Interact with the Model

#### Click to Select

- **Click any part** of your 3D model
- The part will **highlight in orange** 🟠
- A notification shows the selected object name
- **Click again** on the same part to deselect

#### Hover to Preview

- **Move your mouse** over model parts
- Parts will **highlight in blue** 🔵 as you hover
- The cursor changes to a **pointer** 👆
- This shows which part you'll select if you click

#### Clear Selection

- **Click on empty space** (not on the model) to deselect
- OR click the same object again to toggle off
- OR press **Shift+R** to reset everything

## Visual Feedback

| Action               | Visual Effect               | Cursor  |
| -------------------- | --------------------------- | ------- |
| Hover over model     | Blue highlight (subtle)     | Pointer |
| Click to select      | Orange highlight (bright)   | Pointer |
| Selected and hovered | Orange only (selected wins) | Pointer |
| No interaction       | No highlight                | Default |
| Click empty space    | Removes all highlights      | Default |

## What Can You Do?

### Currently Supported ✅

- Select individual mesh components
- See which object is selected (notification + console)
- Toggle selection on/off
- Hover preview before selecting
- Clear selections easily
- Works with all existing controls

### Coming Soon 🔮

- Multi-select (Ctrl+Click)
- Object information panel
- Measurement between selected points
- Transform selected objects
- Export selected parts

## Tips & Tricks

### 💡 Best Practices

1. **Double-click** to focus on the model first
2. **Hover** to preview which part you'll select
3. **Check console** for detailed object information
4. **Click empty space** to quickly clear selection
5. **Use Shift+R** to reset everything at once

### 🔧 Troubleshooting

**Selection not working?**

- Make sure a model is loaded
- Ensure you're clicking on the model, not the background
- Try clicking different parts of the model

**Highlights not showing?**

- Some materials may not support emissive highlights
- Check browser console for any errors
- Verify your model has proper mesh data

**Cursor not changing?**

- Make sure you're hovering directly over model geometry
- The cursor only changes over interactive mesh parts

## Keyboard Shortcuts Reminder

| Key     | Action                       |
| ------- | ---------------------------- |
| F       | Toggle fullscreen            |
| R       | Reset camera view            |
| Shift+R | Reset ALL (clears selection) |
| Space   | Toggle auto-rotate           |
| G       | Toggle grid                  |
| A       | Toggle axes                  |
| W       | Toggle wireframe             |
| +/-     | Zoom in/out                  |
| 0       | Fit to view                  |
| ?       | Show keyboard help           |

## Examples

### Select and Inspect

1. Load your model
2. Click on a specific part (e.g., a wheel, panel, component)
3. Check the notification: "Selected: wheel_left"
4. Open browser console (F12) to see full details
5. Click another part to switch selection

### Compare Parts

1. Select a part (orange highlight)
2. Hover over other parts (blue highlights)
3. Compare visually which parts are similar
4. Click to switch between selections

### Precise Selection

1. Zoom in close to your model (+/- keys or mouse wheel)
2. Rotate to get a good angle (left-click drag)
3. Hover to confirm you're targeting the right part (blue)
4. Click to select (orange)

## Advanced Usage

### For Developers

```javascript
// Listen to selection events
viewer.container.addEventListener("modelSelect", (event) => {
  const { object, objectName, modelName, point } = event.detail;
  console.log(`Selected ${objectName} at`, point);

  // Do something with the selection
  // e.g., show properties, measure, export, etc.
});

// Programmatically deselect
viewer.deselectObject();

// Disable interaction temporarily
viewer.setInteractionEnabled(false);

// Re-enable
viewer.setInteractionEnabled(true);
```

### Event Data

Each selection event includes:

- **object**: The Three.js Object3D that was selected
- **objectName**: Human-readable name or "Unnamed"
- **modelName**: Name of the parent model
- **point**: 3D coordinates where you clicked (Vector3)

## What's Next?

Check out these guides for more:

- **MODEL_INTERACTION_GUIDE.md** - Complete technical documentation
- **QUICK_REFERENCE.md** - All keyboard shortcuts and controls
- **CHANGELOG.md** - Full version history
- **README.md** - Project overview and features

## Need Help?

- Press **?** to see keyboard shortcuts
- Check the browser console (F12) for detailed logs
- See **MODEL_INTERACTION_GUIDE.md** for troubleshooting
- All interactions are logged to help you debug

---

**Version**: 1.5.0  
**Feature**: Interactive Model Selection  
**Status**: ✅ Ready to use

Enjoy exploring your 3D models! 🎉
