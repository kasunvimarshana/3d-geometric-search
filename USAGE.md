# Usage Guide - 3D Geometric Search

## Getting Started

### 1. Opening the Application

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge).

Alternatively, run a local server:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

### 2. Uploading Models

There are three ways to upload 3D models:

#### Option A: Drag and Drop
1. Drag a 3D model file from your file manager
2. Drop it onto the blue dashed upload area
3. The model will automatically load and display

#### Option B: File Chooser
1. Click the "Choose File" button
2. Browse and select your 3D model file
3. Click "Open" to load the model

#### Option C: Multiple Files
- You can upload multiple files at once
- All uploaded models are stored in your Model Library

### 3. Viewing Models

Once loaded, the model appears in the 3D viewer with these controls:

**Mouse Controls:**
- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or Ctrl+Left-click)
- **Zoom**: Scroll wheel or pinch gesture

**Buttons:**
- **🔄 Reset View**: Returns camera to default position
- **🔲 Wireframe**: Toggles wireframe rendering mode

**Model Information:**
The panel below the viewer shows:
- **Vertices**: Number of 3D points
- **Faces**: Number of triangular surfaces
- **Bounding Box**: Model dimensions (width × height × depth)

### 4. Managing the Model Library

All uploaded models appear in the **Model Library** section:

- **View a Model**: Click any model card to display it in the viewer
- **Delete a Model**: Hover over a model card and click the **×** button
- **Active Model**: The currently displayed model is highlighted with a purple border

### 5. Finding Similar Models

The similarity search happens automatically:

1. **Upload Multiple Models**: Add 2 or more models to your library
2. **Select a Model**: Click any model in the library to view it
3. **View Results**: The "Similar Models" section appears below, showing:
   - Models ranked by geometric similarity
   - Similarity scores (0-100%)
   - Higher scores = more similar shapes

**Similarity is based on:**
- Vertex count and face count
- Volume and surface area
- Shape compactness (sphere-likeness)
- Aspect ratio (proportions)

### 6. Understanding Similarity Scores

- **90-100%**: Nearly identical shapes
- **70-89%**: Very similar geometry
- **50-69%**: Moderately similar
- **30-49%**: Some similarities
- **0-29%**: Very different shapes

## Supported File Formats

### ✅ Fully Supported

#### glTF/GLB (.gltf, .glb)
- Industry standard for web 3D
- Supports materials, textures, and animations
- Recommended format for best results

#### OBJ (.obj)
- Simple text-based format
- Widely supported by 3D software
- Can be paired with .mtl files for materials

#### STL (.stl)
- Common in 3D printing
- Simple triangular mesh format
- Binary or ASCII versions

### 🚧 Planned Support

#### STEP (.step, .stp)
- Industry standard for CAD
- Requires OpenCascade.js parser
- Coming in future update

## Tips for Best Results

### Model Preparation
1. **Clean Geometry**: Remove duplicate vertices and non-manifold edges
2. **Reasonable Poly Count**: 1,000-100,000 faces work best
3. **Proper Scale**: Models should be reasonably sized
4. **Correct Orientation**: Ensure models are right-side up

### Performance
- **Large Files**: Files over 50MB may take time to load
- **Multiple Models**: Keep library under 50 models for best performance
- **Browser Memory**: Refresh the page if performance degrades

### Comparison
- **Similar Types**: Compare models of similar complexity
- **Test with Known Pairs**: Upload similar shapes to verify results
- **Build Library Gradually**: Add models one at a time to test

## Troubleshooting

### Model Won't Load
- **Check Format**: Ensure file extension matches content
- **File Size**: Very large files (>100MB) may fail
- **Corrupted File**: Try re-exporting from your 3D software
- **Browser Console**: Check for error messages (F12)

### Viewer is Black
- **WebGL Support**: Ensure your browser supports WebGL
- **Graphics Drivers**: Update your graphics card drivers
- **Hardware Acceleration**: Enable in browser settings

### Similarity Not Working
- **Upload More Models**: Need at least 2 models in library
- **Select a Model**: Click a model to activate similarity search
- **Different Geometries**: Very different shapes may show 0% similarity

### Performance Issues
- **Too Many Models**: Delete unused models from library
- **Large Files**: Use decimation to reduce poly count
- **Browser Refresh**: Reload the page to clear memory

## Advanced Features

### Wireframe Mode
Toggle wireframe view to see the underlying mesh structure:
1. Load a model
2. Click the 🔲 button
3. The model displays as green wireframe
4. Click again to return to solid view

### Multiple Uploads
Upload entire folders of models:
1. Select multiple files in the file chooser (Ctrl+Click or Cmd+Click)
2. Or drag multiple files onto the upload area
3. All models load sequentially

### Keyboard Shortcuts
While in the 3D viewer:
- **Scroll**: Zoom in/out
- **Arrow Keys**: Rotate view (when viewer is focused)

## Examples and Use Cases

### Quality Control
Compare manufactured parts against reference models to check for deviations.

### Part Search
Upload a component to find similar parts in your library.

### Design Exploration
Group similar design variations together.

### 3D Printing
Find printable alternatives to complex models.

### Asset Management
Organize large 3D model collections by similarity.

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| Opera   | 76+     | ✅ Fully Supported |

**Requirements:**
- WebGL 1.0 or higher
- ES6 JavaScript support
- Import maps support

## Privacy and Data

- **Local Processing**: All analysis happens in your browser
- **No Server**: Models are not uploaded to any server
- **Session Storage**: Models persist only in current browser session
- **No Tracking**: No analytics or tracking

## Getting Help

If you encounter issues:
1. Check the browser console (F12) for errors
2. Verify your file format is supported
3. Try with the sample models in `/samples/`
4. File an issue on GitHub with:
   - Browser version
   - File format and size
   - Error messages
   - Steps to reproduce

## Contributing

Want to improve the app? See [README.md](../README.md) for contribution guidelines.
