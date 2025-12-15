# 3D Geometric Search Engine - Configuration Guide

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Key Components](#key-components)
4. [Configuration Options](#configuration-options)
5. [Customization Guide](#customization-guide)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Troubleshooting](#troubleshooting)

## Overview

This application provides a full-featured 3D model viewer and geometric search engine with the following capabilities:

- **Multi-format Support**: glTF/GLB, STEP, OBJ, STL
- **Interactive 3D Viewer**: Zoom, pan, rotate with mouse controls
- **Geometric Analysis**: Automatic feature extraction and similarity comparison
- **Template Shapes**: Built-in geometric primitives for testing
- **Advanced Controls**: Multiple camera angles, scale controls, display options

## File Structure

```
public/
├── index.html          # Main HTML structure
├── app.js              # Application logic and event handling
├── viewer.js           # Three.js 3D viewer implementation
├── styles.css          # All styling and visual design
└── CONFIG.md           # This file
```

## Key Components

### 1. Viewer3D Class (`viewer.js`)

**Purpose**: Manages all 3D rendering and visualization

**Key Properties**:

- `scene`: Three.js scene container
- `camera`: Perspective camera (75° FOV)
- `renderer`: WebGL renderer with antialiasing
- `controls`: OrbitControls for camera manipulation
- `currentModel`: Currently loaded 3D model
- `gridHelper`: Floor grid (20x20 units)
- `axesHelper`: XYZ axes indicator (5 units)

**Key Methods**:
| Method | Purpose | Parameters |
|--------|---------|------------|
| `loadModel(url, format)` | Load 3D file | URL string, format string |
| `zoomIn()` | Move camera closer | None |
| `zoomOut()` | Move camera farther | None |
| `changeScale(delta)` | Adjust model size | delta: ±0.1 recommended |
| `resetScale()` | Reset to 0.1x scale | None |
| `setTopView()` | Camera from above | None |
| `setFrontView()` | Camera from front | None |
| `setSideView()` | Camera from side | None |
| `toggleWireframe()` | Toggle wireframe mode | None |
| `toggleGrid()` | Show/hide grid | None |
| `toggleAxes()` | Show/hide axes | None |
| `cycleBackground()` | Change background color | None |

### 2. Application State (`app.js`)

**Global Variables**:

```javascript
API_BASE         // Server URL (window.location.origin)
viewer3D         // Viewer3D instance
currentModelId   // Active model ID
allModels[]      // Array of uploaded models
```

**Initialization Functions**:

- `initViewer()`: Set up 3D viewer and controls
- `initUpload()`: Configure file upload (drag-drop and click)
- `initTemplates()`: Wire up template shape buttons
- `initControls()`: Set up search sliders and buttons
- `initEventDelegation()`: Handle dynamic element clicks

### 3. UI Components (`index.html`)

**Layout Structure**:

```
┌──────────────────────────────────────────┐
│            Header (Title)                │
├──────────┬──────────────────┬────────────┤
│          │                  │            │
│  Upload  │   3D Viewer      │  Results   │
│  Panel   │   (Main)         │  Panel     │
│          │                  │            │
│ Template │   Controls       │  Model     │
│  Shapes  │                  │  List      │
│          │                  │            │
│  Search  │                  │  Search    │
│ Settings │                  │  Results   │
│          │                  │            │
└──────────┴──────────────────┴────────────┘
│            Status Bar                    │
└──────────────────────────────────────────┘
```

## Configuration Options

### Camera Settings

Located in `viewer.js` constructor:

```javascript
// Field of view
this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

// Camera position (default)
this.camera.position.set(5, 5, 5);

// Control limits
this.controls.minDistance = 2; // Closest zoom
this.controls.maxDistance = 50; // Farthest zoom
```

**To modify**:

- Increase FOV (75 → 90) for wider view
- Adjust min/max distance for zoom range
- Change default position for different starting angle

### Lighting Configuration

Located in `viewer.js` init():

```javascript
// Ambient light (overall brightness)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

// Directional lights (shadows and highlights)
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight1.position.set(5, 10, 7.5);
```

**To modify**:

- Increase ambient intensity (0.5 → 0.7) for brighter scene
- Add more directional lights for different highlights
- Change light positions to alter shadows

### Background Colors

Located in `viewer.js` constructor:

```javascript
this.backgroundColors = [
  0x0f172a, // Dark blue (default)
  0x1a1a1a, // Almost black
  0x2d3748, // Slate
  0x1e3a8a, // Deep blue
  0x374151, // Gray
];
```

**To add custom colors**:

1. Add hex value to array: `0x123456`
2. Click background button to cycle through

### Scale Settings

Default model scale in loaders:

```javascript
this.currentModel.scale.set(0.1, 0.1, 0.1);
```

**Scale limits** (in `changeScale` method):

```javascript
Math.max(0.01, Math.min(10, currentScale + delta));
// Min: 0.01x, Max: 10x
```

**To modify**:

- Change default scale (0.1 → 0.5) for larger initial size
- Adjust min/max limits for scale range
- Change delta (0.1) for finer/coarser control

### Search Parameters

Located in `index.html`:

```html
<!-- Similarity Threshold -->
<input
  type="range"
  id="thresholdSlider"
  min="0.1"
  max="1.0"
  step="0.05"
  value="0.70"
/>

<!-- Max Results -->
<input type="range" id="limitSlider" min="1" max="50" step="1" value="10" />
```

**To modify**:

- Change default threshold (0.70 → 0.80) for stricter matching
- Increase max results (50 → 100) for more matches
- Adjust step size for precision

## Customization Guide

### Adding New Camera Presets

1. Add button to HTML:

```html
<button class="icon-btn" id="isometricViewBtn" title="Isometric View">
  📐
</button>
```

2. Add method to `viewer.js`:

```javascript
setIsometricView() {
  const distance = this.camera.position.distanceTo(this.controls.target);
  this.camera.position.set(distance, distance, distance);
  this.controls.update();
}
```

3. Wire up in `app.js`:

```javascript
document.getElementById("isometricViewBtn").addEventListener("click", () => {
  viewer3D.setIsometricView();
});
```

### Adding New Display Options

Example: Add lighting intensity control

1. Add slider to HTML control section
2. Add method to `viewer.js`:

```javascript
setLightingIntensity(value) {
  this.scene.children.forEach(child => {
    if (child instanceof THREE.Light) {
      child.intensity = value;
    }
  });
}
```

3. Wire up event listener in `app.js`

### Styling Customizations

All styles in `styles.css` use CSS variables:

```css
:root {
  --primary-color: #2563eb; /* Main accent color */
  --secondary-color: #7c3aed; /* Secondary accent */
  --success-color: #10b981; /* Success messages */
  --danger-color: #ef4444; /* Error messages */
  --bg-dark: #1e293b; /* Dark backgrounds */
  --bg-medium: #334155; /* Medium backgrounds */
  --text-light: #f1f5f9; /* Light text */
  --text-medium: #cbd5e1; /* Medium text */
}
```

**To change theme**:

- Modify CSS variables for global color changes
- Light theme: Change `--bg-dark` to lighter colors
- Accent color: Change `--primary-color`

## Keyboard Shortcuts

Current mouse controls:

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan view
- **Scroll Wheel**: Zoom in/out

**To add keyboard shortcuts**, add to `app.js`:

```javascript
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "r":
      viewer3D.resetCamera();
      break;
    case "w":
      viewer3D.toggleWireframe();
      break;
    case "g":
      viewer3D.toggleGrid();
      break;
    case "+":
      viewer3D.changeScale(0.1);
      break;
    case "-":
      viewer3D.changeScale(-0.1);
      break;
  }
});
```

## Troubleshooting

### Common Issues

**Models appear too large/small**:

- Adjust default scale in `loadGLTF`, `loadOBJ`, `loadSTL` methods
- Modify `fitCameraToObject` calculation

**Grid not visible**:

- Increase grid size: `GridHelper(20, 20, ...)` → `GridHelper(50, 50, ...)`
- Change grid colors to brighter values

**Controls feel sluggish**:

- Reduce damping: `this.controls.dampingFactor = 0.05` → `0.01`
- Disable damping: `this.controls.enableDamping = false`

**Background too dark**:

- Change default color: `0x0f172a` → `0x2d3748`
- Increase ambient light intensity

### Performance Optimization

For better performance with large models:

1. **Reduce antialiasing**:

```javascript
this.renderer = new THREE.WebGLRenderer({ antialias: false });
```

2. **Lower pixel ratio**:

```javascript
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

3. **Simplify grid**:

```javascript
this.gridHelper = new THREE.GridHelper(20, 10, ...); // Fewer divisions
```

## Best Practices

1. **Always check for null models** before operations:

```javascript
if (!this.currentModel) return;
```

2. **Update controls after camera changes**:

```javascript
this.controls.update();
```

3. **Use event delegation** for dynamic elements (already implemented)

4. **Keep scale in reasonable range** (0.01x to 10x)

5. **Test with various model sizes** to ensure good defaults

## Support

For issues or questions:

1. Check console for errors (F12)
2. Review [API.md](../API.md) for backend endpoints
3. See [README.md](../README.md) for general documentation
4. Check [USAGE.md](../USAGE.md) for user guide

---

Last Updated: December 13, 2025
Version: 1.0.0
