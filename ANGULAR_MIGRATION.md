# Migration to Angular

This document describes the migration from React + Redux to Angular.

## Overview

The application has been fully refactored from a React-based architecture to Angular, while preserving the core business logic and infrastructure layers. This migration follows Angular best practices using standalone components and RxJS for state management.

## Key Changes

### Framework Migration
- **From**: React 19 + Redux Toolkit + React Three Fiber
- **To**: Angular 19 + RxJS + Three.js (direct integration)

### State Management
- **From**: Redux Toolkit with slices and listener middleware
- **To**: Angular Services with RxJS BehaviorSubjects

### Component Architecture
- **From**: React functional components with hooks
- **To**: Angular standalone components with TypeScript

### Build System
- **From**: Vite
- **To**: Angular CLI

## Architecture Comparison

### Before (React)
```
src/
├── app/
│   ├── slices/         # Redux slices
│   ├── epics/          # Side effects
│   └── store.js        # Redux store
├── presentation/
│   └── components/     # React components
├── core/               # Business logic
└── infrastructure/     # Loaders
```

### After (Angular)
```
src/
├── app/
│   ├── services/       # State management services
│   ├── components/     # Angular components
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── core/               # Business logic (unchanged)
└── infrastructure/     # Loaders (unchanged)
```

## State Management Mapping

### Redux Slices → Angular Services

| Redux Slice | Angular Service | Description |
|-------------|----------------|-------------|
| `modelSlice.js` | `model.service.ts` | Model loading, selection, isolation |
| `viewerSlice.js` | `viewer.service.ts` | Camera, viewport, fit-to-view |
| `uiSlice.js` | `ui.service.ts` | UI state (help overlay, etc.) |

### Example: Redux to Angular

**Before (Redux):**
```javascript
// Dispatch action
dispatch(loadModelRequested({ file }));

// Select state
const status = useSelector(s => s.model.status);
```

**After (Angular):**
```typescript
// Call service method
this.modelService.loadModel(file);

// Subscribe to state
this.modelService.state$.subscribe(state => {
  this.status = state.status;
});
```

## Component Conversion

### React Components → Angular Components

| React Component | Angular Component | Status |
|----------------|-------------------|--------|
| `App.jsx` | `app.component.ts` | ✅ Converted |
| `Toolbar.jsx` | `toolbar.component.ts` | ✅ Converted |
| `Viewport.jsx` | `viewport.component.ts` | ✅ Converted |
| `Hotkeys.jsx` | `hotkeys.component.ts` | ✅ Converted |
| `TreeView.jsx` | - | ❌ Not implemented (commented in original) |
| `StatusPanel.jsx` | - | ❌ Not implemented (commented in original) |
| `ErrorBoundary.jsx` | - | ✅ Error handling in App component |

### Three.js Integration

**Before:** Used React Three Fiber (`@react-three/fiber` + `@react-three/drei`)
**After:** Direct Three.js integration with OrbitControls from `three-stdlib`

The viewport component now:
- Creates Three.js scene, camera, and renderer manually
- Manages the render loop with `requestAnimationFrame`
- Handles window resize events
- Integrates OrbitControls directly

## Commands

### Before (React + Vite)
```bash
npm run dev      # Start dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run tests with Vitest
```

### After (Angular)
```bash
npm start        # Start dev server (port 4200)
npm run build    # Build for production
npm test         # Run tests with Karma/Jasmine
```

## Dependencies

### Removed
- React and React-DOM
- Redux Toolkit
- React-Redux
- React Three Fiber
- @react-three/drei
- Vite and Vite plugins
- Vitest
- ESLint with React plugins

### Added
- Angular 19 (core, common, compiler, platform-browser, etc.)
- RxJS 7.8+
- Zone.js
- TypeScript
- Jasmine and Karma (for testing)
- Angular CLI

### Preserved
- Three.js
- three-stdlib
- Core domain logic
- Infrastructure loaders

## Preserved Layers

The following layers remain **unchanged** and framework-agnostic:

### Core Layer (`src/core/`)
- `domain/modelTree.js` - Model tree structure
- `registry/ModelRegistry.js` - 3D object registry
- `services/fitView.js` - Camera fit-to-view calculations
- `services/metrics.js` - Measurement utilities

### Infrastructure Layer (`src/infrastructure/`)
- `loaders/` - File format loaders (glTF, OBJ, STL, STEP)

These layers can be reused with any frontend framework.

## Testing Migration

Testing needs to be migrated from Vitest to Angular's testing framework:

- **Unit tests**: Migrate to Jasmine
- **Component tests**: Use Angular TestBed
- **Integration tests**: Use Karma for browser-based testing

## Benefits of Angular Migration

1. **Type Safety**: Full TypeScript integration with strict typing
2. **Dependency Injection**: Built-in DI system for services
3. **RxJS First**: Native reactive programming with observables
4. **Standalone Components**: Modern, lightweight component architecture
5. **Angular CLI**: Powerful build and development tools
6. **Enterprise Ready**: Battle-tested framework for large applications

## Breaking Changes

1. **Port Change**: Dev server now runs on port 4200 (was 5173)
2. **API Changes**: Component APIs completely different (Angular vs React)
3. **State Access**: Subscribe to observables instead of hooks
4. **Build Output**: Different bundle structure and naming

## Migration Checklist

- [x] Install Angular and dependencies
- [x] Create Angular project structure
- [x] Convert state management to services
- [x] Convert all active components
- [x] Integrate Three.js directly
- [x] Update build configuration
- [x] Update documentation
- [ ] Migrate tests
- [ ] Add missing components if needed (TreeView, StatusPanel)

## Next Steps

1. **Testing**: Migrate existing tests to Jasmine/Karma
2. **Features**: Implement any commented-out features from original
3. **Optimization**: Review bundle size and optimize imports
4. **Documentation**: Add JSDoc comments to services and components
5. **E2E Testing**: Consider adding Cypress or Playwright tests
