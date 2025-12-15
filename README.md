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
- Centralized state via Redux Toolkit + redux-observable (RxJS)
- Predictable, uni-directional event orchestration

## Architecture

- `src/core`: domain logic, services, registries (no UI deps)
- `src/infrastructure`: format loaders, Three.js adapters
- `src/app`: Redux store, slices, and epics (events and side-effects)
- `src/presentation`: React UI and R3F viewport (pure presentation)

## Getting Started

```bash
# Node.js 18+ recommended
npm install
npm run dev
```

Open http://localhost:5173 and use “Open Model” to load a file.

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

## License

This project is scaffolded by you; integrate into your preferred license.
