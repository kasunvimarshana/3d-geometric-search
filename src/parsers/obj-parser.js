const fs = require("fs");
const path = require("path");

/**
 * Parse OBJ (Wavefront) files with optional MTL material files
 */
async function parseOBJ(filePath) {
  try {
    const objContent = fs.readFileSync(filePath, "utf8");

    const vertices = [];
    const faces = [];
    const normals = [];
    const textureCoords = [];

    const lines = objContent.split("\n");

    for (let line of lines) {
      line = line.trim();

      if (line.startsWith("#") || line.length === 0) {
        continue; // Skip comments and empty lines
      }

      const parts = line.split(/\s+/);
      const type = parts[0];

      switch (type) {
        case "v": // Vertex
          vertices.push({
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
          });
          break;

        case "vn": // Vertex normal
          normals.push({
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
          });
          break;

        case "vt": // Texture coordinate
          textureCoords.push({
            u: parseFloat(parts[1]),
            v: parseFloat(parts[2]),
          });
          break;

        case "f": // Face
          const face = parseFace(parts.slice(1));
          faces.push(face);
          break;

        case "mtllib": // Material library
          // Could load MTL file here if needed
          break;

        case "usemtl": // Use material
          // Material name - could be used for grouping
          break;
      }
    }

    return {
      vertices,
      faces,
      normals,
      textureCoords,
      format: "obj",
      vertexCount: vertices.length,
      faceCount: faces.length,
    };
  } catch (error) {
    console.error("OBJ parsing error:", error);
    throw new Error(`Failed to parse OBJ: ${error.message}`);
  }
}

/**
 * Parse face definition
 * Faces can be defined as:
 * f v1 v2 v3
 * f v1/vt1 v2/vt2 v3/vt3
 * f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3
 * f v1//vn1 v2//vn2 v3//vn3
 */
function parseFace(faceParts) {
  const face = [];

  for (const part of faceParts) {
    const indices = part.split("/");

    // Vertex index (1-based in OBJ, convert to 0-based)
    const vertexIndex = parseInt(indices[0]) - 1;

    face.push(vertexIndex);
  }

  // Handle quads by triangulating
  if (face.length === 4) {
    // Split quad into two triangles: [0,1,2] and [0,2,3]
    return [
      [face[0], face[1], face[2]],
      [face[0], face[2], face[3]],
    ];
  }

  return [face];
}

/**
 * Parse MTL (Material) file
 */
function parseMTL(filePath) {
  try {
    const mtlContent = fs.readFileSync(filePath, "utf8");
    const materials = {};
    let currentMaterial = null;

    const lines = mtlContent.split("\n");

    for (let line of lines) {
      line = line.trim();

      if (line.startsWith("#") || line.length === 0) {
        continue;
      }

      const parts = line.split(/\s+/);
      const type = parts[0];

      switch (type) {
        case "newmtl":
          currentMaterial = parts[1];
          materials[currentMaterial] = {};
          break;

        case "Ka": // Ambient color
          if (currentMaterial) {
            materials[currentMaterial].ambient = [
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3]),
            ];
          }
          break;

        case "Kd": // Diffuse color
          if (currentMaterial) {
            materials[currentMaterial].diffuse = [
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3]),
            ];
          }
          break;

        case "Ks": // Specular color
          if (currentMaterial) {
            materials[currentMaterial].specular = [
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3]),
            ];
          }
          break;

        case "Ns": // Specular exponent
          if (currentMaterial) {
            materials[currentMaterial].shininess = parseFloat(parts[1]);
          }
          break;

        case "d": // Transparency
          if (currentMaterial) {
            materials[currentMaterial].opacity = parseFloat(parts[1]);
          }
          break;
      }
    }

    return materials;
  } catch (error) {
    console.error("MTL parsing error:", error);
    return {};
  }
}

module.exports = {
  parseOBJ,
  parseMTL,
};
