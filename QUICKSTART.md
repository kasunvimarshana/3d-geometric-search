# Quick Start Guide

Welcome to the 3D Model Viewer! This guide will get you up and running in minutes.

## Installation (One-Time Setup)

```bash
# Navigate to project directory
cd c:\repo\be\KV

# Install dependencies (already done!)
npm install
```

## Starting the Application

```bash
# Start development server
npm run dev
```

The application will be available at: **http://localhost:3000**

## First Steps

### 1. Upload a Model

- **Method 1**: Drag and drop a 3D file onto the upload overlay
- **Method 2**: Click "Open Model" button in the header
- **Method 3**: Click anywhere on the upload overlay

### 2. Supported File Formats

- ✅ `.gltf`, `.glb` - glTF 2.0 (recommended)
- ✅ `.obj` (with optional `.mtl`) - Wavefront OBJ
- ✅ `.stl` - Stereolithography
- 🔜 `.step`, `.stp` - STEP CAD format (coming soon)

### 3. Navigate the 3D View

**Mouse Controls:**

- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag (or middle-click)
- **Zoom**: Scroll wheel

**Touch Controls (Mobile):**

- **Rotate**: One finger drag
- **Pan**: Two finger drag
- **Zoom**: Pinch

### 4. Interact with Model

**Sections:**

- **Click** a section to select it
- **Double-click** to focus camera on it
- **Hover** over sections to highlight them

**Hierarchy Tree (Left Panel):**

- Click section names to select
- Double-click to focus camera
- Use arrows to expand/collapse

**Properties (Right Panel):**

- View selected section details
- See geometry information
- View material properties

### 5. View Controls

**Header Buttons:**

- 🔄 **Reset**: Return to default view
- 📐 **Fit**: Center model in viewport
- 🌐 **Wireframe**: Toggle wireframe mode
- # **Grid**: Show/hide ground grid
- ⚡ **Fullscreen**: Toggle fullscreen mode

**Keyboard Shortcuts:**

- `F` - Fit model to view
- `R` - Reset camera
- `W` - Toggle wireframe
- `G` - Toggle grid
- `A` - Toggle axes
- `ESC` - Deselect all

## Application Layout

```
┌─────────────────────────────────────────────────┐
│  Header (Logo, Upload, View Controls)          │
├──────────┬──────────────────────┬───────────────┤
│          │                      │               │
│ Hierarchy│    3D Viewport       │  Properties   │
│   Tree   │                      │     Panel     │
│          │                      │               │
│  (Left)  │     (Center)         │   (Right)     │
│          │                      │               │
└──────────┴──────────────────────┴───────────────┘
```

## Sample Models

### Where to Find Test Models

1. **glTF Sample Models**
   - [https://github.com/KhronosGroup/glTF-Sample-Models](https://github.com/KhronosGroup/glTF-Sample-Models)
   - Download: Duck, Box, Avocado, etc.

2. **Free 3D Model Sites**
   - [Sketchfab](https://sketchfab.com) - Many free glTF models
   - [Poly Pizza](https://poly.pizza) - CC0 models
   - [Thingiverse](https://thingiverse.com) - STL files

3. **CAD Models**
   - [GrabCAD](https://grabcad.com) - Engineering models
   - [3DContentCentral](https://3dcontentcentral.com) - Industrial parts

### Recommended First Models

Start with these simple models:

1. **Box** - Test basic geometry
2. **Duck** - Test textures and materials
3. **Avocado** - Test complex geometry

## Common Tasks

### Loading Your First Model

1. Start the dev server: `npm run dev`
2. Open [http://localhost:3000](http://localhost:3000)
3. Download a sample glTF model (e.g., Duck.gltf)
4. Drag the file onto the viewport
5. Watch it load and render!

### Exploring the Model

1. **Rotate**: Left-click and drag to see all angles
2. **Zoom**: Scroll to get closer or further
3. **Pan**: Right-click and drag to move around
4. **Reset**: Click the Reset button if you get lost

### Selecting Parts

1. Click any part of the model to select it
2. The hierarchy tree highlights the selected section
3. The properties panel shows section details
4. Double-click to zoom the camera to that part

### Viewing Statistics

Look at the top-right corner to see:

- Vertex count
- Face count
- Object count
- Load time

## Troubleshooting

### Model Won't Load

- **Check format**: Is it a supported format?
- **Check size**: Very large files may take time
- **Check console**: Open browser DevTools (F12) for errors
- **Try another file**: Test with a known-good model

### Performance Issues

- **Reduce complexity**: Try a simpler model first
- **Close other tabs**: Free up browser resources
- **Check specs**: Ensure WebGL is supported
- **Update browser**: Use latest version

### UI Not Responding

- **Refresh page**: Press F5
- **Clear cache**: Ctrl+Shift+Delete
- **Check console**: Look for JavaScript errors
- **Restart dev server**: Stop and run `npm run dev` again

## Next Steps

### Learn More

- Read [Architecture Docs](docs/ARCHITECTURE.md) to understand the design
- Read [Development Guide](docs/DEVELOPMENT.md) to contribute
- Read [API Reference](docs/API.md) for detailed API docs

### Customize

- Modify colors in [main.css](src/styles/main.css)
- Add new features following the architecture
- Extend loader support for new formats

### Deploy

- Build for production: `npm run build`
- See [Deployment Guide](docs/DEPLOYMENT.md) for hosting options

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format
```

## Getting Help

### Resources

- 📖 [Full Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

### Debug Tools

**In Browser Console:**

```javascript
// Access application instance
window.app;

// View current state
window.app.store.getState();

// View event log
window.app.eventOrchestrator.getEventLog();

// Get renderer info
window.app.renderer.renderer.info;
```

## Tips for Best Experience

1. **Use Chrome or Firefox** for best performance
2. **Start with small models** to learn the interface
3. **Use keyboard shortcuts** for faster navigation
4. **Enable hardware acceleration** in browser settings
5. **Close unused tabs** to free up GPU resources

---

## You're Ready!

🎉 The application is running at [http://localhost:3000](http://localhost:3000)

Try loading your first model and explore the features!

---

**Need help?** Check the [full documentation](docs/) or open an issue on GitHub.
