# 3D Geometric Search - Developer Documentation

## Overview

The 3D Geometric Search application is a web-based tool for uploading, analyzing, and comparing 3D models based on their geometric properties. Built with Three.js and vanilla JavaScript, it provides an intuitive interface for geometric similarity analysis.

## Architecture

### Core Modules

#### 1. **app.js** - Main Application Controller

The central orchestrator that manages all components and user interactions.

**Key Responsibilities:**

- Initializes all subsystems (viewer, loader, analyzer, exporter)
- Manages the model library and current state
- Handles user events and file uploads
- Coordinates between different modules

**Main Methods:**

- `init()` - Initializes the application
- `setupEventListeners()` - Binds UI events
- `loadFile(file)` - Loads and processes 3D model files
- `displayModel(modelName)` - Shows a model in the viewer
- `findSimilarModels(targetModelName)` - Finds geometrically similar models

#### 2. **viewer.js** - 3D Visualization Engine

Manages the Three.js scene, camera, lighting, and rendering.

**Features:**

- Configurable lighting (ambient, directional, hemisphere, spotlight)
- Shadow mapping support
- Wireframe mode toggle
- Grid and axes helpers
- Camera controls with orbit interaction
- Screenshot capability

**Main Methods:**

- `init()` - Sets up the Three.js scene
- `addLights()` - Configures lighting
- `loadModel(object)` - Displays a 3D model
- `resetView()` - Returns camera to default position
- `toggleWireframe()` - Switches between solid and wireframe rendering
- `setAmbientIntensity(intensity)` - Adjusts ambient lighting
- `takeScreenshot()` - Captures current view as image
- `zoomIn()` - Moves camera closer (20% each time)
- `zoomOut()` - Moves camera away (25% each time)
- `resetZoom()` - Returns to default zoom distance
- `getZoomLevel()` - Returns current zoom as percentage (0-100)
- `fitToView()` - Auto-frames model in viewport
- `setCameraView(view)` - Sets camera to preset position (front/back/left/right/top/bottom)
- `toggleAutoRotate()` - Enables/disables automatic rotation
- `setAutoRotateSpeed(speed)` - Adjusts rotation speed
- `scaleModel(scale)` - Dynamically scales current model (0.1x-3x)
- `focusOnModel()` - Centers camera on current model

#### 3. **modelLoader.js** - File Format Handler

Handles loading various 3D file formats.

**Supported Formats:**

- glTF/GLB (recommended for web)
- OBJ/MTL
- STL
- STEP/STP (planned)

**Main Methods:**

- `loadModel(file)` - Main loading function
- `loadGLTF(contents)` - Parses glTF files
- `loadGLB(arrayBuffer)` - Parses binary glTF
- `loadOBJ(contents)` - Parses OBJ files
- `loadSTL(arrayBuffer)` - Parses STL files
- `createThumbnail(object)` - Generates preview image

#### 4. **geometryAnalyzer.js** - Shape Analysis Engine

Extracts and compares geometric features from 3D models.

**Analyzed Features:**

- Vertex count
- Face count
- Bounding box dimensions
- Volume (approximation)
- Surface area
- Compactness (sphere-likeness)
- Aspect ratio
- Center of mass

**Similarity Algorithm:**
Uses weighted comparison of normalized geometric features:

```javascript
weights = {
  vertexCount: 0.15,
  faceCount: 0.15,
  volume: 0.2,
  surfaceArea: 0.15,
  compactness: 0.15,
  aspectRatio: 0.2,
};
```

**Main Methods:**

- `analyzeGeometry(geometry, name)` - Extracts all features
- `calculateSimilarity(features1, features2)` - Computes similarity score (0-100)
- `findSimilar(targetFeatures, library, limit)` - Finds top N similar models

#### 5. **exportManager.js** - Export Functionality

Handles exporting models and analysis data in various formats.

**Export Capabilities:**

- Models: glTF, GLB, OBJ, STL
- Analysis data: JSON, CSV
- Batch analysis export
- Similarity results export
- HTML reports with thumbnails
- Screenshots

**Main Methods:**

- `exportGLTF(object, filename, binary)` - Export as glTF/GLB
- `exportOBJ(object, filename)` - Export as OBJ
- `exportSTL(object, filename, binary)` - Export as STL
- `exportAnalysisData(features, filename, format)` - Export analysis
- `exportBatchAnalysis(modelLibrary, filename)` - Export all models' data
- `exportHTMLReport(modelLibrary, filename)` - Generate HTML report
- `captureScreenshot(renderer, filename, width, height)` - Save screenshot

