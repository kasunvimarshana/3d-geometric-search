# Quick Start Guide

## Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:4200)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── app/                        # Angular application
│   ├── components/             # UI components
│   │   ├── hotkeys/            # Keyboard shortcuts
│   │   ├── toolbar/            # Top toolbar
│   │   └── viewport/           # 3D viewport
│   ├── services/               # State management
│   │   ├── model.service.ts    # Model state
│   │   ├── viewer.service.ts   # Viewer state
│   │   └── ui.service.ts       # UI state
│   ├── app.component.ts        # Root component
│   ├── app.config.ts           # App configuration
│   └── app.routes.ts           # Routing
├── core/                       # Framework-agnostic
│   ├── domain/                 # Business logic
│   ├── registry/               # Model registry
│   └── services/               # Core services
└── infrastructure/             # Framework-agnostic
    └── loaders/                # File loaders
```

## Key Features

- **Model Loading**: glTF/GLB, OBJ/MTL, STL, STEP
- **Drag & Drop**: Drop files into viewport to load
- **Multi-file**: Select multiple files for models with textures
- **3D Interaction**: Rotate (left drag), pan (right drag), zoom (wheel)
- **Object Selection**: Click on objects to select
- **Fit to View**: Auto-fit on load, or press F/A
- **Keyboard Shortcuts**: Press ? for help

## Keyboard Shortcuts

- **?** - Toggle help
- **F** - Fit selection (or all if none selected)
- **A** - Fit all
- **I** - Isolate selection
- **Esc/E** - Clear isolation
- **R** - Reset view

## Making Changes

### Adding a Component

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  template: `<div>Hello</div>`
})
export class MyComponent {}
```

### Adding State

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyService {
  private state = new BehaviorSubject<any>(null);
  public state$ = this.state.asObservable();
}
```

### Using a Service

```typescript
constructor(private myService: MyService) {}

ngOnInit() {
  this.myService.state$.subscribe(state => {
    // Handle state changes
  });
}
```

## Documentation

- **README.md** - Project overview and setup
- **ANGULAR_MIGRATION.md** - Migration details from React
- **REFACTORING_SUMMARY.md** - Complete refactoring documentation

## Technology Stack

- Angular 19 (standalone components)
- RxJS 7.8 (reactive programming)
- Three.js 0.164 (3D rendering)
- TypeScript 5.6 (type safety)
- Angular CLI (build tooling)

## Support

For issues or questions, refer to the documentation files or Angular/Three.js official documentation.
