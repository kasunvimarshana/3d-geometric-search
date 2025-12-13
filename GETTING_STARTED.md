# Getting Started with 3D Geometric Search

This guide will help you get the application up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`

- **npm** (comes with Node.js)
  - Verify installation: `npm --version`

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required dependencies including:
- Three.js (3D graphics library)
- Vite (build tool and dev server)
- ESLint (code quality)
- Prettier (code formatting)

### 2. Start the Development Server

```bash
npm run dev
```

You should see output similar to:

```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 3. Open in Browser

The application will automatically open in your default browser, or you can manually navigate to:

```
http://localhost:3000
```

## First Use

When you first open the application, you'll see:

1. **Control Panel** (left side)
   - Model selector dropdown
   - Load Model button
   - View controls (disabled until model is loaded)

2. **3D Viewer** (right side)
   - Empty scene with grid and axes

### Loading Your First Model

1. Click the **model selector dropdown**
2. Choose a model (e.g., "Simple Cube")
3. Click **"Load Model"**

The application will:
- Load the model (or create demo geometry if file not found)
- Automatically detect and organize sections
- Display the model in the 3D viewer
- Enable all controls

### Interacting with the Model

**Camera Controls:**
- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag
- **Zoom**: Mouse wheel

**Section Controls:**
- **Highlight**: Click the eye icon (👁) next to a section
- **Isolate**: Click the magnifier icon (🔍)
- **Expand/Collapse**: Click arrow (▼/▶) for sections with children

**View Controls:**
- **Reset View**: Returns camera to default position
- **Refresh**: Reloads the current model
- **Fullscreen**: Toggle fullscreen mode
- **Zoom Slider**: Manual zoom control

## Adding Your Own Models

### Step 1: Prepare Your Model

1. Ensure your model is in **GLTF** (`.gltf`) or **GLB** (`.glb`) format
2. Keep file size under 50MB for best performance
3. Name the file without spaces (use hyphens or underscores)

### Step 2: Add to Project

Copy your model file to:
```
public/models/your-model.gltf
```

### Step 3: Register the Model

Open `src/repositories/ModelRepository.js` and add your model:

```javascript
initializeModels() {
  return [
    // Existing models...
    new Model(
      'my-model',                    // Unique ID
      'My Custom Model',             // Display name
      '/models/your-model.gltf',    // File path
      'gltf'                         // Format
    ),
  ];
}
```

### Step 4: Reload the Application

Refresh your browser and select your model from the dropdown.

## Building for Production

When you're ready to deploy:

```bash
npm run build
```

This creates optimized files in the `dist/` directory that can be deployed to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, Vite will automatically try the next available port (3001, 3002, etc.).

### Model Not Loading

The application includes fallback demo geometry. If you see a simple building instead of your model:

1. Check that the model file exists in `public/models/`
2. Verify the file path in `ModelRepository.js` is correct
3. Check the browser console (F12) for error messages
4. Ensure the model format is supported (GLTF/GLB)

### Dependencies Not Installing

If `npm install` fails:

1. Delete `node_modules/` folder
2. Delete `package-lock.json`
3. Run `npm install` again

If issues persist, try:
```bash
npm cache clean --force
npm install
```

### Browser Compatibility

The application works best with modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari

Ensure your browser is up to date.

## Next Steps

- **Read the [README.md](README.md)** for full feature documentation
- **Check [ARCHITECTURE.md](ARCHITECTURE.md)** to understand the codebase
- **Review [DEVELOPMENT.md](DEVELOPMENT.md)** for development guidelines
- **Explore the code** starting from `src/main.js`

## Quick Reference

### Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check code quality
npm run lint

# Format code
npm run format
```

### Keyboard Shortcuts (in browser)

- **F11**: Fullscreen browser
- **F12**: Open developer console
- **Ctrl/Cmd + R**: Reload page

## Need Help?

- Check the browser console (F12) for error messages
- Review the documentation files
- Check that all dependencies are installed
- Ensure you're using a supported Node.js version

## What's Next?

Once you're comfortable with the basics:

1. **Customize the UI** - Edit `src/styles/main.css`
2. **Add features** - Follow patterns in existing code
3. **Optimize models** - Reduce polygon count for better performance
4. **Deploy** - Build and host on your preferred platform

Enjoy building with 3D Geometric Search! 🚀
