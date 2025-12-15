# 3D Geometric Search

A professional, open-source web application for 3D geometric search and visualization, supporting industry-standard formats including glTF/GLB, STEP, OBJ/MTL, and STL.

## Features

- **Format Support**: glTF/GLB (preferred), STEP (ISO 10303), OBJ/MTL, STL
- **Interactive 3D Viewer**: Real-time rendering with Three.js
- **Model Hierarchy**: Explore nested sections and components
- **Model Operations**: Disassembly, reassembly, isolation, highlighting
- **Navigation**: Bidirectional focus, zoom, pan, rotate
- **Clean Architecture**: SOLID principles, separation of concerns
- **Robust Event System**: Centralized, validated event handling
- **Professional UI**: Minimal, accessible, performance-focused

## Architecture

The application follows clean code architecture with clear separation of concerns:

```
src/
├── core/           # Domain models and business logic
├── events/         # Event system and dispatcher
├── loaders/        # 3D format parsers
├── renderer/       # Three.js scene management
├── state/          # Application state management
├── ui/             # UI components and interactions
├── utils/          # Shared utilities
└── index.js        # Application entry point
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Usage

1. Click "Upload Model" to load a 3D file
2. Explore the model hierarchy in the sidebar
3. Select sections to highlight and focus
4. Use disassemble/reassemble for exploded views
5. Isolate sections to focus on specific components

## Technical Stack

- **Three.js**: 3D rendering engine
- **Vite**: Build tool and dev server
- **Vanilla JavaScript**: No framework dependencies
- **ES Modules**: Modern JavaScript architecture

## License

MIT
