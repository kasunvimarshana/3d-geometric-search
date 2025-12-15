# User Guide

## Getting Started

### Installation

1. Clone or download the project
2. Open terminal in project directory
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server
5. Open browser to `http://localhost:3000`

## Interface Overview

### Header

- **Geometric Search** - Application title
- **Upload Button** - Load 3D models
- **Fullscreen Button** - Toggle fullscreen mode

### Sidebar (Left)

#### Model Structure Panel

- Displays hierarchical tree of model parts
- Click nodes to select parts
- Hover nodes to preview highlight
- Expand/collapse with arrow icons
- **Expand All** button expands entire tree

#### Properties Panel

- Shows detailed information about selected part
- Displays:
  - Name, Type, ID
  - Hierarchical path
  - Geometry properties
  - Material information
  - Custom metadata

### Viewport (Center)

- 3D rendering area
- Interactive camera controls
- Click objects to select
- Drag to orbit
- Scroll to zoom
- Right-click to pan

#### Viewport Toolbar

- **Reset View** - Return camera to default position
- **Fit to Screen** - Frame entire model in view
- **Isolate** - Show only selected parts
- **Show All** - Restore visibility of all parts
- **Disassemble** - Create exploded view
- **Assemble** - Return to assembled state

## Basic Operations

### Loading a Model

#### Method 1: Upload Button

1. Click "Upload" button in header
2. Select a 3D file from your computer
3. Wait for loading to complete

#### Method 2: Drag and Drop

1. Drag a 3D file from your file explorer
2. Drop it onto the viewport
3. Model loads automatically

**Supported Formats:**

- `.gltf` - glTF JSON format
- `.glb` - glTF binary format
- `.obj` - Wavefront OBJ
- `.stl` - Stereolithography
- `.step`, `.stp` - STEP CAD format

### Navigating the Model

#### Camera Controls

- **Orbit**: Left-click and drag
- **Pan**: Right-click and drag (or Shift + left-click)
- **Zoom**: Mouse wheel or pinch gesture

#### Resetting View

- Click "Reset View" to return to default position
- Click "Fit to Screen" to frame entire model

### Selecting Parts

#### In Tree View

- Click on any node in the tree
- Node highlights in blue
- Properties panel updates
- Part highlights in 3D view

#### In 3D View

- Click on any part in the viewport
- Corresponding tree node highlights
- Properties panel updates

#### Clearing Selection

- Click on empty space in viewport
- Or select a different part

### Working with Sections

#### Isolating Parts

1. Select one or more parts
2. Click "Isolate" button
3. All other parts become hidden
4. Focus on specific components

#### Showing All Parts

- Click "Show All" to restore all parts
- Cancels isolation mode

#### Expanding Tree

- Click arrow icons to expand/collapse nodes
- Click "Expand All" to expand entire tree
- Useful for exploring deep hierarchies

### Model Operations

#### Disassembly (Exploded View)

1. Click "Disassemble" button
2. Parts move away from center
3. Reveals internal structure
4. Maintains hierarchy

#### Assembly

1. Click "Assemble" button
2. Parts return to original positions
3. Restores normal view

### Fullscreen Mode

1. Click fullscreen button in header
2. Viewport expands to full screen
3. Click again to exit fullscreen

## Advanced Features

### Hover Preview

- Hover over tree nodes
- Part highlights in yellow in 3D view
- Helps locate parts without selecting

### Properties Inspection

- Select any part to view properties
- See vertex count, material info
- View hierarchical path
- Inspect custom metadata

### Multi-Level Hierarchy

- Navigate through assemblies and sub-assemblies
- Expand nodes to see children
- Click on any level to select
- Properties show full path

## Tips and Tricks

### Performance

- Use "Isolate" to focus on specific areas
- Large models may take time to load
- Close other browser tabs for better performance

### Navigation

- Use mouse wheel zoom for precision
- Right-click pan to reposition view
- "Fit to Screen" works great after isolating parts

### Organization

- Expand tree to see full structure
- Use hierarchy to understand model organization
- Properties panel shows parent-child relationships

### File Formats

- glTF/GLB: Best for web, includes materials
- OBJ: Common format, good compatibility
- STL: Simple geometry, 3D printing
- STEP: CAD data, engineering models

## Keyboard Shortcuts

Currently, the application uses mouse-based controls. Keyboard shortcuts may be added in future versions.

## Troubleshooting

### Model Won't Load

- Check file format is supported
- Ensure file is not corrupted
- Check browser console for errors
- Try a different file

### Performance Issues

- Close other applications
- Try smaller model files
- Update graphics drivers
- Use recent browser version

### Display Problems

- Refresh the page (F5)
- Clear browser cache
- Check browser console for errors
- Ensure WebGL is enabled

### Selection Not Working

- Click directly on geometry
- Ensure part is visible (not isolated)
- Try clicking on different parts

## Browser Compatibility

### Recommended Browsers

- Google Chrome 90+
- Mozilla Firefox 88+
- Microsoft Edge 90+
- Safari 14+

### Requirements

- WebGL support (enabled by default)
- JavaScript enabled
- Modern browser (released in last 2 years)

## Getting Help

### Resources

- Check README.md for installation help
- Review ARCHITECTURE.md for technical details
- See API.md for developer documentation

### Common Issues

1. **Black screen**: WebGL not supported or disabled
2. **Slow performance**: Model too complex or low-end hardware
3. **File not loading**: Unsupported format or corrupted file

## Best Practices

### File Preparation

- Optimize models before uploading
- Use appropriate format for use case
- Include materials for best visual quality

### Navigation

- Start with "Fit to Screen"
- Use isolation for detailed inspection
- Expand tree gradually

### Performance

- Load one model at a time
- Close properties panel if not needed
- Use smaller file sizes when possible

## Future Features

The following features are planned for future releases:

- Measurement tools
- Annotation system
- Export capabilities
- Keyboard shortcuts
- Section plane cutting
- Cloud storage integration
- Collaborative viewing
- Animation playback (for glTF files)

## Feedback

This application is continuously being improved. Your feedback is valuable for making it better!
