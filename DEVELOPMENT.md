# Development Guide

## Quick Start

### Initial Setup

```bash
# Install dependencies
npm install

# Start development server (opens automatically at http://localhost:3000)
npm run dev
```

### Project Structure

```
3d-geometric-search/
├── src/
│   ├── domain/              # Core business logic
│   │   ├── types.ts         # Domain types
│   │   └── events.ts        # Event definitions
│   ├── core/                # Core services
│   │   ├── EventBus.ts      # Event system
│   │   └── StateManager.ts  # State management
│   ├── loaders/             # File format loaders
│   │   ├── IModelLoader.ts
│   │   ├── GLTFModelLoader.ts
│   │   ├── OBJModelLoader.ts
│   │   ├── STLModelLoader.ts
│   │   └── ModelLoaderFactory.ts
│   ├── components/          # UI components
│   │   ├── ModelViewer.ts
│   │   ├── NavigationPanel.ts
│   │   ├── PropertiesPanel.ts
│   │   └── ControlPanel.ts
│   ├── styles/
│   │   └── main.css
│   ├── Application.ts       # Main app
│   └── index.ts            # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development Workflow

### Adding a New Feature

1. **Define Domain Types** (if needed)

   - Add types in `src/domain/types.ts`
   - Add events in `src/domain/events.ts`

2. **Update State Management** (if needed)

   - Add state properties in `StateManager`
   - Add state mutation methods

3. **Implement Core Logic**

   - Create new service/utility files
   - Follow single responsibility principle

4. **Update UI Components**

   - Modify existing components or create new ones
   - Subscribe to relevant state changes
   - Emit events for user actions

5. **Test and Validate**
   - Test in development mode
   - Check error handling
   - Validate edge cases

### Code Standards

#### TypeScript

```typescript
// ✅ Good: Explicit types, clear names
interface ModelSection {
  id: string;
  name: string;
  type: "assembly" | "part" | "mesh" | "group";
}

// ❌ Bad: Any types, unclear names
interface MS {
  i: any;
  n: any;
}
```

#### Functions

```typescript
// ✅ Good: Single responsibility, clear intent
function selectSection(sectionId: string): void {
  const section = getSection(sectionId);
  if (!section) return;

  section.selected = true;
  emitSelectionEvent(section);
}

// ❌ Bad: Multiple responsibilities
function doStuff(id: string): void {
  // Too many things happening
}
```

#### Event Handling

```typescript
// ✅ Good: Type-safe events
eventBus.on(EventType.MODEL_LOADED, (event: ModelLoadedEvent) => {
  console.log("Model loaded:", event.model.name);
});

// ❌ Bad: Unsafe, unclear
eventBus.on("loaded", (e: any) => {
  console.log(e);
});
```

## Testing

### Unit Testing

```typescript
// Example unit test
import { describe, it, expect } from "vitest";
import { StateManager } from "./StateManager";

describe("StateManager", () => {
  it("should initialize with default state", () => {
    const manager = StateManager.getInstance();
    const state = manager.getState();

    expect(state.model).toBeNull();
    expect(state.loading).toBe(false);
  });
});
```

### Manual Testing Checklist

- [ ] Load glTF model
- [ ] Load OBJ model
- [ ] Load STL model
- [ ] Select sections
- [ ] Multi-select with Ctrl
- [ ] Hover highlighting
- [ ] View properties
- [ ] Zoom in/out
- [ ] Reset view
- [ ] Disassemble model
- [ ] Fullscreen mode
- [ ] Error handling

## Debugging

### Console Logging

The application logs important events to console:

```javascript
// Enable verbose logging (in browser console)
localStorage.setItem("debug", "true");

// Disable verbose logging
localStorage.removeItem("debug");
```

### Event Inspection

```javascript
// Monitor all events (in browser console)
const eventBus = window.EventBus?.getInstance();
eventBus.on("*", (event) => console.log("Event:", event));
```

### State Inspection

```javascript
// Check current state (in browser console)
const stateManager = window.StateManager?.getInstance();
console.log(stateManager.getState());
```

## Common Tasks

### Adding a New File Format

1. Create loader:

```typescript
// src/loaders/MyFormatLoader.ts
import { BaseModelLoader } from "./IModelLoader";
import type { Model3D, FileFormat } from "../domain/types";

export class MyFormatLoader extends BaseModelLoader {
  readonly supportedFormats: FileFormat[] = ["myformat" as FileFormat];

  async load(
    filePath: string,
    fileData: ArrayBuffer | string
  ): Promise<Model3D> {
    // Parse file
    // Create Model3D structure
    // Return model
  }
}
```

2. Register loader:

```typescript
// In ModelLoaderFactory.ts
import { MyFormatLoader } from "./MyFormatLoader";

export class ModelLoaderFactory {
  private static loaders: IModelLoader[] = [
    new GLTFModelLoader(),
    new OBJModelLoader(),
    new STLModelLoader(),
    new MyFormatLoader(), // Add here
  ];
}
```

### Adding a New Event

1. Define event type:

```typescript
// src/domain/events.ts
export enum EventType {
  MY_CUSTOM_EVENT = "my:custom:event",
}

export interface MyCustomEvent extends BaseEvent {
  type: EventType.MY_CUSTOM_EVENT;
  data: string;
}
```

2. Emit event:

```typescript
eventBus.emit({
  type: EventType.MY_CUSTOM_EVENT,
  timestamp: new Date(),
  data: "Hello",
});
```

3. Listen to event:

```typescript
eventBus.on(EventType.MY_CUSTOM_EVENT, (event) => {
  console.log("Custom event:", event.data);
});
```

### Adding a UI Control

1. Add button in ControlPanel:

```typescript
// src/components/ControlPanel.ts
private initializeUI(): void {
  this.container.innerHTML = `
    ...
    <button id="btnMyAction" class="btn">
      <span class="icon">🎯</span>
      My Action
    </button>
    ...
  `;
}
```

2. Add event listener:

```typescript
private attachEventListeners(): void {
  this.container.querySelector('#btnMyAction')?.addEventListener('click', () => {
    this.handleMyAction();
  });
}

private handleMyAction(): void {
  // Handle action
  this.stateManager.updateSomeState();
}
```

## Performance Optimization

### Profiling

```javascript
// Profile rendering (in browser console)
performance.mark("render-start");
// ... render code ...
performance.mark("render-end");
performance.measure("render", "render-start", "render-end");
console.log(performance.getEntriesByName("render"));
```

### Memory Management

- Always dispose Three.js objects when done
- Unsubscribe from events when components unmount
- Clear intervals and animation frames

### Bundle Size

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Static Host

```bash
# The dist/ folder contains the production build
# Upload to: Netlify, Vercel, GitHub Pages, etc.
```

### Environment Variables

```bash
# Create .env file
VITE_API_URL=https://api.example.com
VITE_ENABLE_ANALYTICS=true
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Troubleshooting

### Build Errors

**Error**: `Cannot find module 'three'`

```bash
npm install three @types/three
```

**Error**: `Unexpected token`

- Check TypeScript syntax
- Ensure tsconfig.json is correct

### Runtime Errors

**Error**: Model doesn't load

- Check console for errors
- Verify file format is supported
- Check file size limits

**Error**: Components not rendering

- Check if containers exist in DOM
- Verify initialization order
- Check for JavaScript errors

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## Getting Help

- Check the README.md for general information
- See ARCHITECTURE.md for system design
- Open an issue on GitHub
- Contact the development team

## Contributing

See the main README.md for contribution guidelines.

---

Happy coding! 🚀
