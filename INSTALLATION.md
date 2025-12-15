# Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Edge, Firefox, or Safari)

Check your versions:
```bash
node --version    # Should be v16.0.0 or higher
npm --version     # Should be 7.0.0 or higher
```

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd c:\repo\be\t\geometric-search
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Three.js (3D rendering engine)
- Vite (build tool and dev server)
- ESLint (code linting)
- Prettier (code formatting)

Expected output:
```
added XX packages in Xs
```

### 3. Verify Installation

Check that all files are present:
```bash
# Windows
dir src
dir src\core
dir src\ui

# Linux/Mac
ls -la src
ls -la src/core
ls -la src/ui
```

Expected structure:
```
geometric-search/
├── node_modules/      (created after npm install)
├── src/
│   ├── core/         (4 files)
│   ├── state/        (2 files)
│   ├── engine/       (2 files)
│   ├── loaders/      (6 files)
│   ├── events/       (1 file)
│   ├── ui/           (6 files)
│   ├── utils/        (2 files)
│   ├── styles/       (1 file)
│   ├── Application.js
│   └── index.js
├── index.html
├── package.json
├── vite.config.js
└── Documentation files (*.md)
```

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

The application will:
- Open automatically in your default browser
- Be available at `http://localhost:3000`
- Support hot module replacement (changes reflect immediately)
- Show errors in an overlay

### Production Build

Build for production:
```bash
npm run build
```

Expected output:
```
vite v5.x.x building for production...
✓ XX modules transformed.
dist/index.html                  X.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB / gzip: XX.XX kB
✓ built in Xs
```

Preview production build:
```bash
npm run preview
```

## Verification Tests

### 1. Visual Verification

After running `npm run dev`, you should see:

✓ Application header: "3D Geometric Search"
✓ Toolbar with buttons: Load Model, Fit to Screen, Reset Camera, etc.
✓ Left sidebar: "Model Structure" with "No model loaded"
✓ Center area: 3D viewer with grid and axes
✓ Right panel: "Properties" with "No section selected"
✓ Clean, professional styling

### 2. Functional Verification

Test basic functionality:

1. **Load Model**
   - Click "📁 Load Model"
   - File dialog should appear
   - Select a .gltf, .glb, .obj, or .stl file
   - Model should load and display

2. **Camera Controls**
   - Left-drag: Model should rotate
   - Right-drag: Camera should pan
   - Scroll: Should zoom in/out
   - Click "🎯 Fit to Screen": Camera should frame model
   - Click "🔄 Reset Camera": Camera should return to default

3. **Section Tree**
   - After loading model, sections should appear in left panel
   - Click section: Should select (blue highlight)
   - Hover section: Should highlight in 3D view (orange)
   - Double-click: Camera should focus on section

4. **Properties Panel**
   - Select a section
   - Right panel should show section details
   - Properties should include Name, Type, ID, etc.

5. **Toolbar Features**
   - Disassemble: Sections should spread apart
   - Reassemble: Sections should return to original positions
   - Fullscreen: Should enter fullscreen mode
   - Clear: Should remove model

### 3. Console Verification

Open browser console (F12) and check for:

✓ "✓ 3D Geometric Search application started"
✓ "Supported formats: glTF/GLB, OBJ/MTL, STL, STEP (partial)"
✓ No errors (red messages)
✗ Some warnings about deprecations are acceptable

### 4. Code Quality Check

Run linting:
```bash
npm run lint
```

Expected: No critical errors (warnings acceptable)

Format code:
```bash
npm run format
```

Expected: "All files formatted successfully"

## Troubleshooting

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- --port 3001
```

Or kill process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Issue: White screen after npm run dev

**Solutions:**
1. Check browser console for errors (F12)
2. Verify all files are present in src/ directory
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try different browser
5. Check that WebGL is enabled: visit chrome://gpu

### Issue: Models not loading

**Solutions:**
1. Verify file format is supported (.gltf, .glb, .obj, .stl)
2. Check file is not corrupted
3. Try a different/smaller file
4. Check browser console for specific error
5. Ensure file size is reasonable (<100MB)

### Issue: Three.js errors in console

**Solutions:**
1. Verify Three.js is installed: `npm list three`
2. Reinstall dependencies: `npm install`
3. Check WebGL support in browser
4. Update graphics drivers

### Issue: UI not responding

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify all .js files are present
3. Clear browser cache
4. Try hard refresh (Ctrl+Shift+R)

## Testing Checklist

- [ ] npm install completes without errors
- [ ] npm run dev starts server successfully
- [ ] Browser opens to http://localhost:3000
- [ ] Application UI displays correctly
- [ ] Can load a 3D model successfully
- [ ] Camera controls work (rotate, pan, zoom)
- [ ] Section tree displays and is interactive
- [ ] Properties panel shows section details
- [ ] Toolbar buttons function correctly
- [ ] No critical console errors
- [ ] npm run build completes successfully

## Next Steps

After successful installation and verification:

1. **Read Documentation**
   - [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference
   - [USER_GUIDE.md](USER_GUIDE.md) - How to use
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide

2. **Try Features**
   - Load different file formats
   - Explore section tree
   - Try disassemble/reassemble
   - Test fullscreen mode

3. **Customize**
   - Modify styles in src/styles/main.css
   - Add new features following DEVELOPMENT.md
   - Extend with new file format loaders

4. **Deploy**
   - Build for production: `npm run build`
   - Deploy dist/ folder to hosting service
   - See DEVELOPMENT.md for deployment guide

## Support

If you encounter issues not covered here:

1. Check browser console (F12) for error details
2. Review [USER_GUIDE.md](USER_GUIDE.md) troubleshooting section
3. Verify system meets prerequisites
4. Try with a fresh install in new directory

## System Requirements

### Minimum
- CPU: Dual-core 2GHz
- RAM: 4GB
- GPU: WebGL 2.0 compatible
- Browser: Chrome 90, Edge 90, Firefox 88, Safari 14
- Disk: 100MB free space

### Recommended
- CPU: Quad-core 2.5GHz+
- RAM: 8GB+
- GPU: Dedicated graphics with WebGL 2.0
- Browser: Latest Chrome or Edge
- Disk: 500MB free space

## Performance Benchmarks

Expected performance on recommended system:
- Cold start: < 2 seconds
- Load 1MB glTF: < 1 second
- Load 10MB glTF: 2-5 seconds
- Rendering: 60 FPS (models < 10k polygons)
- Memory: ~100MB baseline, +file size

## Success Indicators

Installation is successful when:
✓ No errors during npm install
✓ Dev server starts without errors
✓ Application loads in browser
✓ 3D viewer displays with grid
✓ Can load and view 3D models
✓ All UI interactions work
✓ Console shows success message

---

**Installation complete!** You now have a fully functional 3D geometric search application.
