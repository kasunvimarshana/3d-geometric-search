# STEP Format Guide

## Overview

This guide explains the STEP (Standard for the Exchange of Product model data) file format, why it requires special handling in web applications, and provides recommended workflows for using STEP files with this 3D viewer.

## Table of Contents

- [What is STEP?](#what-is-step)
- [Why STEP Files Aren't Directly Supported](#why-step-files-arent-directly-supported)
- [Recommended Workflow](#recommended-workflow)
- [Conversion Tools](#conversion-tools)
- [Technical Details](#technical-details)
- [Future Roadmap](#future-roadmap)

---

## What is STEP?

**STEP** (ISO 10303) is an international standard for the computer-interpretable representation and exchange of product manufacturing information. It's widely used in:

- **CAD/CAM Systems**: Mechanical design, engineering
- **Aerospace Industry**: Aircraft and spacecraft components
- **Automotive Industry**: Vehicle design and manufacturing
- **Manufacturing**: CNC machining, 3D printing preparation
- **Architecture**: Building Information Modeling (BIM)

### STEP Application Protocols (AP)

STEP defines several Application Protocols for different industries:

| Protocol  | Name                                                                   | Use Case                                                                  |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **AP203** | Configuration Controlled 3D Designs of Mechanical Parts and Assemblies | General mechanical CAD data exchange                                      |
| **AP214** | Core Data for Automotive Mechanical Design Processes                   | Automotive industry standard                                              |
| **AP242** | Managed Model Based 3D Engineering                                     | Modern unified standard, includes Product Manufacturing Information (PMI) |

### File Extensions

- `.step` - Standard extension
- `.stp` - Alternative extension (more common in Windows environments)

---

## Why STEP Files Aren't Directly Supported

While this application supports GLTF, GLB, OBJ, and STL formats directly in the browser, STEP files present unique challenges:

### 1. Complex Data Structure

STEP files contain:

- **Parametric geometry** (curves, surfaces defined by mathematical equations)
- **Assembly hierarchies** (parent-child relationships, constraints)
- **Metadata** (material properties, tolerances, manufacturing data)
- **Product Manufacturing Information (PMI)** (dimensions, annotations)

This is far more complex than the simple triangle mesh data used by web-friendly formats.

### 2. Parser Complexity

- STEP parsing requires sophisticated CAD kernel libraries (e.g., OpenCascade)
- OpenCascade.js (WebAssembly port) is over **50MB** - impractical for web applications
- Parsing STEP files can take significant time and memory
- Browser environments have memory constraints

### 3. Format Philosophy

- **STEP**: Designed for CAD systems, preserves design intent and parametric history
- **GLTF/OBJ/STL**: Designed for visualization/rendering, uses pre-tessellated geometry
- Web browsers excel at rendering triangles, not evaluating NURBS surfaces

### 4. Industry Practice

Even professional CAD applications typically convert STEP → tessellated format for real-time 3D viewing. The STEP file itself is used for:

- Design modification
- Manufacturing data
- Quality control
- Archive/documentation

---

## Recommended Workflow

To use STEP files with this viewer, convert them to GLTF format first:

### Quick Conversion Process

```
STEP File (.step/.stp)
    ↓
[CAD Software] → Export as GLTF
    ↓
GLTF File (.gltf/.glb)
    ↓
[Load in 3D Viewer]
```

### Best Practices

1. **Preserve Scale**: Ensure units are consistent during export
2. **Optimize Geometry**: Reduce polygon count for web viewing if needed
3. **Include Materials**: Export with materials/colors from original model
4. **Use GLB**: Binary GLTF (.glb) is more efficient than text GLTF (.gltf)

---

## Conversion Tools

### Free & Open Source

#### 1. **FreeCAD** (Recommended)

- **Platform**: Windows, macOS, Linux
- **Download**: https://www.freecadweb.org/
- **Steps**:
  1. Open STEP file: `File → Open`
  2. Export as GLTF: `File → Export → GLTF/GLB`
  3. Choose GLB format for better compression

**Pros**:

- Free and open source
- Native STEP support (uses OpenCascade)
- Direct GLTF export
- Batch scripting possible

**Cons**:

- Learning curve for new users
- Interface less polished than commercial CAD

#### 2. **Blender with CAD Importer**

- **Platform**: Windows, macOS, Linux
- **Download**: https://www.blender.org/
- **Plugin Required**: "CAD Sketcher" or similar add-on
- **Steps**:
  1. Install STEP import add-on
  2. Import STEP: `File → Import → STEP`
  3. Export as GLTF: `File → Export → glTF 2.0`

**Pros**:

- Powerful mesh editing tools
- Excellent GLTF export options
- Can optimize geometry for web

**Cons**:

- Requires add-on for STEP import
- More complex interface
- May require geometry cleanup

### Commercial Tools

#### 3. **Autodesk Fusion 360** (Free for Hobbyists)

- **Platform**: Windows, macOS
- **Download**: https://www.autodesk.com/products/fusion-360/
- **Steps**:
  1. Import STEP file
  2. Right-click component → "Save as STL/OBJ"
  3. Use online converter: STL → GLTF

**Note**: Fusion 360 doesn't export GLTF directly, requires intermediate format.

#### 4. **SolidWorks, CATIA, NX, etc.**

Most professional CAD systems can export to STEP and intermediate formats (STL, OBJ), which can then be converted to GLTF.

### Online Converters

#### 5. **Online 3D Converter Services**

- **Aspose 3D Converter**: https://products.aspose.app/3d/conversion/step-to-gltf
- **AnyConv**: https://anyconv.com/step-to-gltf-converter/

**Pros**:

- No software installation
- Quick for small files

**Cons**:

- File size limits
- Privacy concerns (uploading proprietary models)
- Limited control over tessellation quality

---

## Technical Details

### STEP File Structure

STEP files use a text-based format (ISO 10303-21):

```step
ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('STEP AP203'),'1');
FILE_NAME('part.stp','2024-01-15T10:00:00',...);
FILE_SCHEMA(('CONFIG_CONTROL_DESIGN'));
ENDSEC;
DATA;
#1=CARTESIAN_POINT('',(0.,0.,0.));
#2=DIRECTION('',(0.,0.,1.));
#3=AXIS2_PLACEMENT_3D('',#1,#2,#4);
...
ENDSEC;
END-ISO-10303-21;
```

Each line defines an entity with relationships to other entities by reference numbers.

### Why Conversion is Necessary

| Aspect              | STEP                                   | GLTF                          |
| ------------------- | -------------------------------------- | ----------------------------- |
| **Geometry Type**   | NURBS, B-splines, analytical surfaces  | Triangle meshes               |
| **Data Size**       | Compact (mathematical definitions)     | Larger (explicit vertices)    |
| **Processing**      | Requires tessellation/evaluation       | Ready to render               |
| **Metadata**        | Extensive (PMI, tolerances, materials) | Basic (materials, animations) |
| **Browser Support** | None native                            | Excellent (WebGL)             |

### Tessellation

Conversion from STEP to GLTF involves **tessellation**:

- Analytical surfaces (cylinders, spheres, NURBS) are converted to triangles
- Quality controlled by parameters (tolerance, chord height, angular tolerance)
- Trade-off between visual quality and file size/performance

---

## Future Roadmap

### Potential Implementation Options

#### Option 1: Server-Side Conversion (Most Practical)

**Architecture**:

```
Browser → Upload STEP → Server (OpenCascade) → Convert to GLTF → Return to Browser
```

**Pros**:

- No browser size/memory constraints
- Use full OpenCascade library
- Can process large/complex files

**Cons**:

- Requires backend infrastructure
- Upload/download overhead
- Privacy/security considerations

**Implementation Priority**: Medium (requires backend setup)

#### Option 2: WebAssembly STEP Parser (Experimental)

**Using OpenCascade.js**:

- Compile OpenCascade to WebAssembly
- Load in browser as module (~50MB+)
- Parse and convert client-side

**Pros**:

- Client-side processing
- No server required

**Cons**:

- Very large download (50MB+)
- Performance concerns on mobile
- Memory intensive

**Implementation Priority**: Low (not practical for most use cases)

#### Option 3: Hybrid Approach

**Features**:

- Client-side detection of STEP files
- Automatic upload to conversion service
- Progress indication during conversion
- Automatic loading of converted GLTF

**Implementation Priority**: High (best user experience)

### Current Status

- **Direct Support**: ❌ Not implemented
- **Documentation**: ✅ Complete
- **Recommended Workflow**: ✅ FreeCAD conversion
- **Future Enhancement**: 📋 Roadmap item

---

## Frequently Asked Questions

### Q: Why can't I load STEP files directly?

**A**: STEP files contain parametric CAD data that requires specialized parsing libraries. Web browsers are optimized for rendering triangle meshes (like GLTF), not evaluating mathematical surface definitions.

### Q: Will STEP support be added in the future?

**A**: Potentially, through a server-side conversion service. Direct browser-based STEP parsing is impractical due to library size and complexity.

### Q: What's the best format to use?

**A**: **GLB** (Binary GLTF) is the recommended format for this viewer. It's optimized for web use, widely supported, and includes materials/textures.

### Q: Will conversion lose data?

**A**: Conversion to GLTF converts parametric surfaces to triangle meshes (tessellation). Visual appearance is preserved, but parametric editability is lost. This is acceptable for visualization but not for further CAD editing.

### Q: Can I batch convert STEP files?

**A**: Yes, FreeCAD supports Python scripting for batch conversion. See [FreeCAD Python Scripting](https://wiki.freecadweb.org/Python_scripting_tutorial).

### Q: What about IFC files (BIM)?

**A**: IFC (Industry Foundation Classes) is similar to STEP but for building/architecture. It has the same challenges and requires conversion to GLTF using tools like BlenderBIM or FreeCAD.

---

## Example: FreeCAD Batch Conversion Script

For automated conversion of multiple STEP files:

```python
import FreeCAD
import Mesh
import os

def convert_step_to_glb(step_file, output_file):
    """Convert STEP file to GLB format"""
    # Open STEP file
    doc = FreeCAD.newDocument("temp")
    FreeCAD.ActiveDocument = doc

    # Import STEP
    import Part
    Part.insert(step_file, "temp")

    # Export as GLB
    import ImportGLTF
    ImportGLTF.export([doc.Objects[0]], output_file)

    # Close document
    FreeCAD.closeDocument("temp")
    print(f"Converted: {step_file} -> {output_file}")

# Batch convert all STEP files in a directory
input_dir = "/path/to/step/files"
output_dir = "/path/to/output/glb"

for filename in os.listdir(input_dir):
    if filename.endswith((".step", ".stp")):
        input_path = os.path.join(input_dir, filename)
        output_path = os.path.join(output_dir, filename.replace(".step", ".glb").replace(".stp", ".glb"))
        convert_step_to_glb(input_path, output_path)
```

**Usage**:

```bash
freecad --console batch_convert.py
```

---

## Additional Resources

### Standards & Documentation

- **ISO 10303 Official**: https://www.iso.org/standard/63141.html
- **STEP Tools**: https://www.steptools.com/
- **CAx Implementor Forum**: https://www.cax-if.org/

### Conversion Tools Documentation

- **FreeCAD Export Guide**: https://wiki.freecadweb.org/Export_to_STL_or_OBJ
- **Blender GLTF Export**: https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html

### File Format Specifications

- **GLTF 2.0 Spec**: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **STEP Part 21 (File Format)**: ISO 10303-21

---

## Support

If you have questions about STEP file conversion or encounter issues:

1. **Check this guide** for recommended workflows
2. **FreeCAD Community**: https://forum.freecadweb.org/
3. **GitHub Issues**: Report application-specific issues

---

**Last Updated**: 2024  
**Version**: 1.2.0  
**Status**: STEP format not directly supported, conversion workflow documented
