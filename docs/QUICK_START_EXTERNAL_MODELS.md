# Quick Start: Loading External Models

This guide shows you how to quickly load your own 3D models into the application.

## 🎯 Quick Examples

### Example 1: Load from Public URL

Try loading a sample model from the web:

```
URL: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf
```

**Steps:**

1. Start the app: `npm run dev`
2. Open http://localhost:3000
3. Find the "External Model" section
4. Paste the URL above into the "Model URL" field
5. Click "Load URL"

### Example 2: Load Your Own File

**Steps:**

1. Have a `.gltf` or `.glb` file ready on your computer
2. In the app, find the "External Model" section
3. Click the "Choose File" button
4. Select your model file
5. Click "Load File"

## 📦 Where to Find Free Models

### Recommended Sources

1. **Sketchfab** - https://sketchfab.com
   - Huge collection of 3D models
   - Many free downloadable models
   - Filter by "Downloadable" and look for GLTF format

2. **glTF Sample Models** - https://github.com/KhronosGroup/glTF-Sample-Models
   - Official Khronos sample models
   - Great for testing
   - Various complexity levels

3. **Poly Haven** - https://polyhaven.com/models
   - High-quality free models
   - CC0 license (public domain)
   - Architectural and prop models

4. **Free3D** - https://free3d.com
   - Large collection
   - Filter for GLTF/GLB format
   - Free and paid options

5. **TurboSquid** - https://www.turbosquid.com
   - Professional models
   - Free section available
   - Look for GLTF format

## 🔧 Converting Models to GLTF

If you have models in other formats (OBJ, FBX, etc.), convert them:

### Online Converters

1. **gltf.report** - https://gltf.report
   - Upload and validate GLTF files
   - Simple interface

2. **Blackthread.io** - https://products.aspose.app/3d/conversion
   - Convert various formats to GLTF
   - Free online tool

### Desktop Tools

1. **Blender** (Free)
   - Import: File → Import → [Your Format]
   - Export: File → Export → glTF 2.0 (.gltf/.glb)
   - Choose GLB for single-file output

2. **FBX Converter** (Free)
   - Autodesk's official converter
   - Convert FBX to other formats
   - Then use Blender for GLTF

## 🎨 Creating Your Own Models

### Recommended Software

1. **Blender** - https://www.blender.org (Free, Open Source)
   - Full 3D modeling suite
   - Native GLTF export
   - Huge community

2. **SketchUp Free** - https://app.sketchup.com (Free, Web-based)
   - Easy to learn
   - Good for architecture
   - Use plugins for GLTF export

3. **Tinkercad** - https://www.tinkercad.com (Free, Web-based)
   - Beginner-friendly
   - Basic 3D modeling
   - Export as STL, then convert

### Tips for Good Models

1. **Keep it simple**: Start with 10k-50k polygons
2. **Name your parts**: Give meaningful names to model parts for better section organization
3. **Use hierarchy**: Organize parts in groups (becomes sections in the app)
4. **Optimize textures**: Use 1024x1024 or 2048x2048 textures
5. **Test first**: View in Blender or online viewer before loading

## 📝 Sample Models to Try

### Simple Models (Good for Testing)

```
Box:
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF/Box.gltf

Cube:
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Cube/glTF/Cube.gltf
```

### Complex Models (More Features)

```
Avocado:
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf

Damaged Helmet:
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf
```

### Architectural Models

```
Simple House (example):
https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SciFiHelmet/glTF/SciFiHelmet.gltf
```

## ⚠️ Common Issues

### "Failed to load model"

**Cause**: CORS restriction or invalid URL

**Solution**:

- Ensure URL is directly to a `.gltf` or `.glb` file
- Check if the server allows CORS
- Try loading as a local file instead
- Use HTTPS URLs when possible

### "Invalid URL format"

**Cause**: Malformed URL

**Solution**:

- Must start with `http://` or `https://`
- Must point directly to model file
- Example: `https://example.com/model.gltf` ✅
- Not: `https://example.com/page-with-model` ❌

### "Please select a GLTF or GLB file"

**Cause**: Wrong file type selected

**Solution**:

- Only `.gltf` and `.glb` files are supported
- Convert other formats using Blender
- Check file extension

### Model appears too small/large

**Solution**:

- Application auto-scales models
- If still wrong, adjust scale in 3D software before exporting
- Use realistic units (meters) when modeling

### Model appears black

**Cause**: Missing materials or lighting issue

**Solution**:

- Check model has materials in 3D software
- Ensure textures are embedded or included
- Try a different model to isolate the issue
- Check model in online GLTF viewer first

## 🚀 Next Steps

Once your model is loaded:

1. **Explore sections** - Click arrows to expand the section tree
2. **Highlight parts** - Click the eye icon (👁) to highlight
3. **Isolate sections** - Click the magnifier (🔍) to focus on one part
4. **Navigate** - Use mouse to rotate, pan, and zoom
5. **Fullscreen** - Click fullscreen for immersive viewing

## 📚 Further Reading

- [EXTERNAL_MODELS.md](EXTERNAL_MODELS.md) - Complete documentation
- [README.md](../README.md) - General usage guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide

## 💡 Pro Tips

1. **Start with GLB**: Binary format, single file, includes textures
2. **Test online first**: Use https://gltf-viewer.donmccurdy.com to validate
3. **Keep backups**: Always keep original source files
4. **Optimize for web**: Use https://gltf.report for optimization
5. **Use descriptive names**: Name model parts clearly for better sections

## 🎓 Learning Resources

### GLTF Format

- Official GLTF Spec: https://www.khronos.org/gltf/
- GLTF Tutorial: https://github.com/KhronosGroup/glTF-Tutorials

### 3D Modeling

- Blender Tutorials: https://www.blender.org/support/tutorials/
- SketchUp School: https://learn.sketchup.com/

### Three.js (underlying library)

- Three.js Docs: https://threejs.org/docs/
- Three.js Examples: https://threejs.org/examples/

## 🆘 Need Help?

If you encounter issues:

1. Check browser console (F12) for error messages
2. Verify model loads in online GLTF viewer
3. Try a known-good sample model
4. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
5. Review the error message in the app

---

**Happy 3D Modeling!** 🎨🎭🏗️
