# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-13

### Added

- Initial release of 3D Geometric Search Engine
- Support for multiple 3D file formats (glTF, GLB, STEP, OBJ, STL)
- Interactive 3D visualization using Three.js
- Geometric feature extraction algorithms
- Similarity search based on shape descriptors
- RESTful API for model management
- SQLite database for model storage
- Drag-and-drop file upload interface
- Template geometric shapes
- Comprehensive documentation

### Features

- **File Parsers**

  - glTF/GLB parser with binary support
  - STEP parser (basic AP203/AP214 support)
  - Wavefront OBJ parser with MTL support
  - STL parser (ASCII and binary)

- **Geometric Analysis**

  - Surface area calculation
  - Volume computation
  - Bounding box extraction
  - Principal Component Analysis (PCA)
  - Shape distribution (D2 descriptor)
  - Curvature statistics
  - Topological features (Euler characteristic, genus)

- **Similarity Metrics**

  - Cosine similarity
  - Euclidean distance
  - Feature-specific comparison
  - Shape distribution matching
  - Weighted multi-metric scoring

- **User Interface**
  - Modern, responsive design
  - Real-time 3D visualization
  - Interactive model browser
  - Search results with similarity scores
  - Model information display
  - Template shape library

### Technical Details

- Node.js backend with Express
- Three.js for 3D rendering
- SQLite for data persistence
- Multer for file uploads
- Math.js for geometric computations

### Documentation

- README.md with comprehensive overview
- INSTALL.md with setup instructions
- API.md with complete API documentation
- CONTRIBUTING.md with contribution guidelines

### Known Limitations

- STEP parsing is basic (complex files may not parse fully)
- Large file uploads (>50MB) not supported
- Browser-based rendering limited by GPU
- No user authentication system

## Future Releases

### [1.1.0] - Planned

- Enhanced STEP parsing with OpenCascade.js
- Machine learning-based similarity
- Batch upload and processing
- Performance optimizations

### [1.2.0] - Planned

- User authentication and sessions
- Cloud storage integration
- Real-time collaboration
- Mobile app support

---

For more information, see [README.md](README.md)
