/**
 * Model Utilities
 * Helper functions for working with 3D models and nodes
 */

import { NodeState } from "./types.js";

/**
 * Traverses the model tree depth-first
 * @param {ModelNode} node - Root node
 * @param {Function} callback - Function to call for each node
 */
export function traverseNodes(node, callback) {
  if (!node) return;

  callback(node);

  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child) => traverseNodes(child, callback));
  }
}

/**
 * Finds a node by ID
 * @param {ModelNode} root - Root node
 * @param {string} id - Node ID to find
 * @returns {ModelNode|null}
 */
export function findNodeById(root, id) {
  if (!root || !id) return null;

  let found = null;
  traverseNodes(root, (node) => {
    if (node.id === id) {
      found = node;
    }
  });

  return found;
}

/**
 * Finds all nodes matching a predicate
 * @param {ModelNode} root - Root node
 * @param {Function} predicate - Test function
 * @returns {ModelNode[]}
 */
export function findNodes(root, predicate) {
  const results = [];
  traverseNodes(root, (node) => {
    if (predicate(node)) {
      results.push(node);
    }
  });
  return results;
}

/**
 * Gets all leaf nodes (nodes without children)
 * @param {ModelNode} root - Root node
 * @returns {ModelNode[]}
 */
export function getLeafNodes(root) {
  return findNodes(
    root,
    (node) => !node.children || node.children.length === 0
  );
}

/**
 * Gets the path from root to a specific node
 * @param {ModelNode} root - Root node
 * @param {string} targetId - Target node ID
 * @returns {ModelNode[]}
 */
export function getNodePath(root, targetId) {
  const path = [];

  function search(node) {
    if (!node) return false;

    path.push(node);

    if (node.id === targetId) {
      return true;
    }

    if (node.children) {
      for (const child of node.children) {
        if (search(child)) {
          return true;
        }
      }
    }

    path.pop();
    return false;
  }

  search(root);
  return path;
}

/**
 * Updates node state
 * @param {ModelNode} node - Node to update
 * @param {string} state - New state
 * @returns {ModelNode} - Updated node
 */
export function updateNodeState(node, state) {
  if (!node || !Object.values(NodeState).includes(state)) {
    return node;
  }

  return {
    ...node,
    state,
  };
}

/**
 * Updates all descendant nodes' state
 * @param {ModelNode} node - Root node
 * @param {string} state - New state
 */
export function updateDescendantStates(node, state) {
  traverseNodes(node, (n) => {
    n.state = state;
  });
}

/**
 * Computes bounding box for a node and its children
 * @param {ModelNode} node - Node to compute bounds for
 * @returns {BoundingBox}
 */
export function computeBoundingBox(node) {
  const bounds = {
    min: { x: Infinity, y: Infinity, z: Infinity },
    max: { x: -Infinity, y: -Infinity, z: -Infinity },
  };

  traverseNodes(node, (n) => {
    if (n.bounds) {
      bounds.min.x = Math.min(bounds.min.x, n.bounds.min.x);
      bounds.min.y = Math.min(bounds.min.y, n.bounds.min.y);
      bounds.min.z = Math.min(bounds.min.z, n.bounds.min.z);
      bounds.max.x = Math.max(bounds.max.x, n.bounds.max.x);
      bounds.max.y = Math.max(bounds.max.y, n.bounds.max.y);
      bounds.max.z = Math.max(bounds.max.z, n.bounds.max.z);
    }
  });

  return bounds;
}

/**
 * Calculates the center of a bounding box
 * @param {BoundingBox} bounds - Bounding box
 * @returns {Object} - Center point {x, y, z}
 */
export function getBoundsCenter(bounds) {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}

/**
 * Calculates the size of a bounding box
 * @param {BoundingBox} bounds - Bounding box
 * @returns {Object} - Size {x, y, z}
 */
export function getBoundsSize(bounds) {
  return {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z,
  };
}

/**
 * Clones a node deeply
 * @param {ModelNode} node - Node to clone
 * @returns {ModelNode}
 */
export function cloneNode(node) {
  return JSON.parse(JSON.stringify(node));
}

/**
 * Counts total nodes in tree
 * @param {ModelNode} root - Root node
 * @returns {number}
 */
export function countNodes(root) {
  let count = 0;
  traverseNodes(root, () => count++);
  return count;
}

/**
 * Gets model statistics
 * @param {Model3D} model - Model
 * @returns {Object} - Statistics
 */
export function getModelStats(model) {
  if (!model || !model.root) {
    return {
      totalNodes: 0,
      meshNodes: 0,
      groupNodes: 0,
      depth: 0,
    };
  }

  let meshCount = 0;
  let groupCount = 0;
  let maxDepth = 0;

  function traverse(node, depth = 0) {
    maxDepth = Math.max(maxDepth, depth);

    if (node.type === "mesh") meshCount++;
    if (node.type === "group") groupCount++;

    if (node.children) {
      node.children.forEach((child) => traverse(child, depth + 1));
    }
  }

  traverse(model.root);

  return {
    totalNodes: countNodes(model.root),
    meshNodes: meshCount,
    groupNodes: groupCount,
    depth: maxDepth,
  };
}
