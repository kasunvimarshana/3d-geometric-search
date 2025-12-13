# 3D Geometric Search

A professional web application for 3D model visualization, analysis, and similarity search.

## Features

- **3D Model Upload**: Support for glTF/GLB, OBJ/MTL, STL, and STEP formats
- **Interactive Visualization**: Rotate, zoom, pan with intuitive controls
- **Geometry Analysis**: Automatic calculation of vertices, faces, volume, and bounding box
- **Similarity Search**: Find models with similar geometric properties
- **Advanced Controls**: Lighting, shadows, wireframe, and camera presets
- **Export**: Generate analysis reports and export similarity results

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:8000 in your browser.

## Usage

1. **Upload Models**: Drag and drop 3D model files or click "Choose Files"
2. **Explore**: Use mouse controls to rotate and inspect models
3. **Analyze**: View geometric properties in the model info panel
4. **Compare**: Find similar models based on geometric features
5. **Export**: Generate reports or export analysis data

## Keyboard Shortcuts

- `F` - Toggle fullscreen
- `R` - Reset view
- `Space` - Toggle auto-rotate
- `G` - Toggle grid
- `A` - Toggle axes
- `W` - Toggle wireframe
- `+/-` - Zoom in/out
- `0` - Fit to view

## Architecture

The application follows clean architecture principles with clear separation of concerns:

- **Domain Layer**: Geometry analysis and model processing
- **Application Layer**: State management and business logic
- **Presentation Layer**: UI components and event handling
- **Infrastructure**: Model loaders and export utilities

## Development

```bash
# Development server
npm run dev

# Production build
npm run build
```

## License

MIT License - see LICENSE file for details
