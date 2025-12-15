/**
 * Event Validators
 * Additional validation logic for complex event payloads
 */

/**
 * Validates node IDs array
 * @param {any} nodeIds - Value to validate
 * @returns {boolean}
 */
export function isValidNodeIds(nodeIds) {
  return (
    Array.isArray(nodeIds) &&
    nodeIds.length > 0 &&
    nodeIds.every((id) => typeof id === "string")
  );
}

/**
 * Validates single node ID
 * @param {any} nodeId - Value to validate
 * @returns {boolean}
 */
export function isValidNodeId(nodeId) {
  return typeof nodeId === "string" && nodeId.length > 0;
}

/**
 * Validates model object
 * @param {any} model - Value to validate
 * @returns {boolean}
 */
export function isValidModel(model) {
  return (
    model &&
    typeof model === "object" &&
    typeof model.id === "string" &&
    typeof model.name === "string" &&
    model.root !== undefined
  );
}

/**
 * Validates file object
 * @param {any} file - Value to validate
 * @returns {boolean}
 */
export function isValidFile(file) {
  return file instanceof File;
}

/**
 * Validates error object
 * @param {any} error - Value to validate
 * @returns {boolean}
 */
export function isValidError(error) {
  return (
    error instanceof Error || (typeof error === "object" && error !== null)
  );
}

/**
 * Normalizes error to a consistent format
 * @param {any} error - Error to normalize
 * @returns {Object}
 */
export function normalizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
      stack: null,
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      name: error.name || "Error",
      message: error.message || "Unknown error",
      stack: error.stack || null,
    };
  }

  return {
    name: "Error",
    message: "Unknown error occurred",
    stack: null,
  };
}
