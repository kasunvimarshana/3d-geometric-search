# 3D Models Directory

Place your 3D model files (GLTF, GLB) in this directory.

## Supported Formats

- `.gltf` - GL Transmission Format (JSON)
- `.glb` - Binary GLTF

## Example Structure

```
models/
├── cube.gltf
├── building.gltf
├── structure.gltf
└── textures/
    ├── texture1.jpg
    └── texture2.png
```

## Model Requirements

- **Format**: GLTF 2.0 or GLB
- **Size**: Keep under 50MB for optimal performance
- **Naming**: Use descriptive names without spaces
- **Textures**: Place textures in a `textures/` subdirectory

## Finding Free Models

- [Sketchfab](https://sketchfab.com/feed) - Free 3D models
- [Poly Haven](https://polyhaven.com/) - CC0 models
- [Free3D](https://free3d.com/) - Free models
- [TurboSquid Free](https://www.turbosquid.com/Search/3D-Models/free) - Free section

## Adding Models to the Application

After adding model files, register them in:
`src/repositories/ModelRepository.js`

```javascript
new Model('my-model-id', 'Model Display Name', '/models/filename.gltf', 'gltf')
```

## Note

If no model files are present, the application will use built-in demo geometry for testing.
