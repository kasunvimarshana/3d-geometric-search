# Development Guide

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

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
src/
├── core/              # Domain entities and business logic
│   ├── entities/      # Domain models
│   └── services/      # Business services
├── engine/            # 3D rendering engine
├── state/             # State management
├── events/            # Event system
├── ui/                # UI components
├── loaders/           # Format loaders
├── utils/             # Utilities
├── styles/            # CSS styles
├── Application.js     # Main application class
└── main.js           # Entry point
```

## Coding Standards

### JavaScript Style

- ES6+ modules
- Async/await for asynchronous code
- Clear, descriptive variable names
- JSDoc comments for public APIs

### Class Structure

```javascript
/**
 * ClassName
 *
 * Brief description of the class purpose.
 */
export class ClassName {
  constructor(dependencies) {
    // Initialize properties
  }

  /**
   * Method description
   * @param {Type} param - Parameter description
   * @returns {Type} Return value description
   */
  methodName(param) {
    // Implementation
  }
}
```

### Error Handling

```javascript
try {
  // Risky operation
} catch (error) {
  console.error('Context:', error);
  throw new AppError('User-friendly message', 'ERROR_CODE', details);
}
```

### Event Naming

- Use colon separator: `category:action`
- Examples: `model:loaded`, `section:select`, `view:reset`

## Adding New Features

### 1. Define Requirements

- What problem does it solve?
- What are the acceptance criteria?
- What are the edge cases?

### 2. Design Solution

- Which layers are affected?
- What new events are needed?
- What state changes are required?

### 3. Implement

1. Add entities/services if needed
2. Define new events
3. Implement core logic
4. Add UI components
5. Wire up event handlers
6. Update state management

### 4. Test

- Unit tests for business logic
- Integration tests for event flow
- Manual testing for UI

### 5. Document

- Update README
- Add JSDoc comments
- Update architecture docs

## Common Tasks

### Adding a New File Format

1. Create loader class:

```javascript
// src/loaders/MyFormatLoader.js
export class MyFormatLoader {
  async load(file) {
    // Parse file
    // Create Model entity
    // Return { model, object3D }
  }

  static supports(fileName) {
    // Check file extension
  }
}
```

2. Register in factory:

```javascript
// src/loaders/ModelLoaderFactory.js
import { MyFormatLoader } from './MyFormatLoader.js';

static loaders = [
  // ... existing loaders
  MyFormatLoader,
];
```

### Adding a New UI Component

1. Create component:

```javascript
// src/ui/components/MyComponent.js
export class MyComponent {
  constructor(container) {
    this.container = container;
  }

  render(data) {
    // Update DOM
  }
}
```

2. Register in UIController:

```javascript
const components = {
  // ... existing components
  myComponent: new MyComponent(document.getElementById('my-component')),
};
```

3. Subscribe to events:

```javascript
bus.on('data:changed', (data) => {
  components.myComponent.render(data);
});
```

### Adding a New Event

1. Define event type:

```javascript
// src/events/EventTypes.js
export const EventTypes = {
  // ... existing types
  MY_NEW_EVENT: 'category:event-name',
};
```

2. Emit event:

```javascript
eventBus.emit(EventTypes.MY_NEW_EVENT, data);
```

3. Handle event:

```javascript
eventBus.on(EventTypes.MY_NEW_EVENT, (data) => {
  // Handle event
});
```

## Debugging

### Browser DevTools

- Use browser console for logs
- Use debugger statement for breakpoints
- Use Performance tab for profiling

### Application Debug Access

```javascript
// In browser console
window.app; // Access application instance
window.app.store.getState(); // View current state
window.app.eventOrchestrator.getEventLog(); // View event log
```

### Common Issues

**Issue: Model not loading**

- Check file format support
- Check console for errors
- Verify file is valid

**Issue: UI not updating**

- Check event flow
- Verify state changes
- Check component subscriptions

**Issue: Performance problems**

- Check model complexity
- Profile with browser tools
- Consider LOD implementation

## Performance Optimization

### Tips

1. Use requestAnimationFrame for animations
2. Throttle/debounce frequent events
3. Dispose unused resources
4. Use object pooling for frequent allocations
5. Optimize geometry (merge, simplify)

### Monitoring

```javascript
// Track render performance
const stats = this.renderer.renderer.info;
console.log('Render calls:', stats.render.calls);
console.log('Triangles:', stats.render.triangles);
```

## Code Review Checklist

- [ ] Code follows style guide
- [ ] JSDoc comments present
- [ ] Error handling implemented
- [ ] Resources properly disposed
- [ ] Events properly named
- [ ] State updates immutable
- [ ] No console.logs in production
- [ ] Dependencies minimized
- [ ] Performance considered

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Run tests
4. Build production version
5. Test production build
6. Tag release
7. Deploy

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)
