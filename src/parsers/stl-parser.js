const fs = require("fs");

/**
 * Parse STL (Stereolithography) files
 * Supports both ASCII and binary formats
 */
async function parseSTL(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath);

    // Detect if ASCII or binary
    const isASCII = fileContent.toString("utf8", 0, 5) === "solid";

    let geometryData;

    if (isASCII) {
      geometryData = parseASCIISTL(fileContent.toString());
    } else {
      geometryData = parseBinarySTL(fileContent);
    }

    return geometryData;
  } catch (error) {
    console.error("STL parsing error:", error);
    throw new Error(`Failed to parse STL: ${error.message}`);
  }
}

/**
 * Parse ASCII STL format
 */
function parseASCIISTL(content) {
  const vertices = [];
  const faces = [];
  const normals = [];

  const lines = content.split("\n");
  let currentFace = [];
  let currentNormal = null;

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith("facet normal")) {
      // Parse normal vector
      const parts = line.split(/\s+/);
      currentNormal = {
        x: parseFloat(parts[2]),
        y: parseFloat(parts[3]),
        z: parseFloat(parts[4]),
      };
    } else if (line.startsWith("vertex")) {
      // Parse vertex
      const parts = line.split(/\s+/);
      const vertex = {
        x: parseFloat(parts[1]),
        y: parseFloat(parts[2]),
        z: parseFloat(parts[3]),
      };

      vertices.push(vertex);
      currentFace.push(vertices.length - 1);

      if (currentNormal) {
        normals.push(currentNormal);
      }
    } else if (line.startsWith("endfacet")) {
      // Complete the face
      if (currentFace.length === 3) {
        faces.push([...currentFace]);
      }
      currentFace = [];
      currentNormal = null;
    }
  }

  return {
    vertices,
    faces,
    normals,
    format: "stl",
    vertexCount: vertices.length,
    faceCount: faces.length,
  };
}

/**
 * Parse binary STL format
 */
function parseBinarySTL(buffer) {
  const vertices = [];
  const faces = [];
  const normals = [];

  // Binary STL format:
  // Header: 80 bytes (usually ignored)
  // Number of triangles: 4 bytes (uint32)
  // For each triangle:
  //   Normal vector: 12 bytes (3 x float32)
  //   Vertex 1: 12 bytes (3 x float32)
  //   Vertex 2: 12 bytes (3 x float32)
  //   Vertex 3: 12 bytes (3 x float32)
  //   Attribute byte count: 2 bytes (uint16)

  const triangleCount = buffer.readUInt32LE(80);
  let offset = 84;

  for (let i = 0; i < triangleCount; i++) {
    // Read normal
    const normal = {
      x: buffer.readFloatLE(offset),
      y: buffer.readFloatLE(offset + 4),
      z: buffer.readFloatLE(offset + 8),
    };
    offset += 12;

    // Read three vertices
    const faceIndices = [];

    for (let j = 0; j < 3; j++) {
      const vertex = {
        x: buffer.readFloatLE(offset),
        y: buffer.readFloatLE(offset + 4),
        z: buffer.readFloatLE(offset + 8),
      };
      offset += 12;

      vertices.push(vertex);
      normals.push(normal);
      faceIndices.push(vertices.length - 1);
    }

    faces.push(faceIndices);

    // Skip attribute byte count
    offset += 2;
  }

  return {
    vertices,
    faces,
    normals,
    format: "stl",
    vertexCount: vertices.length,
    faceCount: faces.length,
  };
}

module.exports = {
  parseSTL,
};
