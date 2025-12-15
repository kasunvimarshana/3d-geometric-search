# Troubleshooting Common Issues

## "Section is not defined" Error in OBJLoader

### Symptoms

```
Failed to load OBJ file: Section is not defined
```

### Cause

This is typically caused by browser caching old module versions after code changes.

### Solutions

#### Solution 1: Hard Refresh (Fastest)

1. In your browser, press **Ctrl + Shift + R** (Windows/Linux) or **Cmd + Shift + R** (Mac)
2. This forces the browser to reload all modules without cache
3. Try loading your OBJ file again

#### Solution 2: Clear Browser Cache

1. Press **F12** to open Developer Tools
2. Right-click the **Refresh** button
3. Select **"Empty Cache and Hard Reload"**
4. Try loading your OBJ file again

#### Solution 3: Restart Dev Server

1. In your terminal, press **Ctrl + C** to stop the dev server
2. Run `npm run dev` again
3. The browser will open with fresh modules
4. Try loading your OBJ file again

#### Solution 4: Clear Vite Cache

```bash
# Stop the dev server (Ctrl+C)

# Remove Vite cache
rm -rf node_modules/.vite

# Or on Windows PowerShell:
Remove-Item -Recurse -Force node_modules/.vite

# Restart dev server
npm run dev
```

#### Solution 5: Disable Browser Cache (Development)

1. Open DevTools (F12)
2. Go to **Network** tab
3. Check **"Disable cache"** checkbox
4. Keep DevTools open while developing
5. This prevents all caching issues during development

### Verification

After applying a solution:

1. Open browser console (F12)
2. Check for the success message: "✓ 3D Geometric Search application started"
3. Try loading an OBJ file
4. Should load without errors

---

## Other Common Errors

### "Failed to load glTF file: Box3 is not defined"

**Solution:** Hard refresh browser (Ctrl+Shift+R)

### "Failed to load model: TypeError: Cannot read property 'traverse' of undefined"

**Solutions:**

1. Verify file is valid 3D format
2. Check file is not corrupted
3. Try smaller/simpler file first
4. Check browser console for specific error

### "WebGL context lost" or black 3D viewer

**Solutions:**

1. Refresh browser (F5)
2. Update graphics drivers
3. Check GPU isn't overheating
4. Try different browser
5. Verify WebGL is enabled: visit `chrome://gpu`

### UI not updating after code changes

**Solutions:**

1. Hard refresh (Ctrl+Shift+R)
2. Check DevTools console for errors
3. Verify Vite dev server is running
4. Check terminal for HMR (Hot Module Replacement) messages

### "npm run dev" fails to start

**Solutions:**

1. Check port 3000 is not in use:

   ```bash
   # Windows
   netstat -ano | findstr :3000

   # Linux/Mac
   lsof -ti:3000
   ```

2. Kill process using port or use different port:
   ```bash
   npm run dev -- --port 3001
   ```
3. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Models load but don't appear in viewer

**Solutions:**

1. Click **"Fit to Screen"** button
2. Try zooming out (scroll wheel)
3. Check model has valid geometry
4. Check console for warnings about materials

### Section tree shows "No model loaded" despite successful load

**Solutions:**

1. Check StateManager is properly initialized
2. Hard refresh browser
3. Check console for state-related errors
4. Verify EventOrchestrator is emitting events

---

## Prevention Tips

### During Development

- Keep DevTools open with "Disable cache" checked
- Watch terminal for Vite HMR messages
- Hard refresh after major code changes
- Clear Vite cache if modules seem stale

### Before Testing

- Stop and restart dev server
- Clear browser cache
- Use incognito/private window for clean test

### Best Practices

- Test with small files first (< 1MB)
- Check console after every file load
- Verify each feature incrementally
- Keep browser and Node.js updated

---

## Debug Mode

Enable verbose logging:

1. Open browser console (F12)
2. Run:

```javascript
localStorage.setItem('DEBUG', 'true');
location.reload();
```

3. You'll see detailed logs for:
   - State changes
   - Event emissions
   - Loader operations
   - Engine updates

Disable debug mode:

```javascript
localStorage.removeItem('DEBUG');
location.reload();
```

---

## Still Having Issues?

1. **Check System Requirements**
   - Node.js 16+
   - Modern browser with WebGL 2.0
   - Updated graphics drivers

2. **Verify Installation**
   - Run `npm list` to check dependencies
   - Ensure all files present in src/ directory
   - Check no TypeScript errors in console

3. **Test with Known Good File**
   - Download sample glTF from https://github.com/KhronosGroup/glTF-Sample-Models
   - Try loading it first
   - If sample works, issue is with your file

4. **Fresh Install**
   ```bash
   # Backup your changes
   # Delete and reinstall
   rm -rf node_modules package-lock.json node_modules/.vite
   npm install
   npm run dev
   ```

---

## Reporting Issues

If problems persist, gather:

- Browser name and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Complete error message from console
- Steps to reproduce
- File type and size being loaded
