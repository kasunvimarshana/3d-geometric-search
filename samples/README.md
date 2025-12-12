# Sample 3D Models

This directory contains sample 3D models for testing the application.

## Files

### cube.obj
A simple 3D cube model with 8 vertices and 12 triangular faces.

### pyramid.obj
A simple pyramid model with 5 vertices and 6 triangular faces.

## Usage

1. Open the application in a web browser
2. Click "Choose File" or drag-and-drop these files onto the upload area
3. The models will be loaded, analyzed, and displayed in the 3D viewer
4. Upload multiple models to test the similarity search functionality

## Creating Your Own Models

You can create models in popular 3D modeling software and export them in supported formats:
- **Blender**: Export as glTF, OBJ, or STL
- **Autodesk Fusion 360**: Export as STEP or STL
- **FreeCAD**: Export as STEP, STL, or OBJ
- **SketchUp**: Export as STL or OBJ (with plugin)

## File Format Details

### OBJ Format
Simple text-based format with:
- `v x y z` - vertex coordinates
- `f v1 v2 v3` - triangular faces (vertex indices)

### STL Format
Binary or ASCII format describing triangular mesh surfaces.

### glTF/GLB Format
Modern format with embedded textures and materials (GLB is binary glTF).

### STEP Format
Industry standard for CAD data exchange (requires special parser).
