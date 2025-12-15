# Usage Guide

Complete guide to using the 3D Geometric Search Engine.

## Quick Start

1. **Start the server**

   ```bash
   npm start
   ```

2. **Open browser**

   ```
   http://localhost:3000
   ```

3. **Upload a 3D model**

   - Drag and drop a file
   - Or click the upload area

4. **Search for similar models**
   - Click "Find Similar Models"
   - View results ranked by similarity

## Supported File Formats

### glTF / GLB (Recommended)

- **Best for**: Web applications, real-time rendering
- **Features**: Full support, binary and JSON formats
- **Example**: `model.gltf`, `model.glb`

### STEP (ISO 10303)

- **Best for**: CAD engineering, aerospace, manufacturing
- **Supported**: AP203, AP214, AP242 (basic)
- **Example**: `part.step`, `assembly.stp`
- **Note**: Complex STEP files may require simplification

### Wavefront OBJ

- **Best for**: General 3D modeling, animation
- **Features**: Supports MTL materials
- **Example**: `model.obj` with optional `model.mtl`

### STL (Stereolithography)

- **Best for**: 3D printing, rapid prototyping
- **Supported**: ASCII and binary formats
- **Example**: `part.stl`

## Interface Overview

### Upload Panel (Left)

**Upload Area**

- Drag and drop files
- Click to browse
- Shows upload progress
- Displays file validation errors

**Template Shapes**

- Cube, Sphere, Cylinder, Cone, Torus, Tetrahedron
- Useful for testing and comparison
- Click to load template

**Search Settings**

- **Similarity Threshold**: 0.1 - 1.0 (higher = more similar)
- **Max Results**: 1 - 50 models
- Adjust before searching

**Model Information**

- Format and file details
- Vertex and face counts
- Geometric measurements
- Surface area and volume

### 3D Viewer (Center)

**Controls**

- **Left Mouse**: Rotate camera
- **Right Mouse**: Pan view
- **Scroll Wheel**: Zoom in/out
- **Reset Button**: Return to default view
- **Wireframe**: Toggle wireframe mode
- **Fullscreen**: Expand viewer

**Viewing Tips**

- Rotate to see all angles
- Zoom to inspect details
- Use wireframe for complex models
- Reset if view gets disoriented

### Results Panel (Right)

**My Models**

- All uploaded models
- Click to view in 3D
- Shows format and upload date
- Delete button (in future version)

**Search Results**

- Ranked by similarity (%)
- Click to preview
- View detailed comparison
- Shows format type

## Step-by-Step Workflows

### Workflow 1: Upload and Explore

1. **Prepare your model**

   - Ensure file is < 50MB
   - Use supported format
   - Check file integrity

2. **Upload**

   - Drag file to upload area
   - Wait for processing
   - Check status bar

3. **View in 3D**

   - Model loads automatically
   - Rotate to inspect
   - Check extracted features

4. **Review information**
   - See geometric properties
   - Verify parsing success
   - Note any warnings

### Workflow 2: Find Similar Models

1. **Select query model**

   - Upload new model OR
   - Choose from "My Models"

2. **Adjust search settings**

   - Set similarity threshold
   - Choose max results
   - Higher threshold = stricter matching

3. **Execute search**

   - Click "Find Similar Models"
   - Wait for results
   - View ranked matches

4. **Explore results**
   - Click to preview
   - Compare features
   - View similarity percentage

### Workflow 3: Template Comparison

1. **Load template shape**

   - Click desired template
   - View in 3D viewer

2. **Upload comparison model**

   - Upload your model
   - Select it from list

3. **Compare geometries**
   - Note feature differences
   - Check similarity score
   - Understand shape properties

## Understanding Features

### Basic Metrics

**Vertex Count**

- Number of points defining the model
- Higher = more detailed

**Face Count**

- Number of triangular faces
- Indicates mesh complexity

**Surface Area**

- Total external surface
- In square units

**Volume**

- Enclosed 3D space
- In cubic units

### Shape Descriptors

**Sphericity** (0.0 - 1.0)

- How sphere-like the shape is
- 1.0 = perfect sphere
- Lower = more irregular

**Compactness**

- Surface area to volume ratio
- Lower = more compact
- Higher = more spread out

**Aspect Ratios**

- Dimensional proportions
- Length vs width vs height
- Useful for orientation

### Advanced Features

**Principal Components**

- Main directional axes
- From PCA analysis
- Describes elongation

**Curvature Statistics**

- Surface curvature measurements
- Mean and Gaussian curvature
- Indicates surface complexity

