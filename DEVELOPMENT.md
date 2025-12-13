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

## Development Workflow

### 1. Setup

```bash
# Clone the repository
git clone <repository-url>
cd 3d-geometric-search

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Making Changes

The application uses Vite for hot module replacement (HMR). Changes will automatically reload in the browser.

### 3. Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure Explained

```
src/
├── controllers/              # Application orchestration
│   ├── ApplicationController.js  # Main app coordinator
│   └── ViewerController.js       # 3D scene management
│
├── core/                     # Core systems
│   ├── EventBus.js              # Event management
│   └── StateManager.js          # State management
│
├── domain/                   # Business domain
│   ├── models.js                # Domain models & interfaces
│   └── constants.js             # Application constants
│
├── repositories/             # Data access
│   └── ModelRepository.js       # Model data management
│
├── services/                 # Business logic
│   ├── ModelLoaderService.js    # 3D model loading
│   └── SectionManagerService.js # Section management
│
├── ui/                       # User interface
│   └── UIController.js          # UI management
│
├── styles/                   # Stylesheets
│   └── main.css                 # Main styles
│
└── main.js                   # Entry point
```

## Common Tasks

### Adding a New Feature

1. **Define Domain Models** (if needed)
   - Add to `src/domain/models.js`
   - Add constants to `src/domain/constants.js`

2. **Create Service** (if needed)
   - Add to `src/services/`
   - Implement business logic
   - Follow SRP (Single Responsibility Principle)

3. **Update State Management**
   - Add state properties to `ViewerState`
   - Add methods to `StateManager`
   - Define events in `constants.js`

4. **Wire Up in Controller**
   - Update `ApplicationController`
   - Add event handlers
   - Connect UI to service

5. **Update UI**
   - Add UI elements to `index.html`
   - Update `UIController`
   - Add styles to `main.css`

### Example: Adding a Screenshot Feature

1. **Add Event Constant**

```javascript
// src/domain/constants.js
export const EVENTS = {
  // ... existing events
  SCREENSHOT_TAKEN: 'screenshot:taken',
};
```

2. **Create Service Method**

```javascript
// src/services/ScreenshotService.js
export class ScreenshotService {
  constructor(renderer) {
    this.renderer = renderer;
  }

  capture() {
    return this.renderer.domElement.toDataURL('image/png');
  }
}
```

3. **Add to Application Controller**

```javascript
// src/controllers/ApplicationController.js
handleScreenshot() {
  const screenshot = this.screenshotService.capture();
  this.eventBus.emit(EVENTS.SCREENSHOT_TAKEN, screenshot);
  // Download or display screenshot
}
```

4. **Add UI Button**

```html
<!-- index.html -->
<button id="screenshot-btn">Screenshot</button>
```

5. **Wire Up Event**

```javascript
// src/controllers/ApplicationController.js
document.getElementById('screenshot-btn').addEventListener('click', () => {
  this.handleScreenshot();
});
```

### Adding a New Model Format

1. **Add Format Constant**

```javascript
// src/domain/constants.js
export const MODEL_TYPES = {
  // ... existing types
  FBX: 'fbx',
};
```

2. **Implement Loader**

```javascript
// src/services/ModelLoaderService.js
async loadFBX(url) {
  return new Promise((resolve, reject) => {
    this.fbxLoader.load(
      url,
      object => resolve(object),
      null,
      error => reject(error)
    );
  });
}
```

3. **Update Load Method**

```javascript
// src/services/ModelLoaderService.js
async load(model) {
  switch (model.type) {
    case MODEL_TYPES.FBX:
      return await this.loadFBX(model.url);
    // ... other cases
  }
}
```

## Debugging

### Enable Debug Mode

```javascript
// src/main.js
window.DEBUG = true;
```

### Access App Instance

The app instance is available in the browser console:

```javascript
// In browser console
app.stateManager.getState()
app.viewerController.camera.position
app.eventBus.getEventTypes()
```

### Common Debug Commands

```javascript
// Get current state
app.stateManager.getState()

// Get all sections
app.stateManager.getSections()

// Get current model
app.viewerController.getCurrentModel()

// Trigger events manually
app.eventBus.emit('test:event', { data: 'test' })
```

## Testing

### Manual Testing Checklist

- [ ] Load each model type
- [ ] Highlight sections
- [ ] Isolate sections
- [ ] Reset view
- [ ] Zoom in/out
- [ ] Navigate (rotate, pan)
- [ ] Toggle fullscreen
- [ ] Refresh application
- [ ] Resize window
- [ ] Test on different browsers

### Performance Testing

```javascript
// Monitor FPS
let lastTime = performance.now();
let frames = 0;

function measureFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(measureFPS);
}
measureFPS();
```

## Code Style Guide

### Naming Conventions

- **Classes**: PascalCase (`ModelRepository`)
- **Functions**: camelCase (`loadModel`)
- **Constants**: UPPER_SNAKE_CASE (`MODEL_TYPES`)
- **Private methods**: Prefix with underscore (`_privateMethod`)
- **Files**: PascalCase for classes (`ModelRepository.js`)

### File Organization

```javascript
// 1. Imports
import * as THREE from 'three';
import { Model } from '../domain/models.js';

// 2. Class definition
export class MyClass {
  // 3. Constructor
  constructor() {}
  
  // 4. Public methods
  publicMethod() {}
  
  // 5. Private methods
  _privateMethod() {}
}
```

### Comments

```javascript
/**
 * JSDoc comment for public methods
 * @param {string} id - The model ID
 * @returns {Model} The loaded model
 */
loadModel(id) {
  // Inline comments for complex logic
  const model = this.repository.getById(id);
  return model;
}
```

## Common Issues

### Issue: Model Not Loading

**Solution:**
- Check browser console for errors
- Verify model path in repository
- Ensure model file exists in `public/models/`
- Check CORS if loading from external URL

### Issue: Sections Not Appearing

**Solution:**
- Verify model has mesh objects
- Check section creation in `ModelRepository`
- Inspect `meshMap` in `SectionManagerService`

### Issue: Performance Slow

**Solution:**
- Reduce model complexity
- Optimize textures
- Check for memory leaks
- Disable shadows for large scenes

### Issue: UI Not Updating

**Solution:**
- Check event subscriptions
- Verify state updates
- Check for JavaScript errors
- Ensure EventBus is working

## Build & Deployment

### Building

```bash
npm run build
```

Output is in `dist/` directory.

### Deployment

The built application is static and can be deployed to:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

### Environment Variables

Create `.env` file for environment-specific settings:

```bash
VITE_API_URL=https://api.example.com
VITE_MODEL_PATH=/models
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Resources

### Three.js
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)

### JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

### Design Patterns
- [Refactoring Guru](https://refactoring.guru/design-patterns)
- [SOLID Principles](https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the code style guide
4. Write clear commit messages
5. Test your changes
6. Submit a pull request

## Support

For questions or issues:
- Check the README.md
- Review ARCHITECTURE.md
- Open an issue on GitHub
- Check browser console for errors

## License

MIT - See LICENSE file for details
