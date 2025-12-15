/**
 * Validation utilities
 */

/**
 * Validate file
 */
export function validateFile(file, options = {}) {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB
    allowedExtensions = ['gltf', 'glb', 'obj', 'stl', 'step', 'stp'],
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (!(file instanceof File)) {
    throw new Error('Invalid file type');
  }

  // Check size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size (${maxSize} bytes)`);
  }

  // Check extension
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Unsupported file format: .${ext}`);
  }

  return true;
}

/**
 * Validate section
 */
export function validateSection(section) {
  if (!section) {
    throw new Error('Section is null or undefined');
  }

  if (!section.id) {
    throw new Error('Section must have an ID');
  }

  if (!section.name) {
    throw new Error('Section must have a name');
  }

  return true;
}

/**
 * Validate model
 */
export function validateModel(model) {
  if (!model) {
    throw new Error('Model is null or undefined');
  }

  if (!model.id) {
    throw new Error('Model must have an ID');
  }

  if (!model.name) {
    throw new Error('Model must have a name');
  }

  if (!model.formatType) {
    throw new Error('Model must have a format type');
  }

  return true;
}

/**
 * Validate coordinates
 */
export function validateCoordinates(x, y, z) {
  if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
    throw new Error('Coordinates must be numbers');
  }

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
    throw new Error('Coordinates must be finite numbers');
  }

  return true;
}

/**
 * Validate ID
 */
export function validateId(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('ID must be a non-empty string');
  }
  return true;
}