#### 6. **config.js** - Configuration Management

Centralizes all application settings and constants.

**Configuration Categories:**

- Viewer settings (camera, background, grid)
- Lighting configuration
- Model loader settings
- Geometry analysis parameters
- UI preferences
- Export options
- Performance settings
- Debug options
- Color scheme

**Utility Functions:**

- `getConfig(path)` - Get config value by dot notation
- `setConfig(path, value)` - Update config value
- `validateConfig()` - Validate configuration on load

#### 7. **utils.js** - Utility Functions

Common helper functions used throughout the application.

**Categories:**

- **Validation:** File type/size validation
- **Formatting:** Numbers, file sizes, vectors
- **Performance:** Debounce, throttle
- **UI:** Toast notifications, element creation
- **Data:** Deep clone, JSON parsing
- **File Operations:** Download, clipboard
- **Math:** Clamp, lerp

## Data Flow

### Model Loading Flow

```
User uploads file
    ↓
validateFileType() checks format
    ↓
ModelLoader.loadModel() parses file
    ↓
GeometryAnalyzer.analyzeGeometry() extracts features
    ↓
ModelLoader.createThumbnail() generates preview
    ↓
Model added to library
    ↓
Viewer3D.loadModel() displays model
    ↓
findSimilarModels() compares with library
    ↓
UI updated with results
```

### Similarity Search Flow

```
User selects target model
    ↓
GeometryAnalyzer.findSimilar() called
    ↓
For each model in library:
    - calculateSimilarity() computes score
    ↓
Results sorted by similarity (descending)
    ↓
Top N results displayed
    ↓
User can export results
```

## UI Components

### Main Sections

1. **Header** - Title and description
2. **Upload Section** - File upload with drag-and-drop
3. **Viewer Section** - 3D visualization
   - Control buttons
   - Advanced settings panel
   - Model info display
4. **Library Section** - Model gallery
   - Model cards with thumbnails
   - Export and report buttons
5. **Results Section** - Similar models
   - Similarity scores
   - Export functionality
6. **Footer** - Credits and info

### Interactive Controls

#### Basic Controls

- **Reset View** (🔄) - Reset camera position
- **Auto-Rotate** (🔁) - Toggle automatic rotation
- **Wireframe** (🔲) - Toggle wireframe mode
- **Grid** (📐) - Toggle grid helper
- **Axes** (🎯) - Toggle axes helper
- **Shadows** (💡) - Toggle shadow rendering
- **Screenshot** (📷) - Capture current view
- **Settings** (⚙️) - Show/hide advanced controls

#### Zoom Controls

- **Zoom In** (🔍+) - Zoom camera closer (20% increment)
- **Zoom Out** (🔍-) - Zoom camera away (25% increment)
- **Fit View** (⛶) - Auto-frame model in viewport
- **Zoom Indicator** - Real-time zoom level display (0-100%)

#### Camera Presets

- **Front/Back** - Side views along Z-axis
- **Left/Right** - Side views along X-axis
- **Top/Bottom** - Views along Y-axis with proper up-vector

#### Advanced Controls

- **Ambient Light** - Slider (0.0-1.0) for overall brightness
- **Directional Light** - Slider (0.0-2.0) for main light
- **Background Color** - Color picker for viewport background
- **Model Scale** - Slider (0.1x-3.0x) to resize model
- **Rotation Speed** - Slider (0.5-5.0) for auto-rotation
- **Focus on Model** - Center and frame current model

## Configuration

### Viewer Configuration

```javascript
Config.viewer = {
  defaultCameraPosition: { x: 5, y: 5, z: 5 },
  cameraFov: 45,
  backgroundColor: 0x1a1a1a,
  enableShadows: true,
  minZoomDistance: 1,
  maxZoomDistance: 100,
  defaultZoomLevel: 50,
  zoomSpeed: 0.8,
  autoRotateSpeed: 2.0,
  modelScaleMin: 0.1,
  modelScaleMax: 3.0,
  modelScaleDefault: 1.0,
  // ... more settings
};
```

### Lighting Configuration

```javascript
Config.lighting = {
  ambient: { color: 0xffffff, intensity: 0.6 },
  directional: {
    color: 0xffffff,
    intensity: 0.8,
    position: { x: 5, y: 10, z: 5 },
  },
  // ... more lights
};
```

## API Reference

### App Class

