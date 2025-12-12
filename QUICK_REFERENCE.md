# Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:8000
```

## 📁 File Reference

### HTML & CSS

- `index.html` - Main application page with all UI elements
- `styles.css` - Complete styling including new controls and animations

### JavaScript Modules

- `js/app.js` - Main controller, coordinates all modules
- `js/viewer.js` - 3D visualization with Three.js
- `js/modelLoader.js` - Multi-format 3D file loader
- `js/geometryAnalyzer.js` - Shape analysis and similarity
- `js/exportManager.js` - Export models and data
- `js/config.js` - Centralized configuration
- `js/utils.js` - Reusable utility functions

### Documentation

- `README.md` - User-facing documentation
- `DEVELOPER.md` - Comprehensive developer guide (650+ lines)
- `CHANGELOG.md` - Version history and changes
- `USAGE.md` - Detailed usage instructions
- `SUMMARY.md` - Enhancement summary
- `QUICK_REFERENCE.md` - This file

## 🎮 Keyboard Shortcuts (Viewer)

### View Controls

- **F** - Toggle fullscreen mode
- **R** - Reset camera to default position
- **Shift + R** - Reset all settings to default
- **G** - Toggle coordinate grid
- **A** - Toggle coordinate axes
- **W** - Toggle wireframe mode
- **S** - Toggle shadow rendering

### Zoom Controls

- **+/=** - Zoom in
- **-** - Zoom out
- **0** - Fit model to view (auto-frame)

### Display Options

- **Space** - Toggle auto-rotation
- **Escape** - Exit fullscreen or close modal

### Mouse Controls

- **Left Click + Drag** - Rotate camera
- **Right Click + Drag** - Pan camera
- **Scroll Wheel** - Zoom in/out
- **Double Click** - Focus on model
- **Click on Model** - Select/deselect model component
- **Hover over Model** - Highlight model part (blue)

### Model Interaction

- **Click Model Parts** - Select with orange highlight
- **Click Again** - Toggle selection off
- **Click Empty Space** - Deselect current selection
- **Hover** - Blue highlight preview before selection

## 🎨 UI Controls Reference

### Viewer Controls (Top Right)

| Icon | Name        | Function                          |
| ---- | ----------- | --------------------------------- |
| 🔍+  | Zoom In     | Zoom camera closer to model       |
| 🔍-  | Zoom Out    | Zoom camera away from model       |
| ⛶    | Fit View    | Auto-frame model in viewport      |
| 🔄   | Reset View  | Return camera to default position |
| 🔁   | Auto-Rotate | Toggle automatic model rotation   |
| ⛶    | Fullscreen  | Toggle fullscreen mode            |
| ⌨️   | Shortcuts   | Show keyboard shortcuts help      |
| 🔲   | Wireframe   | Toggle wireframe rendering        |
| 📐   | Grid        | Show/hide coordinate grid         |
| 🎯   | Axes        | Show/hide coordinate axes         |
| 💡   | Shadows     | Enable/disable shadow rendering   |
| 📷   | Screenshot  | Capture current view              |
| ⚙️   | Settings    | Show/hide advanced controls       |

### Camera Preset Views

| Button | Function              |
| ------ | --------------------- |
| Front  | View model from front |
| Back   | View model from back  |
| Left   | View model from left  |
| Right  | View model from right |
| Top    | View model from above |
| Bottom | View model from below |

### Advanced Controls (Settings Panel)

#### Lighting Controls

- **Ambient Light** - Slider (0.0 - 1.0) for overall scene brightness
- **Directional Light** - Slider (0.0 - 2.0) for main light intensity
- **Background** - Color picker for viewport background

#### Model Controls

- **Model Scale** - Slider (0.1x - 3.0x) to resize current model
- **Rotation Speed** - Slider (0.5 - 5.0) for auto-rotation speed
- **Focus on Model** - Button to center and frame current model

### Library Actions

| Button             | Function                           |
| ------------------ | ---------------------------------- |
| 📊 Export Data     | Export all model analysis as JSON  |
| 📄 Generate Report | Create HTML report with thumbnails |
| 🗑️ Clear All       | Remove all models from library     |

### Results Actions

| Button            | Function                        |
| ----------------- | ------------------------------- |
| 💾 Export Results | Save similarity comparison data |

## 🔧 Configuration Quick Reference

### Common Configurations

#### Change Lighting

```javascript
// In js/config.js or at runtime
Config.lighting.ambient.intensity = 0.8;
Config.lighting.directional.intensity = 1.0;
```

#### Adjust Camera

```javascript
Config.viewer.defaultCameraPosition = { x: 10, y: 10, z: 10 };
Config.viewer.cameraFov = 60;
```

#### Modify Similarity Weights

```javascript
Config.geometryAnalysis.similarityWeights = {
  vertexCount: 0.2,
  volume: 0.3,
  // ... other weights
};
```

#### Change Colors

```javascript
Config.colors.primary = "#667eea";
Config.colors.secondary = "#764ba2";
```

## 📊 Export Formats Reference

### Model Export

- **glTF** (.gltf) - JSON format with external resources
- **GLB** (.glb) - Binary format, single file
- **OBJ** (.obj) - Wavefront format, text-based
- **STL ASCII** (.stl) - Text-based STL
- **STL Binary** (.stl) - Binary STL (default)

### Data Export

- **JSON** (.json) - Analysis data, structured
- **CSV** (.csv) - Analysis data, spreadsheet
- **HTML** (.html) - Full report with images

## 🔍 Geometry Features Explained

| Feature      | Description          | Use Case           |
| ------------ | -------------------- | ------------------ |
| Vertex Count | Number of points     | Mesh complexity    |
| Face Count   | Number of triangles  | Rendering cost     |
| Volume       | 3D space occupied    | Size comparison    |
| Surface Area | Total surface        | Coating estimation |
| Compactness  | Sphere-likeness      | Shape roundness    |
| Aspect Ratio | Length-to-width      | Proportions        |
| Bounding Box | Enclosing dimensions | Shipping size      |

## 🎯 Similarity Algorithm

The similarity score (0-100%) is calculated using weighted comparison:

```
Similarity = Σ (weight_i × feature_similarity_i)

