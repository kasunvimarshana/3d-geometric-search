# 3D Geometric Search

A professional, clean, and well-architected 3D model viewer with comprehensive multi-format support, advanced section management, navigation controls, keyboard shortcuts, model export capabilities, and **robust centralized event handling**.

## ✨ Key Features

### 🎯 Multi-Format Support

- **GLTF/GLB** (preferred): Web-optimized, modern standard
- **OBJ/MTL**: Universal 3D format with material support
- **STL**: 3D printing and CAD standard
- **FBX**: Autodesk interchange format with animation
- **STEP/STP**: CAD/engineering format with automatic conversion

### 🔧 Core Functionality

- **Dynamic Model Loading**: URLs and local file upload
- **Section Management**: Automatic detection and hierarchical organization
- **Section Isolation**: Focus on specific sections by hiding others
- **Section Highlighting**: Visual highlighting of selected sections
- **Section Search**: Real-time filtering of sections by name
- **Interactive Navigation**: Orbit, pan, and zoom controls
- **Camera Presets**: Quick views (Front, Top, Right, Isometric)
- **Focus Mode**: Isolated viewing of specific objects
- **Wireframe Toggle**: Switch between solid and wireframe rendering
- **Grid/Axes Helpers**: Visual reference aids
- **Model Export**: Save models as GLTF, GLB, OBJ, or STL
- **Keyboard Shortcuts**: Comprehensive keyboard control
- **Fullscreen Mode**: Distraction-free viewing experience
- **Format Conversion**: Intelligent STEP-to-GLTF conversion
- **Loading Progress**: Real-time loading indicators
- **Clean UI**: Minimal, professional interface focused on usability
- **Responsive Design**: Adapts to different screen sizes
- **🆕 Centralized Event System**: Robust event coordination and validation

### ⌨️ Keyboard Shortcuts