```javascript
class App {
    constructor()
    init()
    setupEventListeners()
    handleFiles(files)
    loadFile(file): Promise
    displayModel(modelName)
    updateModelInfo(features)
    findSimilarModels(targetModelName)
    takeScreenshot()
    exportAllData()
    generateReport()
    clearLibrary()
}
```

### Viewer3D Class

```javascript
class Viewer3D {
    constructor(containerId)
    init()
    addLights()
    loadModel(object)
    centerAndScaleModel(object)
    resetView()
    toggleWireframe()
    toggleGrid()
    toggleAxes()
    toggleShadows()
    setAmbientIntensity(intensity)
    setDirectionalIntensity(intensity)
    setBackgroundColor(color)
    takeScreenshot(): string
    zoomIn()
    zoomOut()
    resetZoom()
    getZoomLevel(): number
    fitToView()
    setCameraView(view)
    toggleAutoRotate(): boolean
    setAutoRotateSpeed(speed)
    scaleModel(scale)
    focusOnModel()
    onWindowResize()
    animate()
    dispose()
}
```

    loadModel(object)
    resetView()
    toggleWireframe()
    toggleGrid()
    toggleAxes()
    toggleShadows()
    setAmbientIntensity(intensity)
    setDirectionalIntensity(intensity)
    setBackgroundColor(color)
    takeScreenshot(): string

}

````

### GeometryAnalyzer Class

```javascript
class GeometryAnalyzer {
    analyzeGeometry(geometry, name): Object
    calculateSimilarity(features1, features2): number
    findSimilar(targetFeatures, library, limit): Array
    getVertexCount(geometry): number
    getFaceCount(geometry): number
    approximateVolume(geometry): number
    approximateSurfaceArea(geometry): number
}
````

## Performance Considerations

### Optimization Strategies

1. **Model Decimation** - Reduce polygon count for large models
2. **Render on Demand** - Only render when scene changes
3. **Thumbnail Caching** - Reuse generated thumbnails
4. **Lazy Loading** - Load models progressively
5. **Web Workers** - Offload heavy computations (future)

### Performance Settings

```javascript
Config.performance = {
  maxVertices: 1000000,
  decimationThreshold: 500000,
  enableAutoDecimation: false,
  renderOnDemand: false,
};
```

## Error Handling

### File Loading Errors

- Invalid file format
- Corrupted file data
- Missing geometry data
- Unsupported features

### Runtime Errors

- WebGL context loss
- Out of memory
- Invalid model data
- Export failures

All errors are caught, logged, and displayed to users via toast notifications.

## Browser Compatibility

### Minimum Requirements

- Modern browser with WebGL 2.0 support
- ES6+ JavaScript support
- File API support
- Canvas API support

### Tested Browsers

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Future Enhancements

### Planned Features

1. **Advanced Analysis**

   - Curvature analysis
   - Symmetry detection
   - Feature recognition

2. **Collaboration**

   - Cloud storage integration
   - Model sharing
   - Team libraries

3. **Performance**

   - Web Workers for analysis
   - Progressive loading
   - GPU-accelerated computations

4. **Formats**

   - STEP/IGES support (via OpenCascade.js)
   - FBX support
   - 3DS support

5. **AI Integration**
   - Deep learning similarity
   - Automatic categorization
   - Smart recommendations

## Development Guidelines

### Code Style

- Use ES6+ features
- Modular architecture
- Clear function names
- Comprehensive comments
- JSDoc documentation

### File Organization

```
js/
├── app.js              # Main controller
├── viewer.js           # 3D visualization
├── modelLoader.js      # File parsing
├── geometryAnalyzer.js # Shape analysis
├── exportManager.js    # Export functionality
├── config.js           # Configuration
└── utils.js            # Utilities
```

### Adding New Features

1. Update config.js if needed
2. Create/modify relevant module
3. Update app.js integration
4. Add UI controls if needed
5. Update documentation
6. Test thoroughly

## Troubleshooting

### Common Issues

**Issue:** Models not loading

- Check file format support
- Verify file is not corrupted
- Check console for errors

**Issue:** Viewer shows black screen

- WebGL may not be supported
- Check browser compatibility
- Try disabling shadows

**Issue:** Performance is slow

- Reduce model complexity
- Disable shadows
- Lower render quality

**Issue:** Export not working

- Check browser download permissions
- Verify model data is valid
- Try different export format

## Support and Contributing

For issues, feature requests, or contributions, please refer to the main README.md file.

## License

MIT License - See LICENSE file for details.
