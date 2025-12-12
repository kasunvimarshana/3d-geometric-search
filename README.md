# 3D Geometric Search

An open-source JavaScript web application for 3D geometric search with interactive visualization, supporting industry-standard formats used in aerospace and engineering.

![3D Geometric Search](https://img.shields.io/badge/3D-Geometric%20Search-blue)
![Three.js](https://img.shields.io/badge/Three.js-r152-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### Core Functionality

- 🎯 **3D Geometric Search**: Upload models and find similar shapes based on geometric features
- 📦 **Multiple Format Support**: glTF/GLB, STEP (in development), OBJ/MTL, and STL
- 🎨 **Interactive 3D Visualization**: Powered by Three.js with orbit controls
- 🔍 **Shape Feature Extraction**: Analyzes vertex count, face count, volume, surface area, compactness, and aspect ratio
- 📊 **Similarity Ranking**: Advanced algorithm to find and rank similar models
- 💅 **Clean, Intuitive UI**: Modern design with drag-and-drop support
- 📱 **Responsive Design**: Works on desktop and mobile devices

### Advanced Controls

- � **Zoom Controls**: Zoom in/out with buttons, mouse wheel, or fit-to-view
- 📏 **Zoom Indicator**: Real-time zoom level display (0-100%)
- 📐 **Camera Presets**: Quick access to front, back, left, right, top, and bottom views
- 🔁 **Auto-Rotate**: Automatic model rotation for 360° viewing
- 🎯 **Focus Mode**: Quickly center and frame the current model (double-click)- 🖱️ **Model Interaction**: Click on 3D model components to select and highlight them
- ✨ **Hover Effects**: Visual feedback when hovering over model parts- 📏 **Model Scaling**: Adjust model size from 0.1x to 3x
- ⚙️ **Rotation Speed**: Control auto-rotation speed
- ⛶ **Fullscreen Mode**: Immersive fullscreen viewing experience
- ⌨️ **Keyboard Shortcuts**: Comprehensive hotkeys for all major functions
- 🔄 **Reset View**: Restore camera to default position (R key)
- ⟲ **Reset All**: Restore all settings to default state (Shift+R)
- 💡 **Lighting Adjustments**: Control ambient and directional light intensity
- 🔲 **Visual Modes**: Toggle wireframe, grid, axes, and shadows
- 📷 **Screenshot Capture**: Save high-quality views of your models
- ⚙️ **Advanced Settings**: Fine-tune viewer appearance and behavior
- 📊 **Batch Export**: Export analysis data for all models at once
- 📄 **HTML Reports**: Generate comprehensive analysis reports with thumbnails
- 🛡️ **Error Handling**: Robust error messages and user feedback

### Export Capabilities

- 💾 **Multiple Formats**: Export models as glTF/GLB, OBJ, or STL
- 📋 **Analysis Data**: Export geometric data as JSON or CSV
- 📊 **Similarity Results**: Save comparison results
- 🖼️ **Screenshots**: Capture and download viewer images

## Live Demo

Open `index.html` in a modern web browser to start using the application.

## Supported Formats

### ✅ Fully Supported

- **glTF/GLB**: GL Transmission Format - Industry standard for 3D models
- **OBJ/MTL**: Wavefront OBJ with material definitions
- **STL**: Stereolithography format - Common in 3D printing

### 🚧 In Development

- **STEP**: Standard for the Exchange of Product Data (requires OpenCascade.js integration)

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser!

### Installation

1. Clone the repository:

```bash
git clone https://github.com/kasunvimarshana/3d-geometric-search.git
cd 3d-geometric-search
```

2. Open `index.html` in your web browser:

```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or simply drag and drop `index.html` into your browser.

### Using a Local Server (Optional)

For better development experience, you can use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000

# Then open http://localhost:8000
```

## Usage

### Uploading Models

1. **Drag and Drop**: Drag 3D model files directly onto the upload area
2. **Click to Browse**: Click the upload area or "Choose File" button to select files
3. **Multiple Files**: Upload multiple models to build your library

### Viewing Models

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or Ctrl+Left-click)
- **Zoom**: Scroll wheel or pinch gesture
- **Reset View**: Click the 🔄 button
- **Wireframe**: Click the 🔲 button to toggle wireframe mode

### Finding Similar Models

1. Upload multiple 3D models to your library
2. Click on any model in the library to view it
3. The "Similar Models" section will automatically display models ranked by geometric similarity
4. Similarity scores range from 0% (completely different) to 100% (identical)

## How It Works

### Shape Feature Extraction

The application analyzes each 3D model and extracts the following features:

- **Vertex Count**: Total number of vertices in the mesh
- **Face Count**: Total number of triangular faces
- **Bounding Box**: Dimensions (width × height × depth)
- **Volume**: Approximate volume based on bounding box
- **Surface Area**: Calculated from triangular faces
- **Compactness**: Measure of sphere-likeness (isoperimetric ratio)
- **Aspect Ratio**: Ratio of largest to smallest dimension
- **Center of Mass**: Geometric center of the model

### Similarity Algorithm

The similarity algorithm compares models using a weighted scoring system:

- Vertex Count: 15%
- Face Count: 15%
- Volume: 20%
- Surface Area: 15%
- Compactness: 15%
- Aspect Ratio: 20%

Models are ranked by similarity score (0-100%), allowing you to find shapes with similar geometric properties.

## Architecture

```
3d-geometric-search/
├── index.html              # Main HTML structure
├── styles.css              # Application styling
├── js/
│   ├── app.js             # Main application controller
│   ├── viewer.js          # Three.js 3D viewer
│   ├── modelLoader.js     # Multi-format model loader
│   └── geometryAnalyzer.js # Shape feature extraction & similarity
└── samples/               # Sample 3D models (optional)
```

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Technologies Used

- **Three.js**: 3D graphics library
- **WebGL**: Hardware-accelerated 3D rendering
- **JavaScript ES6+**: Modern JavaScript features
- **HTML5 & CSS3**: Modern web standards

## Roadmap

- [x] Basic 3D viewer with orbit controls
- [x] Support for glTF/GLB format
- [x] Support for OBJ/MTL format
- [x] Support for STL format
- [x] Shape feature extraction
- [x] Similarity ranking algorithm
- [x] Model library management
- [x] Drag-and-drop upload
- [ ] STEP format support (requires OpenCascade.js)
- [ ] Advanced search filters
- [ ] Model comparison view
- [ ] Export similarity reports
- [ ] Server-side model storage
- [ ] Batch processing
- [ ] Machine learning-based similarity

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [3DFindit](https://www.3dfindit.com/en/3d-geometricsearch)
- Built with [Three.js](https://threejs.org/)
- Icons from Unicode emoji set

## Support

If you encounter any issues or have questions, please file an issue on GitHub.

## Author

Kasun Vimarshana

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [glTF Specification](https://www.khronos.org/gltf/)
- [OBJ Format Specification](https://en.wikipedia.org/wiki/Wavefront_.obj_file)
- [STL Format Specification](<https://en.wikipedia.org/wiki/STL_(file_format)>)
