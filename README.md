# E3D Viewer

A clean, modern JavaScript end-to-end 3D application inspired by industry-standard geometric search viewers. Prioritizes glTF/GLB, supports STEP (AP203/214/242) via WebAssembly, and remains compatible with OBJ/MTL and STL. Designed with SOLID, DRY, separation of concerns, and clean architecture.

## Features

- Model loading: glTF/GLB, STEP (.stp/.step), OBJ, STL
- Section tree with nested nodes; bidirectional selection (tree ↔ viewport)
- Isolation and de-isolation of sections
- Highlight/dehighlight with smooth, consistent visuals
- Zoom/fit-to-selection and fit-to-all; reset view
- Fullscreen toggle
- Disassembly/reassembly animation (exploded view)
- Centralized state via Redux Toolkit (listener middleware)
- Predictable, uni-directional event orchestration

## Architecture

- `src/core`: domain logic, services, registries (no UI deps)
- `src/infrastructure`: format loaders, Three.js adapters
- `src/app`: Redux store, slices, and listener-based side effects
- `src/presentation`: React UI and R3F viewport (pure presentation)

## Getting Started

```bash
# Node.js 18+ recommended
npm install
npm run dev
```

Dev server prints the URL (e.g., http://localhost:5175). Use “Open Model” or drag-and-drop files into the viewport.

### Loading Models

- glTF/GLB: Preferred. Single-file `.glb` works best. Multi-file `.gltf` with external `.bin` and textures is supported—multi-select or drag-and-drop the `.gltf`, its `.bin`, and any referenced textures together.
- OBJ + MTL (+ textures): Multi-select or drag-and-drop `model.obj`, matching `model.mtl`, and any referenced textures (png/jpg/webp/etc.). The loader pairs `.obj` with its `.mtl` and resolves dropped textures automatically.
- STL: Single file `.stl`.
- STEP: `.stp/.step` requires optional dependency (see below).

## Tests

```bash
npm run test
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

## License

This project is scaffolded by you; integrate into your preferred license.
