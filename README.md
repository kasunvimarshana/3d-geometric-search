# E3D Viewer

A clean, modern Angular-based 3D application inspired by industry-standard geometric search viewers. Prioritizes glTF/GLB, supports STEP (AP203/214/242) via WebAssembly, and remains compatible with OBJ/MTL and STL. Designed with SOLID, DRY, separation of concerns, and clean architecture.

## Features

- Model loading: glTF/GLB, STEP (.stp/.step), OBJ, STL
- Section tree with nested nodes; bidirectional selection (tree ↔ viewport)
- Isolation and de-isolation of sections
- Highlight/dehighlight with smooth, consistent visuals
- Zoom/fit-to-selection and fit-to-all; reset view
- Fullscreen toggle
- Disassembly/reassembly animation (exploded view)
- Centralized state management via Angular Services with RxJS
- Predictable, uni-directional data flow

## Architecture

The application follows Angular best practices with a clean, layered architecture:

- **`src/app`**: Angular application layer
  - **`components/`**: Angular standalone components (Toolbar, Viewport, Hotkeys)
  - **`services/`**: State management services (ModelService, ViewerService, UIService)
  - Configuration files for routing and application bootstrap
- **`src/core`**: Domain logic, services, registries (framework-agnostic)
  - **`domain/`**: Business logic and model tree structures
  - **`registry/`**: Model registry for managing 3D objects
  - **`services/`**: Core services like fit-to-view calculations
- **`src/infrastructure`**: Format loaders, Three.js adapters
  - **`loaders/`**: File format loaders (glTF, OBJ, STL, STEP)
- **`src/styles.css`**: Global application styles

The core and infrastructure layers are preserved from the original implementation and remain framework-agnostic, making them reusable across different frontend frameworks.

## Getting Started

```bash
# Node.js 18+ recommended
npm install
npm start
```

Dev server will be available at http://localhost:4200. Use "Open Model" or drag-and-drop files into the viewport.

### Loading Models

- glTF/GLB: Preferred. Single-file `.glb` works best. Multi-file `.gltf` with external `.bin` and textures is supported—multi-select or drag-and-drop the `.gltf`, its `.bin`, and any referenced textures together.
- OBJ + MTL (+ textures): Multi-select or drag-and-drop `model.obj`, matching `model.mtl`, and any referenced textures (png/jpg/webp/etc.). The loader pairs `.obj` with its `.mtl` and resolves dropped textures automatically.
- STL: Single file `.stl`.
- STEP: `.stp/.step` requires optional dependency (see below).

## Build

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory.

## Tests

```bash
npm test
```

## Notes on STEP Support

STEP parsing runs in the browser via `occt-import-js` (OpenCascade WebAssembly). This package is optional and not installed by default. To enable STEP:

```bash
npm install occt-import-js
```

Large files may take time and memory. Errors are reported gracefully.

## Keyboard / Mouse

- Rotate: left mouse + drag
- Pan: right mouse + drag
- Zoom: wheel

### Shortcuts

- ?: Toggle help overlay
- F: Fit selection (or all if none)
- A: Fit all
- I: Isolate selection
- Esc/E: Clear isolation
- R: Reset view

## Technology Stack

- **Angular 19**: Modern standalone components with signal-based reactivity
- **RxJS**: Reactive state management
- **Three.js**: 3D rendering engine
- **TypeScript**: Type-safe development
- **Angular CLI**: Build tooling and development server

## License

This project is scaffolded by you; integrate into your preferred license.