Default weights:
- vertexCount: 15%
- faceCount: 15%
- volume: 20%
- surfaceArea: 15%
- compactness: 15%
- aspectRatio: 20%
```

## 🐛 Troubleshooting Quick Fixes

### Model Won't Load

1. Check file format (glTF/GLB, OBJ, STL only)
2. Verify file isn't corrupted
3. Check browser console for errors
4. Try different file

### Viewer Shows Black Screen

1. Check WebGL support in browser
2. Update graphics drivers
3. Try disabling shadows
4. Refresh page

### Export Not Working

1. Check browser popup/download blocker
2. Try different export format
3. Verify model is loaded
4. Check browser console

### Performance Issues

1. Reduce model complexity (fewer vertices)
2. Disable shadows (💡 button)
3. Close other browser tabs
4. Try smaller models first

## 📱 Browser Requirements

### Minimum Requirements

- Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- WebGL 2.0 support
- ES6+ JavaScript
- 2GB RAM minimum
- Graphics acceleration enabled

### Recommended

- Latest browser version
- Dedicated GPU
- 8GB+ RAM
- High-resolution display

## 🎓 Learning Resources

### Three.js Documentation

- Official Docs: https://threejs.org/docs/
- Examples: https://threejs.org/examples/

### File Formats

- glTF Spec: https://www.khronos.org/gltf/
- OBJ Spec: http://paulbourke.net/dataformats/obj/
- STL Spec: https://en.wikipedia.org/wiki/STL_(file_format)

## 💡 Tips & Tricks

### Best Practices

1. **File Formats**: Use glTF/GLB for best compatibility
2. **Model Size**: Keep under 100MB for performance
3. **Complexity**: < 1M vertices for smooth interaction
4. **Organization**: Use descriptive model names
5. **Export**: Generate reports before clearing library

### Power User Features

1. **Batch Upload**: Select multiple files at once
2. **Advanced Controls**: Fine-tune lighting for screenshots
3. **Custom Config**: Edit config.js for persistent changes
4. **Export Workflow**: Screenshot → Export Data → Generate Report

### Performance Tips

1. Close unused tabs
2. Use glTF instead of OBJ when possible
3. Disable shadows for large models
4. Enable renderOnDemand in config for static scenes

## 🔗 Quick Links

- [Main README](README.md) - Overview and getting started
- [Developer Guide](DEVELOPER.md) - In-depth technical documentation
- [Changelog](CHANGELOG.md) - Version history
- [Usage Guide](USAGE.md) - Detailed instructions
- [Summary](SUMMARY.md) - Enhancement overview

## 📞 Getting Help

1. Check [DEVELOPER.md](DEVELOPER.md) troubleshooting section
2. Review browser console for errors
3. Verify configuration in [js/config.js](js/config.js)
4. Check Three.js documentation for viewer issues
5. Review code comments in relevant module

## 🎉 Common Workflows

### Workflow 1: Compare Similar Models

1. Upload first model
2. Upload additional models
3. Click on target model in library
4. Review similarity results
5. Export comparison data

### Workflow 2: Create Professional Report

1. Upload all models
2. Adjust lighting for best appearance
3. Take screenshots of key models
4. Generate HTML report
5. Export analysis data

### Workflow 3: Analyze Single Model

1. Upload model
2. Review geometry features
3. Toggle visualization modes
4. Adjust lighting
5. Export model and data

---

**Version**: 1.1.0  
**Last Updated**: 2025-12-13  
**For detailed information, see [DEVELOPER.md](DEVELOPER.md)**
