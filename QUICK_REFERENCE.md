# Quick Reference

## 🚀 Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 📁 Key Files

| File                            | Purpose                |
| ------------------------------- | ---------------------- |
| `src/domain/types.ts`           | Core domain types      |
| `src/domain/events.ts`          | Event definitions      |
| `src/core/EventBus.ts`          | Event system           |
| `src/core/StateManager.ts`      | State management       |
| `src/components/ModelViewer.ts` | 3D rendering           |
| `src/Application.ts`            | Main app orchestration |
| `src/index.ts`                  | Entry point            |

## 🎯 Core Concepts

### Event Flow

```
User Action → Component → StateManager → Event → All Listeners → UI Update
```

### State Management

```typescript
// Get state
const state = stateManager.getState();

// Subscribe to changes
stateManager.subscribe((state) => {
  console.log("State changed:", state);
});

// Update state
stateManager.selectSection(sectionId);
```

### Event Bus

```typescript
// Listen to event
eventBus.on(EventType.MODEL_LOADED, (event) => {
  console.log("Model:", event.model);
});

// Emit event
eventBus.emit({
  type: EventType.MODEL_LOADED,
  timestamp: new Date(),
  model: myModel,
});
```

## 🎨 Styling

### CSS Variables

```css
--bg-primary: #1a1a1a;
--bg-secondary: #2a2a2a;
--text-primary: #e0e0e0;
--accent-primary: #00aaff;
--accent-secondary: #ffaa00;
--spacing-md: 16px;
--transition-normal: 250ms ease;
```

### Common Classes

- `.btn` - Button
- `.btn-primary` - Primary button
- `.section-item` - Tree item
- `.property-row` - Property table row
- `.empty-state` - Empty state message

## 🎮 User Controls

| Action       | Control             |
| ------------ | ------------------- |
| Rotate       | Left click + drag   |
| Pan          | Right click + drag  |
| Zoom         | Scroll wheel        |
| Select       | Click section       |
| Multi-select | Ctrl/Cmd + click    |
| Reset view   | Click "Reset View"  |
| Fullscreen   | Click "Fullscreen"  |
| Disassemble  | Click "Disassemble" |

## 🔧 Common Tasks

### Add Event Type

```typescript
// In domain/events.ts
export enum EventType {
  MY_EVENT = "my:event",
}

export interface MyEvent extends BaseEvent {
  type: EventType.MY_EVENT;
  data: string;
}
```

### Add Loader

```typescript
// Create MyLoader.ts
export class MyLoader extends BaseModelLoader {
  readonly supportedFormats = ['myformat'];
  async load(path, data) { /* ... */ }
}

// Register in ModelLoaderFactory.ts
private static loaders = [
  new MyLoader(),
  // ...
];
```

### Add UI Control

```typescript
// In ControlPanel.ts
this.container.querySelector("#btnNew")?.addEventListener("click", () => {
  this.stateManager.doSomething();
});
```

## 📊 Supported Formats

| Format | Extension | Type              |
| ------ | --------- | ----------------- |
| glTF   | .gltf     | Web-optimized     |
| GLB    | .glb      | Binary glTF       |
| OBJ    | .obj      | Wavefront         |
| STL    | .stl      | Stereolithography |

## 🎯 Event Types

| Event                   | When                      |
| ----------------------- | ------------------------- |
| `MODEL_LOADING`         | Model load started        |
| `MODEL_LOADED`          | Model loaded successfully |
| `MODEL_LOAD_ERROR`      | Load failed               |
| `SECTION_SELECTED`      | Section selected          |
| `SECTION_DESELECTED`    | Selection cleared         |
| `SECTION_HIGHLIGHTED`   | Hover started             |
| `SECTION_DEHIGHLIGHTED` | Hover ended               |
| `VIEW_STATE_CHANGED`    | Camera/zoom changed       |
| `VIEW_RESET`            | View reset to default     |
| `MODEL_DISASSEMBLED`    | Exploded view             |
| `MODEL_REASSEMBLED`     | Collapsed view            |

## 🐛 Debugging

```javascript
// Browser console

// Get state
StateManager.getInstance().getState();

// Monitor events
EventBus.getInstance().on("*", (e) => console.log(e));

// Check listeners
EventBus.getInstance().getListenerCount();
```

## 📖 Documentation

| File                        | Content                     |
| --------------------------- | --------------------------- |
| `README.md`                 | User guide, features, setup |
| `ARCHITECTURE.md`           | System design, patterns     |
| `DEVELOPMENT.md`            | Dev guide, examples         |
| `IMPLEMENTATION_SUMMARY.md` | What's included             |

## 🎨 Design Tokens

```typescript
// Spacing
xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

// Font sizes
xs: 11px, sm: 12px, md: 14px, lg: 16px, xl: 20px

// Colors
Primary: #00aaff (Blue)
Secondary: #ffaa00 (Orange)
Success: #00dd88 (Green)
Error: #ff4444 (Red)
```

## 🔗 Useful Links

- [Three.js Docs](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 💡 Tips

1. Use TypeScript's type system - let it help you
2. Follow the event-driven pattern consistently
3. Keep state immutable
4. Dispose resources properly
5. Test edge cases
6. Check console for errors
7. Use browser DevTools
8. Read the documentation

---

**Quick Start**: `npm install && npm run dev` 🚀
