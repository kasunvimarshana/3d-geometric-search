# 3D Geometric Search

A professional, clean, and scalable 3D model viewer and geometric search application built with modern web technologies. Supports industry-standard 3D formats with a focus on performance, maintainability, and user experience.

## ✨ Features

### 🎯 Core Functionality

- **Multi-Format Support**: glTF/GLB, OBJ/MTL, STL, and STEP (CAD) formats
- **Hierarchical Navigation**: Browse nested model sections with intuitive tree view
- **Property Inspection**: View detailed properties of selected model sections
- **Interactive Selection**: Click-to-select sections with visual highlighting
- **Smooth Highlighting**: Graceful hover effects with smooth transitions

### 🎨 Visualization

- **3D Rendering**: High-quality rendering with Three.js
- **Camera Controls**: Orbit, pan, zoom with smooth animations
- **Lighting System**: Professional 3-point lighting setup
- **Material System**: Support for various material types and properties

### 🔧 Advanced Features

- **Model Disassembly**: Explode view for assembly analysis
- **Section Isolation**: Focus on specific parts
- **Bidirectional Navigation**: Navigate up/down the hierarchy
- **View Reset**: Quickly return to default view
- **Fullscreen Mode**: Immersive viewing experience
- **Multi-Selection**: Select multiple sections with Ctrl/Cmd

## 🏗️ Architecture

### Clean Architecture Principles

```
src/
├── domain/              # Core domain models and events
│   ├── types.ts        # Domain types and interfaces
│   └── events.ts       # Domain event definitions
├── core/               # Core application logic
│   ├── EventBus.ts     # Centralized event system
│   └── StateManager.ts # State management
├── loaders/            # File format loaders
│   ├── IModelLoader.ts # Loader interface
│   ├── GLTFModelLoader.ts
│   ├── OBJModelLoader.ts
│   ├── STLModelLoader.ts
│   └── ModelLoaderFactory.ts
├── components/         # UI components
│   ├── ModelViewer.ts  # 3D viewer component
│   ├── NavigationPanel.ts
│   ├── PropertiesPanel.ts
│   └── ControlPanel.ts
├── styles/             # CSS styles
│   └── main.css
├── Application.ts      # Main application class
└── index.ts           # Entry point
```

### Design Patterns

- **SOLID Principles**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Observer Pattern**: Event-driven architecture with EventBus
- **State Pattern**: Centralized state management with immutable updates
- **Factory Pattern**: Dynamic loader instantiation based on file type
- **Singleton Pattern**: Global state and event bus instances

### Key Design Decisions

1. **Separation of Concerns**: Clear boundaries between domain, core, loaders, and UI
2. **Event-Driven Architecture**: All state changes propagate through events
3. **Immutable State**: State updates create new objects, preventing bugs
4. **Type Safety**: Full TypeScript coverage with strict mode
5. **DRY Principle**: Reusable components and utilities
6. **Error Handling**: Graceful degradation and user-friendly error messages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/3d-geometric-search.git
cd 3d-geometric-search

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm run test
```

### Usage

1. **Load a Model**: Click "Load Model" button and select a 3D file
2. **Navigate**: Use the left panel to browse model sections
3. **Select**: Click on sections to view their properties
4. **Inspect**: View detailed properties in the right panel
5. **Control View**: Use mouse to orbit, zoom, and pan
6. **Disassemble**: Click "Disassemble" to explode the model

## 🎮 Controls

### Mouse Controls

- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll Wheel**: Zoom in/out
- **Click Section**: Select section

### Keyboard Shortcuts

- **Ctrl/Cmd + Click**: Multi-select sections
- **F**: Toggle fullscreen
- **R**: Reset view
- **Esc**: Clear selection

## 📦 Supported Formats

### glTF/GLB (Preferred)

- Modern, web-optimized format
- Supports PBR materials
- Efficient binary encoding (GLB)
- Animation support
- Industry standard for web 3D

### OBJ/MTL

- Widely supported legacy format
- Simple text-based geometry
- Material library support
- Good for simple models

### STL

- Stereolithography format
- Common in 3D printing
- Simple triangle mesh
- Binary and ASCII variants

### STEP (Planned)

- CAD industry standard
- ISO 10303 compliance
- Precise geometric data
- Assembly support

## 🎨 UI/UX Design

### Design Philosophy

- **Clean & Minimal**: No decorative or fancy effects
- **Professional**: Suitable for engineering and design workflows
- **Consistent**: Uniform spacing, typography, and visual hierarchy
- **Accessible**: High contrast, readable fonts
- **Responsive**: Adapts to different screen sizes

### Color Palette

- **Background**: Dark theme (#1a1a1a, #2a2a2a, #333333)
- **Text**: Light gray (#e0e0e0, #b0b0b0)
- **Accent**: Blue (#00aaff) for selection
- **Highlight**: Orange (#ffaa00) for hover
- **Success**: Green (#00dd88)
- **Error**: Red (#ff4444)

## 🔧 Configuration

### Build Configuration

- **Bundler**: Vite for fast builds and HMR
- **TypeScript**: Strict mode for type safety
- **Module System**: ES Modules
- **Target**: ES2020 for modern browsers

### Extending the Application

#### Adding a New File Format

1. Create a new loader implementing `IModelLoader`:

```typescript
export class MyFormatLoader extends BaseModelLoader {
  readonly supportedFormats: FileFormat[] = ["myformat" as FileFormat];

  async load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D> {
    // Implementation
  }
}
```

2. Register the loader:

```typescript
import { ModelLoaderFactory } from "./loaders/ModelLoaderFactory";
import { MyFormatLoader } from "./loaders/MyFormatLoader";

ModelLoaderFactory.registerLoader(new MyFormatLoader());
```

#### Adding Custom Events

1. Define event type in `domain/events.ts`:

```typescript
export enum EventType {
  CUSTOM_EVENT = "custom:event",
}

export interface CustomEvent extends BaseEvent {
  type: EventType.CUSTOM_EVENT;
  data: any;
}
```

2. Listen to events:

```typescript
eventBus.on(EventType.CUSTOM_EVENT, (event) => {
  // Handle event
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📊 Performance

### Optimization Strategies

- **Lazy Loading**: Load components on demand
- **Code Splitting**: Separate bundles for optimal loading
- **Tree Shaking**: Remove unused code
- **Minification**: Compress production builds
- **Caching**: Browser and CDN caching strategies

### Best Practices

- Use instanced rendering for repeated geometry
- Implement LOD (Level of Detail) for complex models
- Dispose unused resources properly
- Debounce expensive operations
- Use Web Workers for heavy computations

## 🛠️ Troubleshooting

### Common Issues

**Issue**: Model doesn't load

- **Solution**: Check file format is supported and file is not corrupted

**Issue**: Slow performance with large models

- **Solution**: Consider simplifying the model or implementing LOD

**Issue**: Sections not highlighting

- **Solution**: Ensure meshes have proper IDs and materials

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use meaningful variable and function names
- Document complex logic with comments
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Three.js**: Excellent 3D rendering library
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Email: support@example.com
- Documentation: https://docs.example.com

## 🗺️ Roadmap

### Version 2.1

- [ ] STEP file format support
- [ ] Advanced material editor
- [ ] Measurement tools
- [ ] Cross-section views

### Version 2.2

- [ ] Collaborative features
- [ ] Cloud storage integration
- [ ] AR/VR support
- [ ] Advanced search and filtering

### Version 3.0

- [ ] Real-time collaboration
- [ ] Plugin system
- [ ] Custom shaders
- [ ] Performance analytics

---

**Built with ❤️ using modern web technologies**
