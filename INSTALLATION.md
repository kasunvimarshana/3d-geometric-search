# Installation & Verification

This document guides you through installing dependencies and verifying the application is working correctly.

## Step 1: Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

Expected output:
```
added XXX packages, and audited XXX packages in XXs
```

## Step 2: Start Development Server

```bash
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 3: Verify in Browser

1. Open http://localhost:3000 in your browser
2. You should see:
   - Control panel on the left
   - 3D viewer on the right with grid and axes
   - Model selector dropdown

## Step 4: Test Basic Functionality

### Test 1: Load Model
1. Select a model from dropdown (e.g., "Simple Cube")
2. Click "Load Model"
3. ✅ Model should appear in viewer (or demo geometry if file not found)
4. ✅ Sections should appear in the sections list

### Test 2: Camera Controls
1. **Rotate**: Left-click and drag on the viewer
   - ✅ Camera should rotate around the model
2. **Pan**: Right-click and drag
   - ✅ Camera should pan
3. **Zoom**: Use mouse wheel
   - ✅ Camera should zoom in/out

### Test 3: Section Management
1. Click the eye icon (👁) next to a section
   - ✅ Section should be highlighted in blue
2. Click the magnifier icon (🔍) next to a section
   - ✅ Only that section should be visible
3. Click the icon again
   - ✅ All sections should reappear

### Test 4: View Controls
1. Click "Reset View"
   - ✅ Camera should return to default position
   - ✅ All sections should be visible
   - ✅ Zoom should reset to 100%
2. Click "Refresh"
   - ✅ Model should reload
3. Click "Fullscreen"
   - ✅ Control panel should hide
   - ✅ Viewer should expand

### Test 5: Zoom Slider
1. Move the zoom slider
   - ✅ Zoom percentage should update
   - ✅ View should zoom in/out

## Step 5: Check Browser Console

Press F12 to open developer tools and check the Console tab:

✅ Should see: "Application started successfully"  
✅ No red errors should appear  
⚠️ Warnings about model files not found are normal (demo geometry is used)

## Verification Checklist

- [ ] Dependencies installed successfully
- [ ] Development server starts without errors
- [ ] Application loads in browser
- [ ] UI elements are visible and styled correctly
- [ ] Can select and load models
- [ ] Camera controls work (rotate, pan, zoom)
- [ ] Section highlighting works
- [ ] Section isolation works
- [ ] Reset view works
- [ ] Zoom slider works
- [ ] Fullscreen toggle works
- [ ] No console errors (warnings are OK)

## Common Issues & Solutions

### Issue: npm install fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules if it exists
rm -rf node_modules
rm package-lock.json

# Try again
npm install
```

### Issue: Port 3000 already in use

**Solution:**  
Vite will automatically use the next available port (3001, 3002, etc.)  
Check the terminal output for the actual port number.

### Issue: Cannot find module 'three'

**Solution:**
```bash
# Install Three.js explicitly
npm install three
```

### Issue: Blank page in browser

**Solution:**
1. Check browser console (F12) for errors
2. Make sure development server is running
3. Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
4. Try a different browser

### Issue: Viewer shows grid but no model

**Solution:**  
This is normal! The application will:
1. Try to load the model file
2. If file not found, use demo geometry instead
3. Demo geometry is a simple building structure

## Building for Production

After verification, you can build for production:

```bash
npm run build
```

Expected output:
```
vite v5.0.0 building for production...
✓ XXX modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js       XXX.XX kB
✓ built in XXXXms
```

Preview the production build:

```bash
npm run preview
```

## System Requirements

### Minimum Requirements
- Node.js 16.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 100 MB free disk space

### Recommended
- Node.js 18.x or higher
- Chrome or Edge (latest version)
- 500 MB free disk space

## Browser Compatibility

✅ Chrome/Edge 90+  
✅ Firefox 88+  
✅ Safari 14+  
⚠️ Internet Explorer: Not supported

## Performance Verification

### Expected Performance
- **Initial Load**: < 2 seconds
- **Model Load**: < 1 second (with demo geometry)
- **FPS**: 60 FPS on modern hardware
- **Memory**: < 100 MB for demo models

### Check FPS
Open browser console and run:
```javascript
let lastTime = performance.now();
let frames = 0;
setInterval(() => {
  const now = performance.now();
  const fps = Math.round(frames * 1000 / (now - lastTime));
  console.log('FPS:', fps);
  frames = 0;
  lastTime = now;
}, 1000);
function countFrame() {
  frames++;
  requestAnimationFrame(countFrame);
}
countFrame();
```

Expected: 55-60 FPS

## Next Steps

After successful verification:

1. ✅ Read [README.md](README.md) for full documentation
2. ✅ Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase
3. ✅ Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
4. ✅ Add your own 3D models to `public/models/`
5. ✅ Customize the application to your needs

## Success!

If all tests pass, your installation is complete and the application is ready to use! 🎉

## Getting Help

If you encounter issues:

1. Check the browser console for errors (F12)
2. Review this verification document
3. Check [GETTING_STARTED.md](GETTING_STARTED.md)
4. Review the README troubleshooting section
5. Ensure you're using a supported Node.js version
6. Try in a different browser

## Technical Verification (Advanced)

For developers who want to verify the architecture:

```javascript
// In browser console, after app loads:

// Verify core systems
console.log('EventBus:', typeof app.eventBus);              // should be 'object'
console.log('StateManager:', typeof app.stateManager);      // should be 'object'
console.log('ViewerController:', typeof app.viewerController); // should be 'object'

// Check Three.js scene
console.log('Scene:', app.viewerController.scene);
console.log('Camera:', app.viewerController.camera);
console.log('Renderer:', app.viewerController.renderer);

// Verify state management
console.log('Current State:', app.stateManager.getState());
```

All should return valid objects/values without errors.

---

**Congratulations!** Your 3D Geometric Search application is installed and verified! 🚀
