# 3D Geometric Viewer v3.0 - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will open at **http://localhost:5173**

## 🎯 First Steps

### 1. **Load a Model**

**Option A: Sample Models**

- Click the "Models" tab in sidebar
- Select a model from dropdown
- Click "Load" button

**Option B: From URL**

- Enter a model URL (glTF, GLB, OBJ, STL, STEP)
- Click "Load" button

**Option C: From File**

- Click "Choose File"
- Select a model file from your computer
- Click "Load" button

### 2. **Navigate the 3D View**

- **Rotate**: Left-click + drag
- **Pan**: Right-click + drag
- **Zoom**: Scroll wheel
- **Reset View**: Press **R** or click "Reset View"

### 3. **Explore Sections**

- Click "Sections" tab
- View hierarchical section tree
- Click sections to select/highlight
- Use search box to filter sections

### 4. **Customize View**

- Click "Settings" tab
- Choose camera presets (Front, Top, Right, etc.)
- Toggle wireframe, grid, axes
- Switch between light/dark theme (sun/moon icon)

## ⌨️ Keyboard Shortcuts

| Shortcut         | Action                         |
| ---------------- | ------------------------------ |
| **R**            | Reset camera view              |
| **F**            | Focus on selected model        |
| **G**            | Toggle grid visibility         |
| **Esc**          | Exit focus mode or close modal |
| **Ctrl+Z**       | Undo last action               |
| **Ctrl+Shift+Z** | Redo action                    |
| **?**            | Show help (click help icon)    |

## 🎨 User Interface

### Header Bar

- **Logo & Title**: Application branding
- **Theme Toggle**: Switch light/dark mode
- **Sidebar Toggle**: Show/hide controls
- **Help**: View keyboard shortcuts

### Sidebar (320px)

- **Models Tab**: Load and manage models
- **Sections Tab**: Browse section hierarchy
- **Settings Tab**: View controls and display options

### Viewer Area

- **3D Canvas**: Main visualization area
- **Info Overlay**: Section information
- **Loading Indicator**: Progress feedback

### Status Bar

- **Left**: Current model status
- **Center**: Section count
- **Right**: Camera info

## 📦 Supported File Formats

### **Priority 1** (Full Support)

- ✅ **glTF** (.gltf) - GL Transmission Format (JSON)
- ✅ **GLB** (.glb) - Binary glTF
- ✅ **OBJ** (.obj) - Wavefront Object
- ✅ **STL** (.stl) - Stereolithography

### **Priority 2** (Conversion Required)

- ⚙️ **STEP** (.step, .stp) - Requires conversion service

## 🎓 Common Tasks

### Export a Model

1. Load a model
2. Click "Models" tab
3. Select export format from dropdown
4. Click "Export" button
5. File downloads automatically

### Select Multiple Sections

1. Click "Sections" tab
2. Hold **Ctrl** (or **Cmd** on Mac)
3. Click multiple sections
4. Selected sections highlight in 3D view

### Isolate a Section

1. Select a section in tree
2. Right-click section (or use context menu)
3. Choose "Isolate"
4. Press **Esc** to exit isolation

### Change Camera Angle

1. Click "Settings" tab
2. Click camera preset button (Front, Top, etc.)
3. Or use mouse to manually rotate

## 🐛 Troubleshooting

### Model Won't Load

- Check file format is supported
- Verify file is not corrupted
- Check browser console for errors
- Try a different model format

### Performance Issues

- Close unused browser tabs
- Reduce model complexity
- Disable shadows in settings
- Use wireframe mode for large models

### UI Not Responding

- Check browser console for JavaScript errors
- Try refreshing page (F5)
- Clear browser cache
- Update to latest browser version

## 🔧 Developer Console

Open browser DevTools (F12) and access application:

```javascript
// Global app instance
window.app;

// View state
app.getState();

// Export model
app.exportModel(modelId, 'glb');

// Get services
app.getServices();

// Event history
app.eventBus.getHistory();
```

## 📚 Advanced Features

### State Management

- **Undo/Redo**: Full history tracking
- **Time Travel**: Navigate through state changes
- **State Export**: Save/load application state

### Event System

- **Event Bus**: Pub/sub architecture
- **Event History**: Last 100 events tracked
- **Wildcard Listeners**: Monitor all events

### Theme System

- **Light/Dark Themes**: Automatic or manual
- **Persistent**: Saved to localStorage
- **Customizable**: CSS variables

## 🎯 Next Steps

1. **Explore Sample Models**: Try different file formats
2. **Test Section Management**: Navigate hierarchies
3. **Customize View**: Experiment with camera angles
4. **Export Models**: Try different export formats
5. **Read Documentation**: Check `/docs` folder

## 📖 Additional Resources

- [Architecture Design](./V3_ARCHITECTURE_DESIGN.md)
- [Implementation Plan](./V3_IMPLEMENTATION_PLAN.md)
- [Integration Complete](./V3_INTEGRATION_COMPLETE.md)
- [Testing Checklist](./TESTING_CHECKLIST.md)

## 🆘 Support

- Check console for error messages
- Review documentation in `/docs`
- Inspect network tab for loading issues
- Use `window.app` for debugging

## ✨ Tips & Tricks

1. **Double-click** section name to frame it in view
2. **Hold Shift** while clicking for range selection
3. **Right-click** on canvas for context menu
4. **Press ?** for quick keyboard shortcut reference
5. **Use Ctrl+Z** liberally - full undo support!

---

**Ready to build amazing 3D visualizations!** 🚀

For more details, see the [Integration Complete](./V3_INTEGRATION_COMPLETE.md) document.
