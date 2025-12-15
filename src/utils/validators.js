/**
 * Utility functions for file validation and processing
 */

const fs = require("fs");
const path = require("path");

/**
 * Validate uploaded file
 */
function validateUploadedFile(file) {
  const errors = [];

  // Check file exists
  if (!file) {
    errors.push("No file provided");
    return { valid: false, errors };
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File too large: ${formatBytes(file.size)} (max: 50MB)`);
  }

  // Check file extension
  const allowedExtensions = [
    ".gltf",
    ".glb",
    ".step",
    ".stp",
    ".obj",
    ".mtl",
    ".stl",
  ];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    errors.push(`Unsupported file format: ${ext}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    extension: ext,
  };
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Clean filename for safe storage
 */
function sanitizeFilename(filename) {
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_{2,}/g, "_")
    .toLowerCase();
}

/**
 * Check if file is a valid 3D model
 */
function is3DModelFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return [".gltf", ".glb", ".step", ".stp", ".obj", ".stl"].includes(ext);
}

/**
 * Get MIME type for file
 */
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();

  const mimeTypes = {
    ".gltf": "model/gltf+json",
    ".glb": "model/gltf-binary",
    ".obj": "model/obj",
    ".stl": "model/stl",
    ".step": "application/step",
    ".stp": "application/step",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalFilename) {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return `${sanitizeFilename(basename)}_${timestamp}_${random}${ext}`;
}

/**
 * Clean up old files (optional utility)
 */
function cleanupOldFiles(directory, maxAgeHours = 24) {
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  const now = Date.now();

  if (!fs.existsSync(directory)) {
    return { deleted: 0, errors: [] };
  }

  const files = fs.readdirSync(directory);
  let deleted = 0;
  const errors = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (now - stats.mtimeMs > maxAge) {
      try {
        fs.unlinkSync(filePath);
        deleted++;
      } catch (error) {
        errors.push({ file, error: error.message });
      }
    }
  });

  return { deleted, errors };
}

module.exports = {
  validateUploadedFile,
  formatBytes,
  sanitizeFilename,
  is3DModelFile,
  getMimeType,
  generateUniqueFilename,
  cleanupOldFiles,
};
