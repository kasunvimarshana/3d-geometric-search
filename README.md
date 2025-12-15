# 3D Model Viewer - Aerospace & Engineering

A robust, web-based 3D visualization system designed for aerospace and engineering applications with support for industry-standard file formats.

## 🚀 Features

### Supported File Formats (OOTB)

- **glTF/GLB** - Modern, web-optimized format (preferred for web rendering)
- **OBJ/MTL** - Universal 3D format with material support
- **STL** - Standard for 3D printing and CAD
- **Note**: STEP format requires server-side conversion (see Advanced Setup)

### Visualization Capabilities

- **Real-time 3D Rendering** using Three.js
- **Multiple Render Modes**: Smooth shading, flat shading, wireframe, point cloud
- **Interactive Controls**: Orbit, pan, zoom with mouse/touch
- **Advanced Lighting**: Ambient, directional, hemisphere, and point lights
- **Shadow Mapping**: Real-time shadow rendering
- **Grid & Axes Helper**: Visual reference system

### User Features

- **Drag & Drop**: Easy file loading
- **Multi-file Support**: Load textures and materials together
- **Auto-center & Scale**: Automatic camera positioning
- **Screenshot Export**: Capture high-quality images
- **Fullscreen Mode**: Immersive viewing experience
- **Responsive Design**: Works on desktop and mobile

## 📦 Quick Start

### Option 1: Local Development Server (Recommended)

```powershell
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server -p 8000

# Using PHP (if installed)
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 2: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

## 🎯 Usage

### Loading Models

**Method 1: File Upload**

1. Click "Choose File" button
2. Select your 3D model file(s)
3. For OBJ models: Select both .obj and .mtl files, plus any texture images

**Method 2: Drag & Drop**

- Drag files directly onto the viewer canvas

**Method 3: Auto-load Default**

- The airplane model (`11803_Airplane_v1_l1.obj`) will load automatically if available

### Controls

**Mouse/Trackpad:**

- **Left-click + drag**: Rotate camera around model
- **Right-click + drag**: Pan camera
- **Scroll wheel**: Zoom in/out

**Touch (Mobile/Tablet):**

- **One finger**: Rotate
- **Two fingers**: Pan and zoom

**Keyboard:**

- Use the control panel for all features

### Render Modes

- **Smooth Shading**: Default, smooth surfaces
- **Flat Shading**: Faceted appearance
- **Wireframe**: See the mesh structure
- **Point Cloud**: View vertices only

### View Controls

- **Reset View**: Return to default camera position
- **Grid**: Toggle reference grid
- **Axes**: Toggle XYZ axes helper

### Lighting

- **Cycle Light**: Rotate through lighting presets
- **Shadows**: Toggle shadow rendering (performance impact)

## 🏗️ Architecture

### Technology Stack

- **Three.js** (r160): Core 3D rendering engine
- **Native JavaScript**: No build tools required
- **ES6 Modules**: Modern, modular code structure
- **CDN Delivery**: No local installation needed

### File Structure

```
├── index.html          # Main HTML interface
├── viewer.js           # Core viewer application
├── 11803_Airplane_v1_l1.obj    # Sample OBJ model
├── 11803_Airplane_v1_l1.mtl    # Material definitions
└── *.jpg               # Texture files
```

### Key Components

**Scene Setup**

- PerspectiveCamera with optimal FOV
- WebGL renderer with antialiasing
- Shadow mapping support
- Tone mapping for realistic rendering

**Lighting System**

- Ambient light for base illumination
- Directional light (sun) with shadows
- Hemisphere light for natural sky/ground lighting
- Point lights for accent and depth

**Model Loaders**

- OBJLoader + MTLLoader (with texture support)
- STLLoader (with auto-material)
- GLTFLoader (for modern formats)
- Automatic texture resolution

## 🔧 Advanced Features

### STEP File Support

STEP (ISO 10303) files require conversion due to their complexity:

**Option 1: Pre-convert STEP to GLTF**

```bash
# Using FreeCAD (Python)
freecad -c "import FreeCAD; import Mesh; Mesh.export([FreeCAD.ActiveDocument.ActiveObject], 'output.gltf')"

# Using CAD software
# Most CAD tools (SolidWorks, AutoCAD, etc.) can export to STEP → GLTF/OBJ
```

**Option 2: Server-side Conversion API**

```javascript
// Example: Upload STEP file to conversion service
async function convertSTEP(stepFile) {
  const formData = new FormData();
  formData.append("file", stepFile);

  const response = await fetch("/api/convert/step", {
    method: "POST",
    body: formData,
  });

  return await response.json(); // Returns GLTF/GLB
}
```

### Custom Material Override

```javascript
// In viewer.js, add custom material function
applyCustomMaterial(mesh) {
    mesh.material = new THREE.MeshStandardMaterial({
        color: 0x6495ed,
        metalness: 0.5,
        roughness: 0.3,
        envMapIntensity: 1.0
    });
}
```

### Performance Optimization

```javascript
// Enable frustum culling for large models
object.frustumCulled = true;

// Level of Detail (LOD)
const lod = new THREE.LOD();
lod.addLevel(highPolyMesh, 0);
lod.addLevel(mediumPolyMesh, 50);
lod.addLevel(lowPolyMesh, 100);
scene.add(lod);
```

## 🎨 Customization

### Changing Colors/Theme

```javascript
// Scene background
this.scene.background = new THREE.Color(0x1a1a2e);

// Grid colors
this.grid = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
```

### Adding Environment Maps

```javascript
// HDR environment (for realistic reflections)
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";

const rgbeLoader = new RGBELoader();
rgbeLoader.load("environment.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  this.scene.environment = texture;
});
```

## 🐛 Troubleshooting

### Models Not Loading

- **Check CORS**: Files must be served via HTTP (not file://)
- **Check Console**: Open DevTools (F12) for error messages
- **File Format**: Ensure file extensions are correct
- **Texture Paths**: MTL files should reference correct texture filenames

### Performance Issues

- Reduce shadow quality in `viewer.js`
- Disable shadows for complex models
- Use lower polygon count models
- Enable frustum culling

### Textures Not Appearing

- Upload all texture files together with OBJ/MTL
- Verify texture filenames in MTL file match actual files
- Check texture format (JPG, PNG supported)

## 📚 Additional Resources

### Three.js Documentation

- [Three.js Official Docs](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [Three.js Fundamentals](https://threejs.org/manual/)

### File Format Specifications

- [glTF 2.0 Specification](https://www.khronos.org/gltf/)
- [OBJ Format](https://en.wikipedia.org/wiki/Wavefront_.obj_file)
- [STL Format](<https://en.wikipedia.org/wiki/STL_(file_format)>)
- [STEP Standards](https://www.iso.org/standard/63141.html)

### Alternative Libraries

- **Babylon.js**: Similar to Three.js, more game-focused
- **A-Frame**: WebVR framework built on Three.js
- **React Three Fiber**: React wrapper for Three.js

## 🚦 Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 15+ ✅
- Edge 90+ ✅

Requires WebGL 2.0 support.

## 📝 License

This project uses open-source libraries:

- Three.js: MIT License
- Model assets: Respective owners

## 🤝 Contributing

Suggestions for improvement:

1. Add measurement tools
2. Implement annotations
3. Add cross-section views
4. Support for more CAD formats
5. Collaborative viewing features

## 📧 Support

For issues or questions:

- Check browser console for errors
- Verify file formats are supported
- Ensure proper HTTP server setup
- Review Three.js documentation for advanced features
