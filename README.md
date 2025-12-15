# 3D Model Viewer

A professional-grade 3D model viewer built with clean architecture principles, supporting multiple 3D file formats and providing an intuitive interface for exploring complex assemblies.

## Features

### 🎯 Core Capabilities

- **Multi-format Support**: glTF/GLB, OBJ/MTL, STL, STEP (planned)
- **Section Management**: Hierarchical navigation, selection, isolation
- **Advanced Viewing**: Zoom, pan, rotate, fit-to-view, fullscreen
- **Interactive Highlighting**: Hover and click interactions with visual feedback
- **Model Statistics**: Vertex count, face count, object count

### 🎨 User Interface

- Clean, minimal, professional design
- Three-panel layout (hierarchy, viewport, properties)
- Responsive and adaptive
- Keyboard shortcuts support
- Drag-and-drop file loading

### 🏗️ Architecture

- Clean architecture with clear layer separation
- SOLID principles throughout
- Observable state management with history
- Event-driven communication
- Modular and extensible design

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd KV

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Usage

### Loading Models

1. **Drag & Drop**: Drag a 3D model file onto the viewport
2. **File Picker**: Click the "Open Model" button in the header
3. **Upload Overlay**: Click anywhere in the overlay when no model is loaded

### Supported Formats

- `.gltf`, `.glb` - glTF 2.0 format
- `.obj`, `.mtl` - Wavefront OBJ with materials
- `.stl` - Stereolithography format
- `.step`, `.stp` - STEP format (requires OpenCascade.js integration)

### Navigation

#### Mouse Controls

- **Left Click**: Select section
- **Double Click**: Focus on section
- **Right Drag**: Rotate view
- **Middle Drag**: Pan view
- **Scroll**: Zoom in/out
- **Hover**: Highlight section

#### Keyboard Shortcuts

- `F`: Fit model to view
- `R`: Reset camera
- `W`: Toggle wireframe
- `G`: Toggle grid
- `A`: Toggle axes
- `ESC`: Deselect all

#### View Controls

- **Fit**: Center model in view
- **Reset**: Return to default view
- **Wireframe**: Toggle wireframe rendering
- **Grid**: Show/hide ground grid
- **Axes**: Show/hide coordinate axes
- **Fullscreen**: Enter/exit fullscreen mode

### Section Operations

#### In Hierarchy Tree

- Click section name to select
- Double-click to focus camera
- Use arrow icons to expand/collapse
- Multiple sections can be selected (Ctrl/Cmd + Click)

#### In Viewport

- Click object to select
- Hover to highlight
- Double-click to focus camera
- Selected sections show in properties panel

### Properties Panel

View detailed information about:

- Section name and ID
- Parent section
- Geometry (vertices, faces)
- Material properties
- Transform data
- Custom properties

## Project Structure

```
src/
├── core/                  # Domain layer
│   ├── entities/          # Business entities
│   └── services/          # Business logic
├── engine/                # 3D rendering layer
│   ├── Renderer.js        # Three.js setup
│   ├── SceneManager.js    # Scene management
│   ├── CameraController.js # Camera operations
│   ├── InteractionManager.js # User interactions
│   └── ModelRenderer.js   # Visual rendering
├── state/                 # State management
│   ├── Store.js           # Observable store
│   ├── ApplicationState.js # State structure
│   └── StateActions.js    # State mutations
├── events/                # Event system
│   ├── EventBus.js        # Pub/sub system
│   ├── EventTypes.js      # Event definitions
│   └── EventOrchestrator.js # Event handling
├── ui/                    # User interface
│   ├── components/        # UI components
│   └── UIController.js    # UI orchestration
├── loaders/               # Format loaders
│   ├── GLTFModelLoader.js # glTF support
│   ├── OBJModelLoader.js  # OBJ support
│   ├── STLModelLoader.js  # STL support
│   └── ModelLoaderFactory.js # Loader selection
├── utils/                 # Utilities
├── styles/                # CSS styles
├── Application.js         # Main app class
└── main.js               # Entry point
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design patterns
- [Development Guide](docs/DEVELOPMENT.md) - Developer documentation
- [API Reference](docs/API.md) - API documentation

## Technology Stack

- **3D Engine**: Three.js 0.160.0
- **Build Tool**: Vite 5.0.0
- **Code Quality**: ESLint, Prettier
- **Language**: Modern JavaScript (ES6+)

## Design Principles

### Clean Architecture

- Clear separation of concerns
- Dependency inversion
- Independent of frameworks

### SOLID Principles

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Best Practices

- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)
- YAGNI (You Aren't Gonna Need It)
- Composition over inheritance
- Immutable state updates

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Efficient scene graph management
- Frustum culling
- Geometry optimization
- Resource pooling
- Debounced/throttled events

## Future Enhancements

### Planned Features

- [ ] STEP format support (OpenCascade.js integration)
- [ ] Measurement tools (distance, angle)
- [ ] Section plane cutting
- [ ] Annotations
- [ ] Animation playback
- [ ] Comparison mode
- [ ] Collaborative features

### Advanced Features

- [ ] Geometric search (HNSW algorithm)
- [ ] Progressive loading
- [ ] Web Worker parsing
- [ ] Level of Detail (LOD)
- [ ] Virtual reality support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT

## Acknowledgments

- Inspired by [3DFindIt](https://www.3dfindit.com/en/3d-geometricsearch)
- Built with [Three.js](https://threejs.org/)
- Powered by [Vite](https://vitejs.dev/)

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review code examples

---

**Built with clean architecture principles for maintainability, testability, and extensibility.**
