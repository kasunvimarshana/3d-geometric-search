# Development Guide

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd 3d-geometric-search

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
3d-geometric-search/
├── src/
│   ├── core/              # Application layer
│   │   ├── Application.ts
│   │   ├── EventBus.ts
│   │   ├── StateManager.ts
│   │   ├── ModelRepository.ts
│   │   └── SectionManager.ts
│   ├── domain/            # Domain layer
│   │   ├── types.ts
│   │   ├── events.ts
│   │   └── interfaces.ts
│   ├── infrastructure/    # Infrastructure layer
│   │   ├── loaders/
│   │   │   ├── GLTFModelLoader.ts
│   │   │   ├── OBJModelLoader.ts
│   │   │   ├── STLModelLoader.ts
│   │   │   └── ModelLoaderFactory.ts
│   │   ├── ThreeRenderer.ts
│   │   ├── AnimationController.ts
│   │   └── FileHandler.ts
│   ├── ui/                # UI layer
│   │   └── components/
│   │       ├── UIComponent.ts
│   │       ├── Toolbar.ts
│   │       ├── SectionPanel.ts
│   │       ├── StatusBar.ts
│   │       └── ViewerContainer.ts
│   ├── utils/             # Utilities
│   │   ├── VectorUtils.ts
│   │   ├── ValidationUtils.ts
│   │   ├── Logger.ts
│   │   └── PerformanceUtils.ts
│   ├── styles/            # Styles
│   │   └── main.css
│   └── main.ts            # Entry point
├── docs/                  # Documentation
├── public/                # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development Workflow

### Adding a New Feature

1. **Define Domain Types** (if needed)

   ```typescript
   // src/domain/types.ts
   export interface MyNewFeature {
     id: string;
     // ... properties
   }
   ```

2. **Define Events** (if needed)

   ```typescript
   // src/domain/events.ts
   export interface MyFeatureEvent extends DomainEvent {
     type: EventType.MY_FEATURE;
     payload: {
       /* ... */
     };
   }
   ```

3. **Implement Core Logic**

   ```typescript
   // src/core/MyFeatureManager.ts
   export class MyFeatureManager {
     // Implementation
   }
   ```

4. **Add UI Component** (if needed)

   ```typescript
   // src/ui/components/MyFeatureComponent.ts
   export class MyFeatureComponent extends UIComponent {
     // Implementation
   }
   ```

5. **Wire Up in Application**
   ```typescript
   // src/core/Application.ts
   private setupMyFeature(): void {
     this.eventBus.subscribe(
       EventType.MY_FEATURE,
       this.onMyFeature.bind(this)
     );
   }
   ```

### Adding a New File Format

1. **Add Format to Enum**

   ```typescript
   // src/domain/types.ts
   export enum ModelFormat {
     // ... existing formats
     MY_FORMAT = "my_format",
   }
   ```

2. **Implement Loader**

   ```typescript
   // src/infrastructure/loaders/MyFormatLoader.ts
   export class MyFormatLoader implements IModelLoader {
     readonly supportedFormats = [ModelFormat.MY_FORMAT];

     canLoad(format: ModelFormat): boolean {
       return this.supportedFormats.includes(format);
     }

     async load(data: ArrayBuffer | string, filename: string): Promise<Model> {
       // Implementation
     }
   }
   ```

3. **Register Loader**
   ```typescript
   // src/infrastructure/loaders/ModelLoaderFactory.ts
   private registerDefaultLoaders(): void {
     // ... existing loaders

     const myFormatLoader = new MyFormatLoader();
     myFormatLoader.supportedFormats.forEach(format => {
       this.loaders.set(format, myFormatLoader);
     });
   }
   ```

## Coding Standards

### TypeScript

- Use strict type checking
- Avoid `any` type
- Define interfaces for all public APIs
- Use enums for constants
- Document complex functions

### Naming Conventions

- Classes: `PascalCase`
- Interfaces: `IPascalCase` (with I prefix)
- Functions/Methods: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `PascalCase.ts`

### Code Organization

- One class per file
- Group related functions
- Keep files under 300 lines
- Use barrel exports (index.ts)

### Comments

- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date
- Remove commented code

### Git Workflow

- Feature branches: `feature/my-feature`
- Bug fixes: `fix/bug-description`
- Commit messages: Present tense, imperative mood
- Atomic commits

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
npm run build -- --mode production
```

### Preview Production Build

```bash
npm run preview
```

## Debugging

### Browser DevTools

- Enable source maps in `vite.config.ts`
- Use breakpoints in TypeScript code
- Access application instance: `window.app` (dev mode)

### Logging

```typescript
import { logger } from "@utils/Logger";

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");
```

### Performance Profiling

```typescript
import { PerformanceUtils } from "@utils/PerformanceUtils";

PerformanceUtils.startMeasure("operation");
// ... operation
const duration = PerformanceUtils.endMeasure("operation");
console.log(`Operation took ${duration}ms`);
```

## Common Tasks

### Load a Test Model

```typescript
// Create a test button in toolbar
const testBtn = document.createElement("button");
testBtn.textContent = "Load Test Model";
testBtn.onclick = async () => {
  const response = await fetch("/models/test.glb");
  const blob = await response.blob();
  const file = new File([blob], "test.glb");
  // Trigger file upload
};
```

### Add Event Logging

```typescript
this.eventBus.subscribeAll((event) => {
  logger.debug("Event:", event.type, event.payload);
});
```

### Monitor State Changes

```typescript
this.stateManager.subscribe((state) => {
  logger.debug("State updated:", state);
});
```

## Troubleshooting

### Model Not Loading

- Check console for errors
- Verify file format is supported
- Check file size (max 100MB)
- Ensure file is not corrupted

### Performance Issues

- Enable performance monitoring
- Check mesh count
- Reduce geometry complexity
- Use level of detail (LOD)

### Build Errors

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist`
- Check TypeScript version

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
