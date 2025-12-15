# AI Coding Agent Instructions

## Project Overview

3D Geometric Search is a browser-based 3D model visualization and analysis tool built with Three.js. It supports multiple formats (glTF/GLB, OBJ/MTL, STL, STEP), performs geometry analysis, and finds similar models based on geometric features.

## Architecture

### Clean Layered Architecture

The codebase follows SOLID principles with clear separation:

**Domain Layer** (`js/geometryAnalyzer.js`):

- Core geometry analysis logic (vertices, faces, volume, bounding box)
- Similarity search using weighted feature comparison
- Pure functions with no external dependencies

**Infrastructure Layer**:

- `js/modelLoader.js`: File loading, Three.js loader integration, thumbnail generation
- `js/exportManager.js`: JSON/CSV/HTML report generation

**Presentation Layer**:

- `js/viewer.js`: Three.js scene/camera/renderer management, orbit controls, lighting
- `js/app.js`: Main controller, orchestrates all modules, manages state
- `js/eventHandler.js`: Maps UI events to app actions, drag-and-drop, keyboard shortcuts

**Utilities**:

- `js/eventBus.js`: Global event system with `EventHandlerManager` for cleanup
- `js/sectionManager.js`: UI section visibility and loading states
- `js/utils.js`: Toast notifications, file validation, formatters
- `js/config.js`: Centralized configuration (viewer settings, lighting, thresholds)

### State Management

All state lives in `app.js` - no global state:

```javascript
{
  modelLibrary: {},        // {modelName: {object, geometry, features, thumbnail}}
  currentModelName: null,  // Active model
  similarityResults: []    // Array of similar models with scores
}
```

### Module Dependencies

```
app.js depends on:
  ├─ viewer.js (Three.js rendering)
  ├─ modelLoader.js (file I/O)
  ├─ geometryAnalyzer.js (analysis)
  ├─ exportManager.js (export)
  ├─ eventHandler.js (events)
  └─ config.js (settings)

All modules access:
  ├─ eventBus.js (global events)
  └─ sectionManager.js (UI sections)
```

## Development Workflows

### Setup & Running

```bash
npm install           # Install Three.js only dependency
npm run dev          # Python HTTP server on port 8000
npm start            # Alternative: http-server on port 8000
```

### Key File Upload Flow

1. User drops file → `eventHandler.js` calls `app.handleFiles()`
2. `app.loadFile()` validates via `utils.validateFileType()`
3. `modelLoader.loadModel()` returns `{object, geometry}`
4. `geometryAnalyzer.analyzeGeometry()` returns features object
5. Store in `modelLibrary`, update UI grid
6. `viewer.loadModel()` displays in Three.js scene
7. `geometryAnalyzer.findSimilar()` runs automatically

### Adding New Features

**New Model Format**: Add loader to `modelLoader.js`, update `Config.modelLoader.supportedFormats`

**New Analysis Metric**: Add method to `geometryAnalyzer.js`, update `findSimilar()` comparison weights in `config.js`

**New Viewer Control**: Add HTML control, handler in `eventHandler.js`, method in `viewer.js`

**New Export Format**: Add method to `exportManager.js`, wire up in UI

## Critical Patterns & Conventions

### Event Management

Always use `EventHandlerManager` to prevent memory leaks:

```javascript
this.eventManager = new EventHandlerManager();
this.eventManager.add(element, "click", handler);
// Cleanup happens automatically
```

### Configuration Over Hardcoding

Never hardcode values - use `config.js`:

```javascript
import Config from "./config.js";
const maxResults = Config.geometryAnalysis.maxSimilarResults;
```

### ES6 Modules

All JavaScript uses ES6 modules (`import/export`). Entry point is `index.html` with `<script type="module">`.

### Three.js Integration

- Import from CDN: `import * as THREE from "three"`
- Addons via: `import { OrbitControls } from "three/addons/controls/OrbitControls.js"`
- Viewer encapsulates all Three.js logic - don't expose internals to app.js

### Error Handling

- Use try-catch in async operations
- Show user-friendly messages via `showToast()` from `utils.js`
- Log detailed errors to console for debugging

## Recent Refactoring (v1.8.3)

The codebase underwent major cleanup (see `REFACTORING_SUMMARY.md` in main branch):

- Removed 5 over-engineered modules (logger, stateManager, navigationManager, etc.)
- Reduced code by 35% while maintaining all functionality
- Eliminated lazy-loading complexity
- Simplified from 1261 to 759 lines of CSS
- All 47 excessive docs archived to `docs/archive/`

**Do NOT reintroduce**:

- Separate state management abstractions
- Logger wrappers around console
- Navigation/sidebar systems
- Lazy-loading infrastructure
- Over-engineered patterns

## Testing Strategy

Currently no automated tests. Manual testing covers:

- Upload all supported formats (glTF, OBJ, STL)
- Verify geometry analysis accuracy
- Test all viewer controls (zoom, rotate, wireframe, lighting)
- Check keyboard shortcuts (F=fullscreen, R=reset, Space=auto-rotate, etc.)
- Validate export formats (JSON, CSV, HTML)

## Dependencies

- **Production**: Three.js v0.152.0 only
- **Dev**: Python 3 or http-server for local development
- **No build step**: Pure browser-based ES6 modules

## Common Pitfalls

1. **Module Loading**: EventBus is loaded as traditional script, accessed via `window.EventHandlerManager`
2. **File Validation**: Always validate formats before passing to loader
3. **Geometry Null Checks**: STL files may not have UVs or normals - handle gracefully
4. **Thumbnail Generation**: Requires render before capture - timing matters
5. **Memory Leaks**: Always use EventHandlerManager for DOM events

## Extension Points

The architecture is designed for easy extension:

- Add new geometry analysis metrics without changing other modules
- Plug in new Three.js loaders for additional formats
- Add export formats independently
- Extend viewer controls without affecting business logic

## Branch Information

- **main**: Stable, refactored codebase (v1.8.3)
- **dev-10**: Current development branch (workspace cleared)
- Previous work archived in main branch under `docs/archive/`
