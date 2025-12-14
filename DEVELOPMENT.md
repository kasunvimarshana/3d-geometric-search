# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
3d-geometric-search/
├── src/
│   ├── domain/              # Core business logic
│   │   ├── models/          # Domain entities
│   │   ├── interfaces/      # Contracts
│   │   └── events/          # Domain events
│   ├── application/         # Use cases and services
│   │   └── services/        # Application services
│   ├── infrastructure/      # External implementations
│   │   ├── loaders/         # 3D format loaders
│   │   └── renderers/       # Rendering implementations
│   ├── presentation/        # UI layer
│   │   ├── components/      # UI components
│   │   ├── controllers/     # View controllers
│   │   └── styles/          # CSS styles
│   └── main.ts              # Application entry point
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # Project documentation
```

## Adding a New File Format

1. **Create a loader** implementing `IModelLoader`:

```typescript
// src/infrastructure/loaders/MyFormatLoader.ts
import { IModelLoader, LoadOptions, LoadResult } from '@domain/interfaces/IModelLoader';
import { Model, ModelFormat } from '@domain/models/Model';

export class MyFormatLoader implements IModelLoader {
  readonly supportedFormats = [ModelFormat.MY_FORMAT];

  canLoad(format: ModelFormat): boolean {
    return this.supportedFormats.includes(format);
  }

  async load(options: LoadOptions): Promise<LoadResult> {
    // Parse the format and return a Model
    const model = new Model(metadata);
    // ... process and add sections
    return { model };
  }
}
```

2. **Register the loader** in `main.ts`:

```typescript
import { MyFormatLoader } from '@infrastructure/loaders/MyFormatLoader';

// In bootstrap function
modelLoader.registerLoader(new MyFormatLoader());
```

3. **Update format enum** in `Model.ts`:

```typescript
export enum ModelFormat {
  // ... existing formats
  MY_FORMAT = 'myformat',
}
```

## Adding a New UI Component

1. **Create the component**:

```typescript
// src/presentation/components/MyComponent.ts
export class MyComponent {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container not found: ${containerId}`);
    }
    this.container = element;
  }

  render(data: unknown): void {
    // Render logic
  }
}
```

2. **Add to the controller**:

```typescript
// src/presentation/controllers/ApplicationController.ts
import { MyComponent } from '@presentation/components/MyComponent';

// In constructor
this.myComponent = new MyComponent('my-component-id');
```

3. **Update HTML** in `index.html`:

```html
<div id="my-component-id"></div>
```

## Adding a New Service

1. **Create the service**:

```typescript
// src/application/services/MyService.ts
import { IEventBus } from '@domain/interfaces/IEventBus';

export class MyService {
  constructor(private readonly eventBus: IEventBus) {}

  async doSomething(): Promise<void> {
    // Service logic
    
    // Publish events
    this.eventBus.publish(new SomeEvent({ data }));
  }
}
```

2. **Wire up in main.ts**:

```typescript
const myService = new MyService(eventBus);
```

## Event System

### Publishing Events

```typescript
import { EventType } from '@domain/events/DomainEvents';

// Create event class
export class MyCustomEvent implements DomainEvent {
  readonly type = EventType.MY_CUSTOM;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { data: string }) {}
}

// Publish
this.eventBus.publish(new MyCustomEvent({ data: 'example' }));
```

### Subscribing to Events

```typescript
// Subscribe
const unsubscribe = this.eventBus.subscribe(
  EventType.MY_CUSTOM,
  (event) => {
    const payload = event.payload as { data: string };
    console.log(payload.data);
  }
);

// Unsubscribe when done
unsubscribe();
```

## Debugging

### Enable Debug Mode

Development builds automatically expose the app controller:

```javascript
// In browser console
window.app // Access to ApplicationController
```

### Useful Console Commands

```javascript
// Get current model
window.app.modelService.getCurrentModel()

// Get event history
window.app.eventBus.getEventHistory()

// Get camera position
window.app.viewService.renderer.getCameraPosition()
```

## Performance Tips

1. **Large Models**: Implement progressive loading
2. **Events**: Use throttling for frequent events
3. **Rendering**: Enable frustum culling and LOD
4. **Memory**: Always dispose of Three.js objects

## Common Issues

### Issue: "Module not found"

**Solution**: Check path aliases in `tsconfig.json` and `vite.config.ts`

### Issue: Model not rendering

**Solution**: Check:
- File format is supported
- Model has valid geometry
- Renderer is initialized
- Viewport element exists

### Issue: Events not firing

**Solution**: Check:
- Event is published correctly
- Handler is subscribed before event fires
- Event type matches subscription

## Useful Commands

```bash
# Type checking only
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# Build
npm run build

# Serve production build
npm run preview
```

## VS Code Extensions (Recommended)

- ESLint
- Prettier
- TypeScript + JavaScript
- Vite

## Additional Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
