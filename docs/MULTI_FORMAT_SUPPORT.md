# Multi-Format Support Guide

## Overview

This application provides comprehensive support for industry-standard 3D file formats, from web-optimized formats to complex CAD/engineering standards. The system intelligently handles format conversion, optimization, and loading to provide a seamless experience.

## Supported Formats

### Tier 1: Web-Native Formats (Preferred)

#### **GLTF 2.0 / GLB**

- **Status**: ✅ Fully Supported (Recommended)
- **Description**: Modern, web-optimized 3D format
- **Use Cases**: Web applications, real-time rendering, general 3D visualization
- **Advantages**:
  - Optimized for web delivery (small file size)
  - Supports PBR materials, animations, and scenes
  - Industry standard (Khronos Group)
  - Excellent Three.js support
- **File Extensions**: `.gltf` (JSON + assets), `.glb` (binary)
- **MIME Types**: `model/gltf+json`, `model/gltf-binary`

**Recommendation**: Use GLB (binary) for production as it's more efficient than text-based GLTF.

---

### Tier 2: Common 3D Formats (Fully Supported)

#### **OBJ (Wavefront)**

- **Status**: ✅ Fully Supported
- **Description**: Universal 3D format, widely compatible
- **Use Cases**: Model export/import, general 3D modeling
- **Advantages**:
  - Simple, text-based format
  - Nearly universal support across 3D tools
  - Can include materials via MTL sidecar files
- **Limitations**:
  - No animation support
  - Limited material capabilities compared to GLTF
- **File Extensions**: `.obj` (geometry), `.mtl` (materials)
- **Loading**: Automatically detects and loads associated MTL files

#### **STL (Stereolithography)**

- **Status**: ✅ Fully Supported
- **Description**: Simple mesh format for 3D printing and CAD
- **Use Cases**: 3D printing, CAD export, simple geometry
- **Advantages**:
  - Extremely simple format (just triangle meshes)
  - Standard for 3D printing
  - Both ASCII and binary variants supported
- **Limitations**:
  - No color, texture, or material information
  - No hierarchy or animation
- **File Extensions**: `.stl`, `.stla`
- **Loading**: Automatically computes normals for smooth shading

#### **FBX (Filmbox)**

- **Status**: ✅ Fully Supported
- **Description**: Autodesk's interchange format for 3D content
- **Use Cases**: Game development, animation, VFX
- **Advantages**:
  - Supports complex hierarchies
  - Animation and rigging support
  - Common in game engines (Unity, Unreal)
- **Limitations**:
  - Proprietary format (Autodesk)
  - Larger file sizes
  - Less web-optimized than GLTF
- **File Extensions**: `.fbx`
- **Loading**: Full hierarchy and animation support via Three.js FBXLoader

---

### Tier 3: CAD/Engineering Formats (Conversion Support)

#### **STEP (ISO 10303)**

- **Status**: ⚙️ Automatic Conversion Attempted
- **Description**: Standard for CAD data exchange
- **Use Cases**: Engineering, manufacturing, aerospace, automotive
- **Application Protocols**:
  - **AP203**: Configuration controlled 3D designs
  - **AP214**: Automotive mechanical design
  - **AP242**: Managed model-based 3D engineering (PMI)
- **File Extensions**: `.step`, `.stp`
- **Loading Behavior**:
  1. **File Upload**: Attempts automatic conversion to GLTF via API
  2. **URL**: Requires pre-conversion (manual)
  3. **Fallback**: Provides detailed conversion instructions

**Conversion Workflow**:

```
STEP File → [Conversion Service] → GLTF → Three.js
```

**Manual Conversion Tools**:

- **FreeCAD**: Free, open source, native STEP support
- **Blender**: With CAD importer add-on
- **Online Converters**: Aspose, AnyConv (for non-sensitive models)

See [STEP_FORMAT_GUIDE.md](./STEP_FORMAT_GUIDE.md) for detailed conversion instructions.

---

## Format Selection Guide

### Choose GLTF/GLB When:

- ✅ Building web applications
- ✅ Need optimized loading and performance
- ✅ Require PBR materials and modern rendering
- ✅ Want cross-platform compatibility
- ✅ Need animation support

### Choose OBJ When:

- ✅ Need universal compatibility
- ✅ Working with legacy 3D tools
- ✅ Simple static models without animation
- ✅ Text-based format preferred (easy to edit)

### Choose STL When:

