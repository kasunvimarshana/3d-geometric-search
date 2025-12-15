# 3D Geometric Search Application

A professional, production-ready 3D model viewer and geometric search application built from scratch using modern JavaScript, Three.js, and clean architecture principles inspired by 3DFindIt.

## ✨ Features

- 🎯 **Multi-Format Support**: glTF/GLB, OBJ/MTL, STL, STEP (partial)
- 🏗️ **Section Management**: Hierarchical tree, selection, highlighting, isolation
- 🎮 **Interactive 3D Viewer**: Orbit, pan, zoom, fit-to-screen, fullscreen
- 🔧 **Advanced Tools**: Disassembly/reassembly, focus, property inspection
- 🏛️ **Clean Architecture**: SOLID principles, separation of concerns, modular design
- 📱 **Professional UI**: Minimal, clean, responsive design

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

Then click "📁 Load Model" and select a 3D file (`.gltf`, `.glb`, `.obj`, `.stl`, `.step`).

## 📚 Documentation

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands, API, shortcuts
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use the application
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer guide and best practices
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   UI Layer                          │
│  (Components, Views, User Interactions)             │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              Event Orchestrator                     │
│  (Centralized Event Handling & Coordination)        │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐  ┌──────▼──────┐  ┌──▼─────┐
│ State  │  │   Engine    │  │ Domain │
│Manager │  │  (3D Scene) │  │ Models │
└────────┘  └─────────────┘  └────────┘
```

### Project Structure

```
src/
├── core/           # Domain models (Model, Section, Camera, Selection)
├── state/          # State management (StateManager, StateActions)
├── engine/         # 3D rendering (Engine, SceneManager)
├── loaders/        # File format loaders (glTF, OBJ, STL, STEP)
├── events/         # Event orchestration
├── ui/             # UI components (Toolbar, SectionTree, Properties, etc.)
├── utils/          # Utilities and validators
├── styles/         # CSS styling
├── Application.js  # Main application orchestrator
└── index.js        # Entry point
```

## 🎨 Design Principles

- **SOLID**: Single responsibility, open/closed, dependency inversion
- **DRY**: No code duplication, reusable components
- **Clean Code**: Clear naming, comprehensive documentation
- **Separation of Concerns**: Clear layer boundaries
- **Testability**: Modular, injectable dependencies

## 🔧 Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run format       # Format code
```

## 🌐 Browser Support

- Chrome 90+ ✓
- Edge 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓

Requires WebGL 2.0 support.

## 📦 Tech Stack

- **Framework**: Vanilla JavaScript (ES6+ modules)
- **3D Engine**: Three.js
- **Build Tool**: Vite
- **State Management**: Custom observer pattern
- **Architecture**: Clean architecture with clear layer boundaries

## 🎯 Key Features in Detail

### Multi-Format Support

- **glTF/GLB**: Modern 3D web format with full support
- **OBJ/MTL**: Wavefront format with materials
- **STL**: Stereolithography for 3D printing
- **STEP**: CAD format (basic support, extensible with OpenCascade.js)

### Interactive Controls

- Left-click drag: Rotate
- Right-click drag: Pan
- Mouse wheel: Zoom
- Double-click section: Focus camera
- Keyboard: F (fit), R (reset), Esc (deselect)

### Section Management

- Hierarchical tree view
- Select/deselect sections
- Highlight on hover
- Focus camera on section
- Isolate single section
- Properties inspection

### Advanced Features

- Disassemble/reassemble models
- Fullscreen mode
- Responsive layout
- Loading indicators
- Error handling
- State history (undo/redo ready)

## 🛠️ Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for:

- Development setup
- Coding standards
- Architecture patterns
- Adding features
- Testing strategy
- Performance optimization

## 📖 Usage

See [USER_GUIDE.md](USER_GUIDE.md) for:

- Loading models
- Navigation controls
- Using section tree
- Properties panel
- Keyboard shortcuts
- Troubleshooting

## 🏆 Code Quality

- ✓ Clean architecture
- ✓ SOLID principles
- ✓ Comprehensive documentation
- ✓ Error handling
- ✓ Memory management
- ✓ Type validation
- ✓ No code duplication

## 📝 License

MIT License - Free for commercial and personal use

## 🤝 Contributing

Contributions welcome! Please read [DEVELOPMENT.md](DEVELOPMENT.md) first.

## 📧 Support

For issues or questions, please check:

1. [USER_GUIDE.md](USER_GUIDE.md) - Common questions
2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick API reference
3. Browser console for error details

---

**Built with modern JavaScript, Three.js, and clean architecture principles.**