- **R**: Reset camera view
- **F**: Frame model in view
- **W**: Toggle wireframe mode
- **H**: Toggle help overlay
- **1-7**: Camera preset views (Front, Top, Right, Isometric, etc.)
- **Esc**: Exit focus mode
- **F11**: Toggle fullscreen
- **Ctrl+E**: Export model
- **/**: Focus search box
- **F5**: Refresh view

### 🏗️ Architecture Excellence

- **SOLID Principles**: Single Responsibility, Open/Closed, Dependency Inversion
- **Clean Code**: DRY, separation of concerns, maintainability
- **Design Patterns**: MVC, Observer, Repository, Facade, Service Layer
- **Modular**: Testable, reusable, extensible components
- **Production Ready**: Error handling, caching, performance optimized
- **🆕 Event-Driven**: Centralized ModelEventCoordinator for robust event handling

## 📁 Project Structure

```
3d-geometric-search/
├── src/
│   ├── controllers/          # Application and viewer controllers
│   │   ├── ApplicationController.js
│   │   └── ViewerController.js
│   ├── core/                 # Core systems
│   │   ├── EventBus.js
│   │   └── StateManager.js
│   ├── domain/               # Domain models and constants
│   │   ├── models.js
│   │   └── constants.js       # 50+ event constants (ENHANCED)
│   ├── repositories/         # Data access layer
│   │   └── ModelRepository.js
│   ├── services/             # Business logic services
│   │   ├── ModelLoaderService.js         # Multi-format loading
│   │   ├── SectionManagerService.js      # Section management
│   │   ├── FormatConversionService.js    # Format conversion
│   │   ├── KeyboardShortcutsService.js   # Keyboard control
│   │   ├── ModelExportService.js         # Model export
│   │   └── ModelEventCoordinator.js      # Event orchestration (NEW)
│   ├── ui/                   # User interface components
│   │   └── UIController.js
│   ├── styles/               # Stylesheets
│   │   └── main.css
│   └── main.js               # Application entry point
├── docs/                     # Documentation
│   ├── MULTI_FORMAT_SUPPORT.md          # Format guide
│   ├── STEP_FORMAT_GUIDE.md             # STEP conversion
│   ├── EXTERNAL_MODELS.md               # External loading
│   ├── ARCHITECTURE.md                  # Architecture details
│   ├── FEATURE_GUIDE.md                 # Feature guide
│   └── EVENT_ARCHITECTURE.md            # Event system (NEW)
├── public/                   # Static assets
│   └── models/               # 3D model files
├── index.html                # Main HTML file
├── package.json              # v2.0.0
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 3d-geometric-search
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3001`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage

### Loading Models

#### From Built-in Models

1. Select a model from the dropdown menu
2. Click "Load Model"
3. The model will appear in the 3D viewer with automatically detected sections

#### From External URL

1. Enter a model URL in the "Model URL" field
2. Supported formats: GLTF, GLB, OBJ, STL, FBX
3. Click "Load URL"
4. The model will be loaded from the specified URL

**Example URLs**:

```
https://example.com/model.glb
https://example.com/model.obj
https://example.com/model.stl
```

#### From Local File

1. Click "Choose File" in the External Model section
2. Select a file: `.gltf`, `.glb`, `.obj`, `.stl`, `.fbx`, `.step`, `.stp`
3. Click "Load File"
4. **STEP files**: Automatic conversion to GLTF will be attempted

**Supported Formats**:

- ✅ GLTF/GLB (recommended for web)
- ✅ OBJ/MTL (universal compatibility)
- ✅ STL (3D printing)
- ✅ FBX (Autodesk ecosystem)
- ⚙️ STEP/STP (CAD - auto-conversion attempted)

> **📘 Documentation**:
>
> - Multi-format guide: [docs/MULTI_FORMAT_SUPPORT.md](docs/MULTI_FORMAT_SUPPORT.md)
> - STEP conversion: [docs/STEP_FORMAT_GUIDE.md](docs/STEP_FORMAT_GUIDE.md)
> - External models: [docs/EXTERNAL_MODELS.md](docs/EXTERNAL_MODELS.md)

### Navigating the 3D View

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or two-finger drag on trackpad)
- **Zoom**: Scroll wheel (or pinch on trackpad)
- **Reset View**: Click "Reset View" button

### Working with Sections

- **Highlight Section**: Click the eye icon (👁) next to a section
- **Isolate Section**: Click the magnifier icon (🔍) to hide all other sections
- **Expand/Collapse**: Click the arrow (▼/▶) to show/hide child sections
- **Clear Isolation**: Click the isolate icon again or click "Reset View"

### Other Controls

- **Zoom Slider**: Manually adjust zoom level
- **Refresh**: Reload the current model
- **Fullscreen**: Toggle fullscreen mode

## Adding Your Own Models

### Method 1: External Loading (Recommended)

Simply use the External Model feature to load models from:

- Public URLs with CORS enabled
- Your local file system

### Method 2: Built-in Models

1. Place your GLTF or GLB files in the `public/models/` directory

2. Register them in `src/repositories/ModelRepository.js`:

```javascript
new Model('my-model', 'My Model Name', '/models/mymodel.gltf', 'gltf');
```

## Technology Stack

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and development server
- **Vanilla JavaScript**: No framework dependencies for maximum control
- **CSS3**: Modern styling with CSS variables
- **HTML5**: Semantic markup

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Considerations

- Models are cached after first load
- Materials are reused to minimize memory
- Efficient section isolation without object duplication
- Optimized rendering loop with requestAnimationFrame

## 🎓 Documentation

### User Guides

- **[Feature Guide](docs/FEATURE_GUIDE.md)** - Comprehensive feature walkthrough
- **[Multi-Format Support](docs/MULTI_FORMAT_SUPPORT.md)** - Format compatibility guide
- **[STEP Format Guide](docs/STEP_FORMAT_GUIDE.md)** - STEP conversion details
- **[External Models](docs/EXTERNAL_MODELS.md)** - Loading external models
- **[Testing Checklist](docs/TESTING_CHECKLIST.md)** - Comprehensive testing guide (**NEW**)

### Developer Guides

- **[Architecture Overview](docs/ARCHITECTURE.md)** - System architecture details
- **[Event Architecture](docs/EVENT_ARCHITECTURE.md)** - Event system guide
- **[Model Click Handling](docs/MODEL_CLICK_HANDLING.md)** - Interactive click feature (**NEW**)
- **[System Audit Report](docs/SYSTEM_AUDIT_REPORT.md)** - Architecture analysis

## 🔧 Event System

Version 2.0 introduces a **robust, centralized event handling system** that ensures all model lifecycle changes are consistently captured and propagated throughout the application.

### Key Benefits

- **✅ Centralized Coordination**: Single source of truth for all model events
- **✅ Event Validation**: All events validated before emission
- **✅ History Tracking**: Complete audit trail of all events
- **✅ Debug Mode**: Comprehensive debugging capabilities
- **✅ State Snapshots**: Save and restore application state
- **✅ Predictable Flow**: Clear event propagation patterns

### Quick Example

```javascript
// Enable debug mode to see all events
this.eventCoordinator.setDebugMode(true);

// View event history
const events = this.eventCoordinator.getEventHistory();
console.log('Recent events:', events.slice(-10));

// Create state snapshot
const snapshot = this.eventCoordinator.createSnapshot();

// Restore later
this.eventCoordinator.restoreSnapshot(snapshot);
```

**📘 Complete Guide**: [docs/EVENT_ARCHITECTURE.md](docs/EVENT_ARCHITECTURE.md)

## Troubleshooting

### Model Not Loading

- Verify the model file path is correct
- Check browser console for errors
- Ensure the model format is supported (GLTF/GLB)
- The application will fallback to a demo geometry if the file is not found

### Performance Issues

- Try reducing the model complexity
- Disable shadows in large scenes
- Use smaller texture sizes

### Event Issues

- Enable debug mode: `eventCoordinator.setDebugMode(true)`
- Check event history for troubleshooting
- See [Event Architecture](docs/EVENT_ARCHITECTURE.md) for details

## Development

### Code Style

The project uses ESLint and Prettier for code quality:

```bash
npm run lint
npm run format
```

### Adding New Features

1. Follow the existing architecture patterns
2. Create new services in `src/services/`
3. Use ModelEventCoordinator for model-related events
4. Use the EventBus for cross-component communication
5. Update StateManager for new state properties
6. Add event constants to `src/domain/constants.js`
7. Add event handlers to ModelEventCoordinator
8. Update documentation

### Working with Events

```javascript
// 1. Define event in constants.js
export const EVENTS = {
  MY_NEW_EVENT: 'my:new:event',
};

// 2. Emit via ModelEventCoordinator
this.eventCoordinator.emitEvent(EVENTS.MY_NEW_EVENT, {
  data: 'value',
  timestamp: Date.now(),
});

// 3. Subscribe in ApplicationController
this.eventBus.subscribe(EVENTS.MY_NEW_EVENT, data => {
  this.handleMyNewEvent(data);
});
```

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. Code follows the existing architecture
2. All changes maintain SOLID principles
3. UI remains clean and professional
4. No breaking changes without discussion
5. Events use ModelEventCoordinator
6. Documentation is updated

## Contact

For questions or feedback, please open an issue on GitHub.