- ✅ 3D printing workflows
- ✅ Pure geometry without materials needed
- ✅ CAD export for visualization
- ✅ Simplest possible format required

### Choose FBX When:

- ✅ Importing from game engines
- ✅ Need complex animation and rigging
- ✅ Working with Autodesk ecosystem
- ✅ Hierarchical scene structures

### Use STEP When:

- ✅ Exchanging CAD data between systems
- ✅ Manufacturing and engineering workflows
- ✅ Need parametric geometry information
- ⚠️ Must convert to GLTF for web viewing

---

## Loading Methods

### 1. URL Loading

```javascript
// Enter URL in the text input
https://example.com/models/mymodel.gltf
https://example.com/models/mymodel.glb
https://example.com/models/mymodel.obj
https://example.com/models/mymodel.stl
https://example.com/models/mymodel.fbx
```

**Supported for**: GLTF, GLB, OBJ, STL, FBX  
**Not supported**: STEP (requires file upload for conversion)

### 2. File Upload

```
Choose File button → Select local file → Load File
```

**Supported for**: All formats (GLTF, GLB, OBJ, STL, FBX, STEP)  
**STEP files**: Automatic conversion attempted

---

## Format Conversion

### STEP Conversion Service

The application includes an intelligent conversion service:

**Architecture**:

```
┌─────────────────────────────────────────────────┐
│  User Uploads STEP File                         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  FormatConversionService                        │
│  - Checks conversion cache                      │
│  - Attempts server-side API conversion          │
│  - Falls back to manual instructions            │
└──────────────┬──────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────────┐
│ API Success │  │ Manual Required │
│ Return GLTF │  │ Show Instructions│
└──────┬──────┘  └────────┬────────┘
       │                  │
       ▼                  ▼
┌─────────────┐  ┌─────────────────┐
│ Load Model  │  │ User Converts   │
│             │  │ Uploads GLTF    │
└─────────────┘  └─────────────────┘
```

**Configuration**:

```javascript
// Custom conversion endpoint
modelLoaderService.conversionService.setConversionEndpoint(
  'step',
  'https://your-conversion-api.com/convert'
);
```

---

## File Format Technical Details

### GLTF 2.0

- **Spec**: <https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html>
- **Structure**: JSON + binary buffers or single GLB
- **Features**: Meshes, materials (PBR), animations, skins, cameras, lights
- **Loader**: Three.js GLTFLoader

### OBJ

- **Spec**: Wavefront OBJ format (de facto standard)
- **Structure**: Text-based with vertex/face data
- **Materials**: MTL sidecar file with texture references
- **Loader**: Three.js OBJLoader + MTLLoader

### STL

- **Spec**: 3D Systems STL format
- **Variants**: ASCII (text) and Binary
- **Structure**: List of triangular facets with normals
- **Loader**: Three.js STLLoader
- **Processing**: Vertex normals computed automatically

### FBX

- **Spec**: Autodesk FBX (proprietary)
- **Structure**: Binary or ASCII with scene graph
- **Features**: Meshes, materials, animations, bones, cameras
- **Loader**: Three.js FBXLoader

### STEP

- **Spec**: ISO 10303 (multiple parts)
- **Structure**: Text-based entity references
- **Features**: Parametric geometry, assemblies, PMI, metadata
- **Requires**: OpenCascade or similar CAD kernel for parsing
- **Conversion**: Tessellation to triangle mesh (GLTF)

---

## Performance Considerations

### File Size Comparison (Typical 1M Triangle Model)

| Format           | Typical Size | Compression | Loading Speed          |
| ---------------- | ------------ | ----------- | ---------------------- |
| **GLB**          | 10-30 MB     | Excellent   | ⚡⚡⚡ Fast            |
| **GLTF**         | 15-40 MB     | Good        | ⚡⚡ Medium            |
| **OBJ**          | 50-100 MB    | Poor        | ⚡ Slow                |
| **STL (Binary)** | 50 MB        | Poor        | ⚡⚡ Medium            |
| **FBX**          | 30-60 MB     | Fair        | ⚡ Slow                |
| **STEP**         | 20-50 MB     | Fair        | ⏳ Requires conversion |

### Optimization Recommendations

**For Web Deployment**:

1. **Always prefer GLB** over other formats
2. **Compress textures** (use KTX2/Basis Universal)
3. **Optimize geometry** (reduce poly count, merge meshes)
4. **Use Draco compression** for GLB files
5. **Enable caching** (service workers, CDN)

