# Feature Guide - 3D Geometric Search v2.0

## Table of Contents

1. [Overview](#overview)
2. [Basic Operations](#basic-operations)
3. [Advanced Features](#advanced-features)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Export Functionality](#export-functionality)
6. [Tips & Best Practices](#tips--best-practices)

## Overview

3D Geometric Search v2.0 is a comprehensive 3D model viewer with advanced navigation, section management, and export capabilities. This guide covers all features and best practices.

## Basic Operations

### Loading Models

#### From Repository

1. Select a model from the dropdown menu
2. Click "Load Model" button
3. Wait for the model to load

#### From URL

1. Enter a valid model URL in the "Model URL" input
2. Supported: GLTF, GLB, OBJ, FBX, STL
3. Click "Load URL" button
4. Model will be fetched and loaded

#### From Local File

1. Click "Choose File" button
2. Select a supported file (.gltf, .glb, .obj, .stl, .fbx, .step, .stp)
3. Click "Load File" button
4. For STEP files, automatic conversion will be attempted

### Navigation

#### Mouse Controls

- **Left Click + Drag**: Orbit around model
- **Right Click + Drag**: Pan (move) camera
- **Scroll Wheel**: Zoom in/out

#### Zoom Control

- Use the zoom slider to adjust zoom level (1-200%)
- Current zoom percentage displayed next to slider

### Section Management

#### Viewing Sections

- Sections are automatically detected and displayed hierarchically
- Expand/collapse sections with the ▼/▶ buttons
- Section count shown at bottom of list

#### Highlighting Sections

1. Click the 👁 (eye) icon next to a section
2. Section will be highlighted with a distinct color
3. Click again to remove highlight

#### Isolating Sections

1. Click the 🔍 (magnifying glass) icon next to a section
2. All other sections will be hidden
3. Click again to restore all sections

#### Searching Sections

1. Type in the "Search Sections" input field
2. Results filtered in real-time
3. Clear search to show all sections

## Advanced Features

### Camera Presets

Quick access to standard viewing angles:

- **Front**: Click "Front" button or press **1**
- **Top**: Click "Top" button or press **5**
- **Right**: Click "Right" button or press **4**
- **Isometric**: Click "Isometric" button or press **7**

Additional views via keyboard:

- **Back**: Press **2**
- **Left**: Press **3**
- **Bottom**: Press **6**

### Focus Mode

Isolate and focus on specific objects:

1. **Enter Focus Mode**:
   - Isolate a section (hides all others)
   - Camera automatically frames the object

2. **Exit Focus Mode**:
   - Press **Esc** key
   - Camera returns to previous position
   - All sections become visible again

### Visual Display Options

#### Wireframe Mode

- **Toggle**: Click the "Wireframe Mode" checkbox or press **W**
- **Effect**: Shows model geometry edges
- **Use Case**: Analyzing mesh topology

#### Grid Helper

- **Toggle**: Click the "Show Grid" checkbox
- **Purpose**: Reference plane for spatial understanding
- **Default**: Enabled

#### Axes Helper

- **Toggle**: Click the "Show Axes" checkbox
- **Purpose**: Shows X (red), Y (green), Z (blue) axes
- **Default**: Enabled

### View Controls

#### Reset View

- **Button**: Click "Reset View"
- **Keyboard**: Press **R**
- **Effect**: Returns camera to default position, clears isolation, resets zoom

#### Frame Model

- **Button**: Click "Frame Model"
- **Keyboard**: Press **F**
- **Effect**: Adjusts camera to fit entire model in view

#### Refresh

- **Button**: Click "Refresh"
- **Keyboard**: Press **F5**
- **Effect**: Clears current model, reloads from scratch

#### Fullscreen

- **Button**: Click "Fullscreen"
- **Keyboard**: Press **F11**
- **Effect**: Expands viewer to fill entire screen
- **Exit**: Press **F11** again or **Esc**

## Keyboard Shortcuts

### View Controls

| Key     | Action      | Description                        |
| ------- | ----------- | ---------------------------------- |
| **R**   | Reset View  | Return camera to default position  |
| **F**   | Frame Model | Fit model to screen                |
| **W**   | Wireframe   | Toggle wireframe mode              |
| **H**   | Help        | Show/hide keyboard shortcuts guide |
| **F11** | Fullscreen  | Toggle fullscreen mode             |
| **F5**  | Refresh     | Reload current model               |

### Camera Presets

| Key   | View      | Description              |
| ----- | --------- | ------------------------ |
| **1** | Front     | Front view of model      |
| **2** | Back      | Back view of model       |
| **3** | Left      | Left side view           |
| **4** | Right     | Right side view          |
| **5** | Top       | Top-down view            |
| **6** | Bottom    | Bottom-up view           |
| **7** | Isometric | 3D isometric perspective |

### Navigation

| Key     | Action       | Description                           |
| ------- | ------------ | ------------------------------------- |
| **Esc** | Exit Focus   | Exit focus mode, restore all sections |
| **/**   | Focus Search | Jump to section search box            |

### Advanced

| Key        | Action | Description        |
| ---------- | ------ | ------------------ |
| **Ctrl+E** | Export | Open export dialog |

## Export Functionality

### Supported Formats

1. **GLB (Binary glTF)** - Recommended
   - Single binary file
   - Embeds all textures and data
   - Smallest file size
   - Best for sharing

2. **GLTF (JSON glTF)**
   - Human-readable JSON
   - Separate texture files
   - Best for editing

3. **OBJ (Wavefront)**
   - Universal 3D format
   - Compatible with most 3D software
   - Text-based geometry only

4. **STL (Stereolithography)**
   - 3D printing standard
   - Geometry only (no materials)
   - Binary format

### Export Steps

1. **Load a Model**: Ensure a model is loaded
2. **Select Format**: Choose format from "Export Model" dropdown
3. **Export**: Click "Export" button or press **Ctrl+E**
4. **Save**: File automatically downloads to your computer
5. **Filename**: Uses original model name with new extension

### Export Limitations

- **STEP files**: Cannot be exported (complex CAD format)
- **Materials**: May vary by format (STL has none, OBJ basic, GLTF full)
- **Animations**: Only preserved in GLTF/GLB
- **Textures**: Embedded in GLB, separate in GLTF, lost in OBJ/STL

## Tips & Best Practices

### Performance

1. **Large Models**: Use wireframe mode for better performance
2. **Loading**: Wait for full load before interacting
3. **Sections**: Collapse unused section hierarchies
4. **Export**: GLB format is fastest and most efficient

### Workflow

1. **Exploration**: Start with Frame Model (F) to see entire object
2. **Analysis**: Use camera presets (1-7) for different perspectives
3. **Detail Work**: Isolate specific sections for focused examination
4. **Documentation**: Export to GLTF for archival with full fidelity

### Troubleshooting

#### Model Won't Load

- Check file format is supported
- Verify URL is accessible (no CORS issues)
- For STEP files, conversion may fail (see console)

#### Poor Performance

- Enable wireframe mode
- Hide grid/axes helpers
- Close unused browser tabs
- Try a smaller model

#### Sections Not Showing

- Some models may not have named components
- Check if model is a single mesh
- Try different model formats

#### Export Failed

- Ensure model is fully loaded
- Select a valid export format
- Check browser console for errors
- Try different export format

### Keyboard Shortcut Conflicts

If shortcuts don't work:

1. Click outside input fields
2. Close help overlay
3. Ensure focus is on viewer
4. Press **H** to see all shortcuts

### Browser Compatibility

- **Chrome**: Full support, recommended
- **Firefox**: Full support
- **Safari**: Full support (backdrop blur may vary)
- **Edge**: Full support

### Recommended Settings

For best experience:

- ✅ Grid Helper: ON (spatial reference)
- ✅ Axes Helper: ON (orientation reference)
- ❌ Wireframe: OFF (unless analyzing mesh)
- ✅ Fullscreen: Use for detailed work

## Advanced Tips

### Multi-Model Workflow

1. Load first model → Export as GLB
2. Load second model → Export as GLB
3. Use external 3D software to combine
4. Re-import combined model for review

### Section Organization

1. Use search to find specific parts
2. Highlight related sections together
3. Isolate complex assemblies
4. Export isolated sections separately

### Camera Work

1. **Presentation View**: Use Isometric (7)
2. **Technical View**: Use Front/Top/Right (1/5/4)
3. **Custom Angle**: Position manually, then reset (R) returns to it
4. **Quick Switch**: Number keys for rapid view changes

### Export Strategy

- **Archival**: GLTF (preserves everything)
- **Sharing**: GLB (single file, easy)
- **3D Printing**: STL (standard format)
- **Editing**: OBJ (universal compatibility)

## Support & Documentation

- **Full Documentation**: See `docs/` folder
- **Architecture**: `ARCHITECTURE.md`
- **Multi-Format Guide**: `docs/MULTI_FORMAT_SUPPORT.md`
- **STEP Conversion**: `docs/STEP_FORMAT_GUIDE.md`
- **External Models**: `docs/EXTERNAL_MODELS.md`

## Version Information

**Current Version**: 2.0.0  
**Release Date**: December 14, 2025  
**Major Features**: Keyboard shortcuts, model export, camera presets, focus mode

---

For technical support or feature requests, please refer to the repository documentation.
