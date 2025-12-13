# 3D Geometric Search

A professional, clean, and well-architected 3D model viewer with advanced section management, navigation, and interaction capabilities.

## Features

- **Dynamic Model Loading**: Load and display 3D models (GLTF/GLB format)
- **Section Management**: Automatic detection and hierarchical organization of model sections
- **Section Isolation**: Focus on specific sections by hiding others
- **Section Highlighting**: Visual highlighting of selected sections
- **Interactive Navigation**: Orbit, pan, and zoom controls
- **Fullscreen Mode**: Distraction-free viewing experience
- **Clean UI**: Minimal, professional interface focused on usability
- **Responsive Design**: Adapts to different screen sizes

## Architecture

The application follows **SOLID principles** and **clean code architecture**:

### Project Structure

```
3d-geometric-search/
├── src/
│   ├── controllers/          # Application and viewer controllers
│   │   ├── ApplicationController.js
│   │   └── ViewerController.js
│   ├── core/                 # Core systems
│   │   ├── EventBus.js
│   │   └── StateManager.js
│   ├── domain/               # Domain models and constants
│   │   ├── models.js
│   │   └── constants.js
│   ├── repositories/         # Data access layer
│   │   └── ModelRepository.js
│   ├── services/             # Business logic services
│   │   ├── ModelLoaderService.js
│   │   └── SectionManagerService.js
│   ├── ui/                   # User interface components
│   │   └── UIController.js
│   ├── styles/               # Stylesheets
│   │   └── main.css
│   └── main.js               # Application entry point
├── public/                   # Static assets
│   └── models/               # 3D model files (GLTF/GLB)
├── index.html                # Main HTML file
├── package.json
├── vite.config.js
└── README.md
```

### Design Patterns

- **MVC Pattern**: Separation of concerns between model, view, and controller
- **Observer Pattern**: Event-driven architecture using EventBus
- **Repository Pattern**: Abstraction of data access
- **Facade Pattern**: ApplicationController as a unified interface
- **Service Layer**: Business logic encapsulation
- **Interface Segregation**: Clear separation of responsibilities

### Key Principles

1. **Single Responsibility**: Each class has one clear purpose
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Open/Closed**: Open for extension, closed for modification
4. **DRY (Don't Repeat Yourself)**: No code duplication
5. **Separation of Concerns**: Clear boundaries between layers

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd 3d-geometric-search
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Loading a Model

1. Select a model from the dropdown menu
2. Click "Load Model"
3. The model will appear in the 3D viewer with automatically detected sections

### Navigating the 3D View

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag (or two-finger drag on trackpad)
- **Zoom**: Scroll wheel (or pinch on trackpad)
- **Reset View**: Click "Reset View" button

### Working with Sections

- **Highlight Section**: Click the eye icon (👁) next to a section
- **Isolate Section**: Click the magnifier icon (🔍) to hide all other sections
- **Expand/Collapse**: Click the arrow (▼/▶) to show/hide child sections
- **Clear Isolation**: Click the isolate icon again or click "Reset View"

### Other Controls

- **Zoom Slider**: Manually adjust zoom level
- **Refresh**: Reload the current model
- **Fullscreen**: Toggle fullscreen mode

## Adding Your Own Models

1. Place your GLTF or GLB files in the `public/models/` directory

2. Register them in `src/repositories/ModelRepository.js`:

```javascript
new Model('my-model', 'My Model Name', '/models/mymodel.gltf', 'gltf')
```

## Technology Stack

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and development server
- **Vanilla JavaScript**: No framework dependencies for maximum control
- **CSS3**: Modern styling with CSS variables
- **HTML5**: Semantic markup

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance Considerations

- Models are cached after first load
- Materials are reused to minimize memory
- Efficient section isolation without object duplication
- Optimized rendering loop with requestAnimationFrame

## Troubleshooting

### Model Not Loading

- Verify the model file path is correct
- Check browser console for errors
- Ensure the model format is supported (GLTF/GLB)
- The application will fallback to a demo geometry if the file is not found

### Performance Issues

- Try reducing the model complexity
- Disable shadows in large scenes
- Use smaller texture sizes

## Development

### Code Style

The project uses ESLint and Prettier for code quality:

```bash
npm run lint
npm run format
```

### Adding New Features

1. Follow the existing architecture patterns
2. Create new services in `src/services/`
3. Use the EventBus for cross-component communication
4. Update StateManager for new state properties
5. Add event constants to `src/domain/constants.js`

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. Code follows the existing architecture
2. All changes maintain SOLID principles
3. UI remains clean and professional
4. No breaking changes without discussion

## Contact

For questions or feedback, please open an issue on GitHub.
