/**
 * Validation utilities
 */

/**
 * Validate required fields
 */
export function validateRequired(obj, fields) {
  const errors = [];

  fields.forEach((field) => {
    if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
      errors.push(`${field} is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate type
 */
export function validateType(value, expectedType) {
  const actualType = typeof value;

  if (expectedType === 'array') {
    return Array.isArray(value);
  }

  return actualType === expectedType;
}

/**
 * Validate range
 */
export function validateRange(value, min, max) {
  return value >= min && value <= max;
}

/**
 * Validate string length
 */
export function validateLength(str, min, max) {
  const len = str.length;
  return len >= min && len <= max;
}

/**
 * Validate file type
 */
export function validateFileType(fileName, allowedTypes) {
  const ext = fileName.split('.').pop().toLowerCase();
  return allowedTypes.includes(ext);
}

/**
 * Validate object structure
 */
export function validateStructure(obj, structure) {
  const errors = [];

  Object.entries(structure).forEach(([key, validator]) => {
    if (!validator(obj[key])) {
      errors.push(`Invalid value for ${key}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