**Tools for Optimization**:

- **gltf-pipeline**: Command-line GLTF optimizer
- **gltf.report**: Online analysis and optimization
- **Blender**: Manual optimization and export settings
- **Three.js GLTFExporter**: Programmatic conversion

---

## Error Handling

### Common Issues and Solutions

#### **"Unsupported model type"**

- **Cause**: File extension not recognized
- **Solution**: Ensure file has correct extension (.gltf, .glb, .obj, .stl, .fbx, .step)

#### **"STEP format requires conversion"**

- **Cause**: STEP file loaded via URL or conversion API unavailable
- **Solution**: Convert STEP to GLTF using FreeCAD or Blender

#### **"Failed to load model"**

- **Causes**: Corrupted file, network error, unsupported GLTF features
- **Solutions**:
  - Validate file with online viewers (gltf-viewer.donmccurdy.com)
  - Check network/CORS for URL loading
  - Re-export from source application

#### **"CORS policy error"**

- **Cause**: URL server doesn't allow cross-origin requests
- **Solution**: Download file and use file upload instead

---

## API Reference

### ModelLoaderService

```javascript
// Load any supported format
const object = await modelLoaderService.load(model);

// Check if format requires conversion
const needsConversion = modelLoaderService.conversionService.requiresConversion('step');

// Clear cache
modelLoaderService.dispose();
modelLoaderService.conversionService.clearCache();
```

### FormatConversionService

```javascript
// Convert STEP to GLTF
const result = await conversionService.convertSTEPToGLTF(file, {
  quality: 'high', // 'low', 'medium', 'high'
  tessellation: 'adaptive', // 'adaptive', 'fixed'
});

if (result.success) {
  const gltfBlob = result.data;
  // Load the converted GLTF
} else {
  console.log(result.instructions); // Manual conversion guide
}
```

---

## Future Format Support

### Planned (Roadmap)

- **COLLADA (.dae)**: Open interchange format
- **PLY (.ply)**: Stanford triangle format (point clouds)
- **3DS (.3ds)**: Autodesk 3D Studio format
- **IGES (.iges, .igs)**: CAD exchange format
- **IFC (.ifc)**: Building Information Modeling

### Under Consideration

- **USD (.usd, .usda, .usdc)**: Pixar's Universal Scene Description
- **USDZ (.usdz)**: Apple's AR format
- **glTF XMP**: Extended metadata support
- **Draco Compression**: Built-in decompression

---

## Best Practices

### For Model Creators

1. **Export to GLB** as primary format for web
2. **Include fallback formats** (OBJ, STL) for compatibility
3. **Optimize before export** (poly reduction, texture compression)
4. **Test in viewer** before deployment
5. **Document coordinate systems** and units

### For Developers

1. **Prefer GLB loading** for performance
2. **Implement loading progress** for large files
3. **Cache converted models** to avoid repeated conversion
4. **Provide fallback geometry** for loading errors
5. **Support multiple formats** for user flexibility

### For End Users

1. **Use GLTF/GLB** when available (best performance)
2. **Convert STEP files** before uploading for faster loading
3. **Check file size** before uploading (< 50MB recommended)
4. **Verify model** in external viewer if loading fails
5. **Report issues** with specific file formats

---

## Additional Resources

### Format Specifications

- GLTF 2.0: <https://www.khronos.org/gltf/>
- OBJ Format: <https://en.wikipedia.org/wiki/Wavefront_.obj_file>
- STL Format: <https://en.wikipedia.org/wiki/STL_(file_format)>
- FBX: <https://www.autodesk.com/products/fbx/overview>
- STEP (ISO 10303): <https://www.iso.org/standard/63141.html>

### Conversion Tools

- FreeCAD: <https://www.freecadweb.org/>
- Blender: <https://www.blender.org/>
- gltf-pipeline: <https://github.com/CesiumGS/gltf-pipeline>
- Online Converters: <https://products.aspose.app/3d/conversion>

### Learning Resources

- Three.js Docs: <https://threejs.org/docs/>
- GLTF Tutorial: <https://github.com/KhronosGroup/glTF-Tutorials>
- CAD Export Guide: See [STEP_FORMAT_GUIDE.md](./STEP_FORMAT_GUIDE.md)

---

**Version**: 1.2.0  
**Last Updated**: December 14, 2025  
**Status**: Production Ready
