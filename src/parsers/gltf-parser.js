const fs = require("fs");

/**
 * Parse glTF/GLB files
 * glTF is a JSON-based format, GLB is binary
 */
async function parseGLTF(filePath, isBinary = false) {
  try {
    const fileContent = fs.readFileSync(filePath);

    let gltfData;

    if (isBinary) {
      // Parse GLB binary format
      gltfData = parseGLB(fileContent);
    } else {
      // Parse JSON glTF
      gltfData = JSON.parse(fileContent.toString());
    }

    // Extract geometry data
    const geometryData = extractGLTFGeometry(gltfData, filePath);

    return geometryData;
  } catch (error) {
    console.error("GLTF parsing error:", error);
    throw new Error(`Failed to parse GLTF: ${error.message}`);
  }
}

/**
 * Parse GLB binary format
 */
function parseGLB(buffer) {
  // GLB format structure:
  // Header: magic (4 bytes), version (4 bytes), length (4 bytes)
  // Chunk 0 (JSON): chunkLength (4 bytes), chunkType (4 bytes), chunkData
  // Chunk 1 (BIN): chunkLength (4 bytes), chunkType (4 bytes), chunkData

  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    // "glTF" in ASCII
    throw new Error("Invalid GLB file: magic number mismatch");
  }

  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);

  // Read JSON chunk
  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.readUInt32LE(16);

  if (jsonChunkType !== 0x4e4f534a) {
    // "JSON" in ASCII
    throw new Error("Invalid GLB file: JSON chunk not found");
  }

  const jsonData = buffer.slice(20, 20 + jsonChunkLength);
  const gltfData = JSON.parse(jsonData.toString());

  // Attach binary buffer if present
  if (length > 20 + jsonChunkLength) {
    const binChunkLength = buffer.readUInt32LE(20 + jsonChunkLength);
    const binChunkType = buffer.readUInt32LE(20 + jsonChunkLength + 4);

    if (binChunkType === 0x004e4942) {
      // "BIN" in ASCII
      gltfData.binaryBuffer = buffer.slice(
        20 + jsonChunkLength + 8,
        20 + jsonChunkLength + 8 + binChunkLength
      );
    }
  }

  return gltfData;
}

/**
 * Extract geometry from glTF data structure
 */
function extractGLTFGeometry(gltfData, filePath) {
  const vertices = [];
  const faces = [];
  const normals = [];

  // Process all meshes
  if (gltfData.meshes) {
    gltfData.meshes.forEach((mesh) => {
      mesh.primitives.forEach((primitive) => {
        // Get position accessor
        if (primitive.attributes.POSITION !== undefined) {
          const positionAccessor =
            gltfData.accessors[primitive.attributes.POSITION];
          const positionBufferView =
            gltfData.bufferViews[positionAccessor.bufferView];

          // Read vertex positions
          const positions = readAccessorData(
            gltfData,
            positionAccessor,
            positionBufferView,
            filePath
          );

          for (let i = 0; i < positions.length; i += 3) {
            vertices.push({
              x: positions[i],
              y: positions[i + 1],
              z: positions[i + 2],
            });
          }
        }

        // Get normal accessor if available
        if (primitive.attributes.NORMAL !== undefined) {
          const normalAccessor =
            gltfData.accessors[primitive.attributes.NORMAL];
          const normalBufferView =
            gltfData.bufferViews[normalAccessor.bufferView];

          const normalData = readAccessorData(
            gltfData,
            normalAccessor,
            normalBufferView,
            filePath
          );

          for (let i = 0; i < normalData.length; i += 3) {
            normals.push({
              x: normalData[i],
              y: normalData[i + 1],
              z: normalData[i + 2],
            });
          }
        }

        // Get indices (faces)
        if (primitive.indices !== undefined) {
          const indexAccessor = gltfData.accessors[primitive.indices];
          const indexBufferView =
            gltfData.bufferViews[indexAccessor.bufferView];

          const indices = readAccessorData(
            gltfData,
            indexAccessor,
            indexBufferView,
            filePath
          );

          for (let i = 0; i < indices.length; i += 3) {
            faces.push([indices[i], indices[i + 1], indices[i + 2]]);
          }
        }
      });
    });
  }

  return {
    vertices,
    faces,
    normals,
    format: "gltf",
    vertexCount: vertices.length,
    faceCount: faces.length,
  };
}

/**
 * Read data from glTF buffer accessor
 */
function readAccessorData(gltfData, accessor, bufferView, filePath) {
  let bufferData;

  if (gltfData.binaryBuffer) {
    // GLB: use embedded binary buffer
    bufferData = gltfData.binaryBuffer;
  } else {
    // glTF: read external buffer file
    const buffer = gltfData.buffers[bufferView.buffer];
    if (buffer.uri) {
      const bufferPath = buffer.uri.startsWith("data:")
        ? buffer.uri
        : require("path").join(require("path").dirname(filePath), buffer.uri);

      if (!buffer.uri.startsWith("data:")) {
        bufferData = fs.readFileSync(bufferPath);
      }
    }
  }

  const offset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const componentType = accessor.componentType;
  const count = accessor.count;
  const type = accessor.type;

  // Determine number of components per element
  const componentsPerElement = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
  }[type];

  const totalComponents = count * componentsPerElement;
  const result = [];

  // Read based on component type
  for (let i = 0; i < totalComponents; i++) {
    let value;
    const byteOffset = offset + i * getComponentSize(componentType);

    switch (componentType) {
      case 5120: // BYTE
        value = bufferData.readInt8(byteOffset);
        break;
      case 5121: // UNSIGNED_BYTE
        value = bufferData.readUInt8(byteOffset);
        break;
      case 5122: // SHORT
        value = bufferData.readInt16LE(byteOffset);
        break;
      case 5123: // UNSIGNED_SHORT
        value = bufferData.readUInt16LE(byteOffset);
        break;
      case 5125: // UNSIGNED_INT
        value = bufferData.readUInt32LE(byteOffset);
        break;
      case 5126: // FLOAT
        value = bufferData.readFloatLE(byteOffset);
        break;
      default:
        throw new Error(`Unsupported component type: ${componentType}`);
    }

    result.push(value);
  }

  return result;
}

/**
 * Get byte size of component type
 */
function getComponentSize(componentType) {
  const sizes = {
    5120: 1, // BYTE
    5121: 1, // UNSIGNED_BYTE
    5122: 2, // SHORT
    5123: 2, // UNSIGNED_SHORT
    5125: 4, // UNSIGNED_INT
    5126: 4, // FLOAT
  };

  return sizes[componentType] || 4;
}

module.exports = {
  parseGLTF,
};
