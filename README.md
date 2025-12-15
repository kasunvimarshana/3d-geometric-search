# 3D Geometric Search Engine

An open-source web application for searching and matching 3D models based on geometric similarity. Inspired by 3Dfindit.com, this tool enables engineers and designers to find similar parts by shape rather than text metadata.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## Features

- **Multi-Format Support**: Upload and process glTF/GLB, STEP (AP203/AP214/AP242), OBJ/MTL, and STL files
- **Geometric Analysis**: Extract shape descriptors including surface area, volume, bounding box, sphericity, and more
- **Similarity Search**: Find similar models using advanced geometric feature comparison
- **Interactive 3D Visualization**: View and rotate models in real-time using Three.js
- **Drag & Drop Interface**: Intuitive UI for uploading and exploring 3D models
- **Open Source**: Fully MIT licensed with no proprietary dependencies

## Supported File Formats

| Format        | Extensions      | Description                                |
| ------------- | --------------- | ------------------------------------------ |
| glTF          | `.gltf`, `.glb` | GL Transmission Format (preferred for web) |
| STEP          | `.step`, `.stp` | ISO 10303 (AP203, AP214, AP242)            |
| Wavefront OBJ | `.obj`, `.mtl`  | Common 3D model format                     |
| STL           | `.stl`          | Stereolithography format                   |

## Architecture

```
├── Frontend (HTML/CSS/JavaScript)
│   ├── Three.js for 3D rendering
│   ├── Drag-drop upload interface
│   └── Search results visualization
│
├── Backend (Node.js/Express)
│   ├── File upload handling
│   ├── Format parsers
│   └── REST API
│
├── Geometric Engine
│   ├── Feature extraction
│   ├── Shape descriptors
│   └── Similarity algorithms
│
└── Database (SQLite)
    └── Model metadata storage
```

## Installation

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Quick Start

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd 3d-geometric-search
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the server**

```bash
npm start
```

4. **Open your browser**

```
http://localhost:3000
```

### Development Mode

```bash
npm run dev
```

## Usage

### Uploading Models

1. Drag and drop a 3D file (`.gltf`, `.glb`, `.step`, `.stp`, `.obj`, `.stl`) onto the upload area
2. The system will automatically:
   - Parse the geometry
   - Extract geometric features
   - Generate a 3D preview
   - Store the model in the database

### Searching for Similar Models

1. Select an uploaded model or upload a new query model
2. Click "Find Similar"
3. Browse ranked results based on geometric similarity
4. View detailed comparisons and feature breakdowns

### Template Shapes

Select from pre-defined geometric primitives:

- Cube
- Sphere
- Cylinder
- Cone
- Torus
- Custom shapes

## Geometric Features

The system extracts the following features for similarity comparison:

### Primary Descriptors

- **Surface Area**: Total surface area in square units
- **Volume**: Enclosed volume in cubic units
- **Bounding Box**: Axis-aligned minimum bounding box dimensions
- **Sphericity**: Measure of how sphere-like the shape is
- **Compactness**: Surface area to volume ratio

### Advanced Descriptors

- **Principal Axes**: Orientation via PCA (Principal Component Analysis)
- **Aspect Ratios**: Dimensional proportions (length/width/height)
- **Convex Hull**: Convexity measure
- **Shape Distribution**: D2 shape function (distance distribution)
- **Curvature Statistics**: Mean, Gaussian, and principal curvatures
- **Topological Features**: Euler characteristic, genus

### Similarity Metrics

Multiple algorithms for ranking similarity:

- **Euclidean Distance**: L2 norm in feature space
- **Cosine Similarity**: Angle-based similarity
- **Weighted Feature Distance**: Custom weights per feature
- **Shape Context Matching**: Histogram-based comparison

## API Documentation

### REST Endpoints

#### Upload Model

```http
POST /api/upload
Content-Type: multipart/form-data

Body: file (3D model file)
Response: { modelId, features, preview }
```

#### Search Similar

```http
POST /api/search
Content-Type: application/json

Body: { modelId, threshold, limit }
Response: { results: [{ modelId, similarity, features }] }
```

#### Get Model

```http
GET /api/models/:id
Response: { modelId, filename, features, uploadDate }
```

#### List Models

```http
GET /api/models
Response: { models: [...] }
```

#### Delete Model

```http
DELETE /api/models/:id
Response: { success: true }
```

## Configuration

Create a `.env` file for custom configuration:

```env
PORT=3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50000000
DATABASE_PATH=./database/models.db
ENABLE_CORS=true
```

## Project Structure

```
3d-geometric-search/
├── server.js                 # Main server entry point
├── package.json              # Dependencies
├── README.md                 # This file
├── LICENSE                   # MIT License
│
├── public/                   # Frontend files
│   ├── index.html           # Main UI
│   ├── styles.css           # Styling
│   ├── app.js               # Frontend logic
│   └── viewer.js            # 3D visualization
│
├── src/                      # Backend source
│   ├── parsers/             # File format parsers
│   │   ├── gltf-parser.js
│   │   ├── step-parser.js
│   │   ├── obj-parser.js
│   │   └── stl-parser.js
│   │
│   ├── geometric/           # Geometric analysis
│   │   ├── feature-extractor.js
│   │   ├── descriptors.js
│   │   └── similarity.js
│   │
│   ├── database/            # Database layer
│   │   └── db.js
│   │
│   └── utils/               # Utilities
│       └── validators.js
│
├── uploads/                 # Uploaded files (gitignored)
├── database/                # SQLite database
└── examples/                # Example models
```

## Performance Considerations

- **Browser-Based**: Small datasets (<100 models) can run entirely in the browser
- **Server-Side**: Large datasets leverage backend processing and indexing
- **Chunked Upload**: Large files are uploaded in chunks to prevent timeouts
- **Caching**: Feature vectors are cached to speed up repeat searches
- **Indexing**: SQLite indexes on geometric features for faster queries

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint rules
- Write tests for new features
- Update documentation
- Use meaningful commit messages

## Roadmap

- [ ] Advanced STEP file parsing (AP242 with PMI)
- [ ] Machine learning-based shape matching
- [ ] Cloud storage integration
- [ ] Batch processing API
- [ ] Export to various formats
- [ ] Real-time collaborative viewing
- [ ] Mobile app support

## Known Limitations

- **STEP Parsing**: Complex STEP files may require external libraries (OpenCascade.js)
- **File Size**: Browser parsing limited to ~50MB files
- **Precision**: Similarity is approximate and may need fine-tuning
- **Format Coverage**: Some rare CAD formats not yet supported

## Troubleshooting

### Common Issues

**Q: Models not displaying in viewer**

- Check browser console for errors
- Ensure file format is supported
- Verify file is not corrupted

**Q: Slow search performance**

- Reduce dataset size
- Enable server-side processing
- Check database indexes

**Q: STEP files not parsing**

- STEP support is basic; complex files may fail
- Consider converting to GLTF/OBJ first
- Check STEP AP version (AP203/AP214 recommended)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Three.js**: 3D rendering engine
- **OpenCascade.js**: STEP file parsing inspiration
- **3Dfindit.com**: Inspiration for geometric search
- Open source community

## Contact

For questions, issues, or contributions:

- GitHub Issues: [Create an issue]
- Discussions: [Join the discussion]

---

**Built with ❤️ for the engineering and aerospace community**
