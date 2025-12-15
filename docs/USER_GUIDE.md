# User Guide

## Introduction

Welcome to the 3D Geometric Search application! This modern, reactive viewer supports industry-standard 3D formats and provides powerful tools for exploring and analyzing 3D models.

## Supported Formats

- **glTF/GLB** - Industry standard for web 3D graphics
- **STEP** (.step, .stp) - CAD format supporting AP203, AP214, AP242
- **OBJ/MTL** - Wavefront OBJ with material definitions
- **STL** - Standard Tessellation Language for 3D printing

## Getting Started

### Loading a Model

1. **Drag and Drop**: Drag a 3D file from your file explorer and drop it onto the application window
2. **Click to Browse**: Click the file loader area to open a file picker dialog
3. **Wait for Loading**: The application will parse and load your model

### Interface Overview

The application consists of several key areas:

- **Header**: Application title and description
- **Toolbar**: Quick access to common actions and view modes
- **Sidebar**: Hierarchical section tree for navigation
- **Viewer**: Main 3D viewport with interactive controls
- **Footer**: Status and information

## Navigation

### Camera Controls

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or Shift + left-click)
- **Zoom**: Scroll wheel or pinch gesture
- **Focus**: Double-click on a section to focus

### Keyboard Shortcuts

- `F` - Fit model to screen
- `R` - Reset camera view
- `Esc` - Clear selection
- `Delete` - Hide selected sections
- `Ctrl+A` - Select all sections

## Working with Sections

### Section Tree

The sidebar displays your model's hierarchical structure:

- **📁 Folder Icon**: Section with children
- **📄 File Icon**: Leaf section (no children)
- **Part Number**: Displayed next to section name (if available)

### Selection

**Single Selection**:

- Click a section in the tree or viewer

**Multi-Selection**:

- Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) while clicking
- Click multiple sections to add to selection

**Range Selection**:

- Hold `Shift` and click to select a range

### Highlighting

- **Hover**: Move your mouse over sections in the tree or viewer
- **Selected**: Selected sections appear in blue
- **Highlighted**: Hovered sections appear in yellow/orange

## Toolbar Features

### View Controls

**Reset Button** (🔄)

- Returns camera to default position
- Clears all transformations

**Clear Button** (❌)

- Clears all selections
- Resets selection state

**Show All Button** (👁)

- Makes all sections visible
- Exits isolation mode

### View Modes

Select from the dropdown:

- **Shaded**: Default solid shading with lighting
- **Wireframe**: Shows edge structure only
- **Transparent**: Semi-transparent view for seeing internal structure

### Display Options

**Grid Toggle** (📐)

- Shows/hides floor grid
- Helps with spatial orientation

**Axes Toggle** (⚡)

- Shows/hides coordinate axes
- X (red), Y (green), Z (blue)

## Advanced Features

### Section Isolation

To focus on specific sections:

1. Select the sections you want to isolate
2. Click "Isolate" (right-click menu or toolbar)
3. All other sections become hidden
4. Click "Show All" to exit isolation mode

### Visibility Management

**Hide Sections**:

- Select sections
- Press `Delete` or use context menu
- Sections become invisible but remain in the tree

**Show Hidden Sections**:

- Click the eye icon next to the section name
- Or use "Show All" to reveal everything

### Section Properties

Click on a section to view its properties:

- Name
- Part number
- Material
- Mass
- Volume
- Custom metadata

## Tips and Tricks

### Performance

- **Large Models**: Enable level-of-detail (LOD) in settings
- **Slow Loading**: Use streaming mode for very large files
- **Memory Issues**: Close unused models

### Workflow

- **Compare Designs**: Load multiple models in separate tabs
- **Save Views**: Bookmark specific camera positions
- **Export Images**: Take screenshots for documentation

### Navigation

- **Quick Focus**: Double-click sections to frame them
- **Orbit Around**: Set rotation center by clicking
- **Walk Through**: Use first-person mode for large assemblies

## Troubleshooting

### Model Won't Load

- Check file format is supported
- Verify file is not corrupted
- Ensure file size is under 100MB limit
- Try a different browser

### Poor Performance

- Reduce model complexity
- Enable wireframe mode
- Close other browser tabs
- Update graphics drivers

### Display Issues

- Check WebGL support in your browser
- Update your browser to latest version
- Try different view modes
- Disable browser extensions

### Selection Not Working

- Ensure section is selectable (not locked)
- Check if section is hidden
- Try clicking in viewer instead of tree
- Clear selection and try again

## Keyboard Reference

| Key    | Action            |
| ------ | ----------------- |
| F      | Fit to screen     |
| R      | Reset view        |
| Esc    | Clear selection   |
| Delete | Hide selected     |
| Ctrl+A | Select all        |
| Ctrl+Z | Undo              |
| Ctrl+Y | Redo              |
| Space  | Toggle play/pause |
| 1      | Front view        |
| 2      | Right view        |
| 3      | Top view          |
| 7      | Isometric view    |

## FAQ

**Q: What's the maximum file size?**
A: The application supports files up to 100MB. Larger files may require streaming mode.

**Q: Can I edit the model?**
A: This is a viewer application. Editing features are not currently supported.

**Q: How do I export my view?**
A: Use the screenshot tool in the toolbar or your browser's built-in screenshot feature.

**Q: Can I share my model with others?**
A: Generate a share link from the File menu. Recipients will need access to view.

**Q: Is my data secure?**
A: All processing happens in your browser. Files are not uploaded to any server.

**Q: Which browsers are supported?**
A: Modern browsers with WebGL support: Chrome, Firefox, Safari, Edge.

## Support

For additional help:

- Check the [Development Guide](./DEVELOPMENT.md)
- Review [Architecture Documentation](./ARCHITECTURE.md)
- Report issues on GitHub
- Contact support team

## Updates

Stay informed about new features:

- Check release notes
- Subscribe to update notifications
- Follow project on GitHub
- Join community discussions
