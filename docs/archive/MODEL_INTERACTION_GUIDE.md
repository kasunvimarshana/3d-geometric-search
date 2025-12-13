# Model Interaction Guide

## Overview

Version 1.5.0 introduces comprehensive 3D model interaction capabilities, allowing users to click on and interact with individual components of loaded 3D models.

## Features

### 1. Click to Select

Click on any part of your 3D model to select it:

- **Orange Highlight**: Selected objects are highlighted with an orange emissive glow
- **Toggle Selection**: Click the same object again to deselect it
- **Clear Selection**: Click on empty space to deselect the current object
- **Visual Feedback**: Selected objects maintain their highlight until deselected

### 2. Hover Effects

Move your mouse over model parts to see hover feedback:

- **Blue Highlight**: Hovered objects show a subtle blue glow
- **Pointer Cursor**: Cursor changes to a pointer when over interactive parts
- **Preview**: See which part you'll select before clicking
- **Non-Intrusive**: Hover effects disappear when you move away

### 3. Selection Information

When you select a model component:

- **Notification**: A toast notification displays the selected object's name
- **Console Logging**: Detailed information logged to the browser console
- **Event Details**: Access object properties, intersection points, and more

## How It Works

### Raycasting

The system uses Three.js raycasting to detect which 3D object is under your mouse cursor:

1. Mouse position is converted to normalized device coordinates
2. A ray is cast from the camera through the mouse position
3. The ray checks for intersections with all meshes in the model
4. The closest intersected object is selected or hovered

### Material Management

Original materials are preserved and restored:

- **Storage**: Original materials stored in a Map by object UUID
- **Highlight**: Emissive properties modified for selection/hover effects
- **Restore**: Original materials restored when deselecting or removing hover

### Event System

Custom events are dispatched for model interactions:

- **modelClick**: Fired when clicking on any model part (selected or not)
- **modelSelect**: Fired when selecting a new object
- **modelDeselect**: Fired when deselecting an object
- **modelHover**: Fired when hovering over model parts

## Usage Examples

### Basic Selection

```javascript
// The system is enabled by default when a model is loaded
// Simply click on any part of your 3D model in the viewer
```

### Listening to Selection Events

```javascript
// In app.js, event listeners are already set up:
viewer.container.addEventListener("modelSelect", (event) => {
  const { objectName, modelName, object, point } = event.detail;
  console.log(`Selected ${objectName} in ${modelName}`);
  console.log("Intersection point:", point);
});
```

### Programmatic Control

```javascript
// Disable interaction temporarily
viewer.setInteractionEnabled(false);

// Re-enable interaction
viewer.setInteractionEnabled(true);

// Check if an object is currently selected
if (viewer.selectedObject) {
  console.log("Currently selected:", viewer.selectedObject.name);
}

// Deselect programmatically
viewer.deselectObject();
```

## Technical Details

### New Properties in Viewer

- `raycaster`: THREE.Raycaster instance for object picking
- `mouse`: THREE.Vector2 for normalized mouse coordinates
- `selectedObject`: Currently selected THREE.Object3D
- `hoveredObject`: Currently hovered THREE.Object3D
- `originalMaterials`: Map storing original materials by UUID
- `interactionEnabled`: Boolean flag to enable/disable interaction

### New Methods in Viewer

- `onModelClick(event)`: Handle mouse click events
- `onModelHover(event)`: Handle mouse move events
- `updateMousePosition(event)`: Convert mouse to normalized coordinates
- `getIntersections()`: Perform raycasting and get intersected objects
- `selectObject(object, point)`: Select an object and apply highlighting
- `deselectObject()`: Deselect current object and restore material
- `highlightObject(object, color, opacity)`: Apply emissive highlight
- `unhighlightObject(object)`: Remove highlight and restore original
- `setInteractionEnabled(enabled)`: Toggle interaction system

## Integration with Existing Features

### Reset All

The Reset All feature (Shift+R) now clears any active selections:

```javascript
// Clears selections automatically
viewer.resetAll();
```

### Fullscreen Mode

Model interaction works seamlessly in fullscreen mode with proper coordinate calculations.

### Keyboard Shortcuts

All existing keyboard shortcuts continue to work alongside model interaction.

## Browser Compatibility

Model interaction works in all modern browsers that support:

- WebGL
- Pointer events
- ES6 JavaScript

Tested on:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Raycasting is performed only on mouse events (click/move)
- Only meshes in the current model are checked for intersections
- Material changes are efficient and don't affect rendering performance
- Original materials are cached to avoid repeated lookups

## Troubleshooting

### Selection Not Working

- Ensure a model is loaded
- Check that `viewer.interactionEnabled` is `true`
- Verify the model contains meshes (not just groups or empties)

### Hover Not Responding

- Check browser console for errors
- Ensure mouse events are not blocked by other UI elements
- Verify the model is within the camera's view frustum

### Highlights Not Appearing

- Check if the model's material supports emissive properties
- Some materials may need `emissive` and `emissiveIntensity` properties
- Verify materials aren't being overridden elsewhere

## Future Enhancements

Potential improvements for future versions:

- Multi-selection (Ctrl+Click)
- Selection box/lasso tool
- Object information panel with properties
- Selection history and undo/redo
- Export selected objects
- Measurement tools between selected points
- Transform controls for selected objects
- Group selection and manipulation

## API Reference

### Events

#### modelClick

Dispatched when clicking on any model part.

```javascript
event.detail = {
  object: THREE.Object3D, // The clicked object
  point: THREE.Vector3, // Intersection point in world space
  intersection: {
    // Full raycaster intersection data
    distance: number,
    point: THREE.Vector3,
    face: THREE.Face3,
    faceIndex: number,
    object: THREE.Object3D,
  },
};
```

#### modelSelect

Dispatched when selecting an object.

```javascript
event.detail = {
  object: THREE.Object3D, // The selected object
  point: THREE.Vector3, // Selection point
  objectName: string, // Object's name or "Unnamed"
  modelName: string, // Parent model's name
};
```

#### modelDeselect

Dispatched when deselecting an object.

```javascript
event.detail = {
  object: THREE.Object3D, // The previously selected object
};
```

#### modelHover

Dispatched when hovering over model parts.

```javascript
event.detail = {
  object: THREE.Object3D, // The hovered object
  point: THREE.Vector3, // Hover point
};
```

## Credits

Model interaction system built with:

- **Three.js**: Raycasting and 3D object manipulation
- **Custom Event API**: For event dispatching
- **Modern JavaScript**: ES6+ features for clean code

---

**Version**: 1.5.0  
**Last Updated**: 2025-12-13  
**Author**: 3D Geometric Search Team
