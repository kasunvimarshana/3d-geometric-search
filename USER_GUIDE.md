# User Guide

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Features

### Loading 3D Models

1. Click the "📁 Load Model" button in the toolbar
2. Select a supported file format:
   - glTF/GLB (`.gltf`, `.glb`)
   - OBJ (`.obj`)
   - STL (`.stl`)
   - STEP (`.step`, `.stp`) - partial support

The model will be loaded and displayed in the 3D viewer.

### Navigation

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or Shift + Left-click)
- **Zoom**: Mouse wheel

### Section Tree

The left sidebar shows the hierarchical structure of the loaded model:

- Click a section to select it
- Double-click to focus the camera on it
- Hover to highlight it in the 3D view

### Toolbar Actions

- **📁 Load Model**: Open file dialog
- **🎯 Fit to Screen**: Adjust camera to fit entire model
- **🔄 Reset Camera**: Return camera to default position
- **🔧 Disassemble**: Spread sections apart for better visibility
- **🔨 Reassemble**: Return sections to original positions
- **⛶ Fullscreen**: Toggle fullscreen mode
- **🗑️ Clear**: Remove current model
- **☰**: Toggle sidebar visibility
- **ℹ️**: Toggle properties panel visibility

### Properties Panel

The right panel shows details about the selected section:

- Name, type, and ID
- Visibility status
- Number of children
- Custom properties
- Transform information (position, rotation, scale)

### Selection

- **Single Selection**: Click on a section in the tree or 3D view
- **Visual Feedback**: Selected sections are highlighted in blue
- **Properties**: Selected section properties appear in the right panel

### Highlighting

- **Hover**: Sections are highlighted in orange when hovering
- **Focus**: Double-click to focus camera on a section
- **Isolation**: Right-click and select "Isolate" to hide all other sections

## Keyboard Shortcuts

- `F`: Fit to screen
- `R`: Reset camera
- `Esc`: Deselect / Exit fullscreen

## Supported Formats

### glTF/GLB ✓
Full support for glTF 2.0 format including:
- Meshes, materials, textures
- Hierarchical scene structure
- Animations (display only)

### OBJ/MTL ✓
Wavefront OBJ format with optional MTL materials:
- Geometry and materials
- Multiple objects
- Texture coordinates

### STL ✓
Stereolithography format:
- ASCII and binary formats
- Single solid per file
- Automatic normal computation

### STEP ⚠️
STEP CAD format (partial support):
- Basic file parsing
- Header information extraction
- *Note*: Full STEP support requires OpenCascade.js integration

## Tips and Best Practices

### Performance

- Large models (>10MB) may take time to load
- Complex assemblies with many parts may affect frame rate
- Consider simplifying models before loading

### File Preparation

- Ensure proper coordinate systems and units
- Validate files in external tools before loading
- For OBJ files, keep MTL files in the same directory

### Navigation

- Use "Fit to Screen" after loading to see entire model
- Use disassembly mode to explore complex assemblies
- Double-click sections for quick focus

### Organization

- Proper naming in source CAD software helps navigation
- Hierarchical structures are preserved from source files
- Group related components in assemblies

## Troubleshooting

### Model Not Loading

- Check file format is supported
- Verify file is not corrupted
- Check browser console for errors
- Ensure file size is reasonable (<100MB recommended)

### Poor Performance

- Reduce model complexity
- Close other browser tabs
- Disable shadows in complex scenes
- Use Chrome or Edge for best WebGL performance

### Display Issues

- Update graphics drivers
- Try different browsers
- Check WebGL support: `chrome://gpu`
- Reduce anti-aliasing settings

### Missing Materials

- For OBJ files, ensure MTL file is available
- Check texture paths are correct
- Verify material references in source file

## Browser Support

- Chrome 90+ ✓
- Edge 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓

WebGL 2.0 required.

## Known Limitations

- STEP format requires additional library integration
- Very large files (>100MB) may cause memory issues
- Complex materials may not render exactly as in source
- Animations are detected but not yet playable

## Getting Help

If you encounter issues:

1. Check browser console for errors
2. Verify file format and integrity
3. Try with a simpler test model
4. Check ARCHITECTURE.md for technical details
