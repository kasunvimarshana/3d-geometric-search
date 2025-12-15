const fs = require("fs");
const path = require("path");

// Import individual parsers
const { parseGLTF } = require("./gltf-parser");
const { parseSTEP } = require("./step-parser");
const { parseOBJ } = require("./obj-parser");
const { parseSTL } = require("./stl-parser");

/**
 * Main entry point for parsing 3D models
 * Routes to appropriate parser based on file extension
 */
async function parseModel(filePath, extension) {
  try {
    const ext = extension.toLowerCase();

    console.log(`Parsing ${ext} file: ${filePath}`);

    switch (ext) {
      case ".gltf":
      case ".glb":
        return await parseGLTF(filePath, ext === ".glb");

      case ".step":
      case ".stp":
        return await parseSTEP(filePath);

      case ".obj":
        return await parseOBJ(filePath);

      case ".stl":
        return await parseSTL(filePath);

      default:
        throw new Error(`Unsupported file format: ${ext}`);
    }
  } catch (error) {
    console.error(`Error parsing model: ${error.message}`);
    return null;
  }
}

/**
 * Validate file before parsing
 */
function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error("File is empty");
  }

  if (stats.size > 50 * 1024 * 1024) {
    throw new Error("File too large (max 50MB)");
  }

  return true;
}

module.exports = {
  parseModel,
  validateFile,
};