**Shape Distribution**

- Histogram of pairwise distances
- D2 shape descriptor
- Rotation-invariant

**Topological Features**

- Euler characteristic
- Genus (number of holes)
- Manifold status

## Search Tips

### Getting Better Results

1. **Use appropriate threshold**

   - 0.9+ : Very similar (nearly identical)
   - 0.7-0.9 : Similar shapes
   - 0.5-0.7 : Somewhat similar
   - <0.5 : Loosely related

2. **Upload more models**

   - Larger database = better matches
   - Diverse shapes improve search

3. **Clean your models**

   - Remove unnecessary detail
   - Fix mesh errors
   - Simplify if too complex

4. **Consider format**
   - glTF/GLB for best parsing
   - STEP for engineering parts
   - STL for simple geometries

### Troubleshooting Poor Results

**No results found**

- Lower similarity threshold
- Upload more models
- Check model uploaded correctly

**Wrong matches**

- Increase threshold
- Verify feature extraction
- Check model orientation

**Slow search**

- Reduce max results
- Simplify complex models
- Clear old uploads

## Advanced Usage

### Using the API

Access programmatically via REST API:

```javascript
// Upload model
const formData = new FormData();
formData.append("file", file);

const response = await fetch("http://localhost:3000/api/upload", {
  method: "POST",
  body: formData,
});

const data = await response.json();

// Search similar
const searchResponse = await fetch("http://localhost:3000/api/search", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    modelId: data.modelId,
    threshold: 0.8,
    limit: 10,
  }),
});
```

See [API.md](API.md) for complete documentation.

### Batch Processing

For multiple files:

1. Upload files one by one
2. Use API for automation
3. Process results programmatically

### Integration

Integrate with other tools:

- Export feature data as JSON
- Use API in CAD workflows
- Build custom interfaces

## Best Practices

### Model Preparation

✓ **Do:**

- Clean meshes before upload
- Use appropriate detail level
- Center models at origin
- Use correct units

✗ **Don't:**

- Upload corrupted files
- Use excessive polygon counts
- Include multiple objects (separate them)
- Forget to check file size

### Organizing Models

✓ **Do:**

- Use descriptive filenames
- Keep related models together
- Document special features
- Track upload dates

✗ **Don't:**

- Use generic names (model1.obj)
- Upload duplicates
- Forget to delete test uploads
- Mix unrelated models

### Search Strategy

✓ **Do:**

- Start with high threshold
- Lower if no results
- Compare multiple matches
- Verify feature similarity

✗ **Don't:**

- Use extreme thresholds (0.1 or 0.99)
- Ignore feature comparison
- Assume visual similarity = geometric similarity
- Search without enough models in database

## Common Use Cases

### 1. Part Identification

**Scenario**: Identify similar parts in catalog

1. Upload unknown part
2. Search with threshold 0.8
3. Review top matches
4. Compare features

### 2. Design Validation

**Scenario**: Check if design is unique

1. Upload new design
2. Search existing models
3. High similarity = potential duplicate
4. Low similarity = novel design

### 3. Shape Classification

**Scenario**: Group similar shapes

1. Upload all models
2. Search each against database
3. Group by similarity scores
4. Identify shape families

### 4. Quality Control

**Scenario**: Verify manufactured part

1. Upload CAD design (reference)
2. Upload scanned part
3. Compare features
4. Check deviation

## Keyboard Shortcuts

Currently not implemented, but planned:

- `Ctrl+U` - Upload file
- `Ctrl+S` - Search similar
- `Space` - Reset view
- `W` - Toggle wireframe
- `F` - Fullscreen

## FAQ

**Q: Why is my STEP file not loading correctly?**
A: STEP parsing is complex. Try converting to glTF or simplifying the model.

**Q: How accurate is the similarity score?**
A: It's approximate based on geometric features. Visual inspection recommended.

**Q: Can I upload multiple files at once?**
A: Not yet, but batch upload is planned for a future version.

**Q: What's the max file size?**
A: 50MB per file. Larger files should be simplified.

**Q: Are my models stored permanently?**
A: Yes, until manually deleted. They're stored locally in the uploads folder.

**Q: Can I export search results?**
A: Not yet, but export functionality is planned.

**Q: Does it work offline?**
A: Backend requires Node.js server running. Frontend needs Three.js from CDN.

**Q: Can I use this for commercial projects?**
A: Yes! MIT license allows commercial use.

---

For technical details, see [README.md](README.md) and [API.md](API.md).

For issues or questions, create a GitHub issue.
