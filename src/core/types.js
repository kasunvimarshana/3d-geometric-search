/**
 * Core Domain Types
 * Defines the fundamental data structures for the 3D geometric search application
 */

/**
 * Supported 3D file formats
 */
export const SupportedFormats = {
  GLTF: "gltf",
  GLB: "glb",
  OBJ: "obj",
  STL: "stl",
  STEP: "step",
  STP: "stp",
};

/**
 * Model node types
 */
export const NodeType = {
  ROOT: "root",
  GROUP: "group",
  MESH: "mesh",
  PART: "part",
  ASSEMBLY: "assembly",
};

/**
 * Model node state
 */
export const NodeState = {
  VISIBLE: "visible",
  HIDDEN: "hidden",
  HIGHLIGHTED: "highlighted",
  SELECTED: "selected",
  ISOLATED: "isolated",
};

/**
 * @typedef {Object} BoundingBox
 * @property {Object} min - Minimum point {x, y, z}
 * @property {Object} max - Maximum point {x, y, z}
 */

/**
 * @typedef {Object} ModelNode
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} type - Node type from NodeType
 * @property {string} state - Node state from NodeState
 * @property {ModelNode[]} children - Child nodes
 * @property {Object|null} geometry - Geometric data
 * @property {Object|null} material - Material properties
 * @property {Object} transform - Position, rotation, scale
 * @property {BoundingBox} bounds - Bounding box
 * @property {Object} metadata - Additional properties
 */

/**
 * @typedef {Object} Model3D
 * @property {string} id - Unique model identifier
 * @property {string} name - Model name
 * @property {string} format - File format
 * @property {ModelNode} root - Root node of the hierarchy
 * @property {BoundingBox} bounds - Overall bounding box
 * @property {Object} metadata - Model-level metadata
 * @property {Date} loadedAt - Load timestamp
 */

/**
 * @typedef {Object} GeometricFeatures
 * @property {number} volume - Model volume
 * @property {number} surfaceArea - Surface area
 * @property {Object} centroid - Center of mass
 * @property {number[]} histogram - Shape histogram descriptor
 * @property {Object} bounds - Bounding box
 */

/**
 * Creates a new ModelNode
 * @param {Partial<ModelNode>} props - Node properties
 * @returns {ModelNode}
 */
export function createNode(props = {}) {
  return {
    id: props.id || generateId(),
    name: props.name || "Unnamed",
    type: props.type || NodeType.GROUP,
    state: props.state || NodeState.VISIBLE,
    children: props.children || [],
    geometry: props.geometry || null,
    material: props.material || null,
    transform: props.transform || {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    bounds: props.bounds || createBoundingBox(),
    metadata: props.metadata || {},
  };
}

/**
 * Creates a new Model3D
 * @param {Partial<Model3D>} props - Model properties
 * @returns {Model3D}
 */
export function createModel(props = {}) {
  return {
    id: props.id || generateId(),
    name: props.name || "Untitled Model",
    format: props.format || SupportedFormats.GLTF,
    root: props.root || createNode({ type: NodeType.ROOT, name: "Root" }),
    bounds: props.bounds || createBoundingBox(),
    metadata: props.metadata || {},
    loadedAt: props.loadedAt || new Date(),
  };
}

/**
 * Creates an empty bounding box
 * @returns {BoundingBox}
 */
export function createBoundingBox() {
  return {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
  };
}

/**
 * Generates a unique identifier
 * @returns {string}
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates if a format is supported
 * @param {string} format - File format
 * @returns {boolean}
 */
export function isSupportedFormat(format) {
  return Object.values(SupportedFormats).includes(format.toLowerCase());
}

/**
 * Gets format from file extension
 * @param {string} filename - File name
 * @returns {string|null}
 */
export function getFormatFromFilename(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && isSupportedFormat(ext) ? ext : null;
}
