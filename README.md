# Neo 3DFind (Angular)

Clean-room, modern Angular application inspired by 3DFindIt concepts.

- Uni-directional data flow via NgRx (store + effects)
- Three.js viewer with glTF/GLB, OBJ/MTL, STL; STEP stub
- Centralized error handling, minimal UI (toolbar, sections, canvas)
- Predictable interactions: load, focus, highlight, fit, fullscreen, reset

## Quick Start

> Angular CLI on Node 24 may have issues. Prefer Node 22 LTS.

```bash
# In Windows PowerShell
cd c:\repo\be\PKV\neo-3dfind
npm install
npx ng serve -o
```

If CLI fails on Node 24, install Node 22 LTS or use nvm-windows:

```bash
winget install CoreyButler.NVMforWindows
nvm install 22.11.0
nvm use 22.11.0
npm install
npx ng serve -o
```

## STEP Support

This project ships a STEP placeholder. Integrate a converter (WASM or service)
that produces glTF for web rendering. Suggested options:

- WASM: OpenCascade-based STEP → glTF (community projects)
- Server: Convert STEP to glTF server-side, then load GLB in viewer

## Architecture

- app/core/services/three-viewer.service.ts — rendering + loaders
- app/core/state/\* — NgRx store slices (model, viewer)
- app/components/\* — UI (toolbar, tree, canvas)
- GlobalErrorHandler — centralized error capture

## Testing

```bash
npx ng test
```
