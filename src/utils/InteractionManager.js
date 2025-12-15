/**
 * Model Interaction Manager
 * Handles disassembly, reassembly, isolation, and other transformations
 */

import { traverseNodes } from "../core/modelUtils.js";

export class InteractionManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.originalTransforms = new Map();
    this.isDisassembled = false;
  }

  /**
   * Disassembles the model (exploded view)
   * @param {Model3D} model - Model to disassemble
   */
  disassemble(model) {
    if (!model || !model.root || this.isDisassembled) return;

    this.isDisassembled = true;

    // Calculate center of model
    const center = this.getModelCenter(model);

    // Store original transforms and apply disassembly
    traverseNodes(model.root, (node) => {
      if (node._threeObject) {
        const object = node._threeObject;

        // Store original transform
        this.originalTransforms.set(node.id, {
          position: object.position.clone(),
          rotation: object.rotation.clone(),
          scale: object.scale.clone(),
        });

        // Calculate offset from center
        if (node.bounds) {
          const nodeCenter = {
            x: (node.bounds.min.x + node.bounds.max.x) / 2,
            y: (node.bounds.min.y + node.bounds.max.y) / 2,
            z: (node.bounds.min.z + node.bounds.max.z) / 2,
          };

          const offset = {
            x: nodeCenter.x - center.x,
            y: nodeCenter.y - center.y,
            z: nodeCenter.z - center.z,
          };

          // Apply disassembly offset (exaggerate the distance from center)
          const factor = 1.5;
          object.position.x += offset.x * factor;
          object.position.y += offset.y * factor;
          object.position.z += offset.z * factor;
        }
      }
    });
  }

  /**
   * Reassembles the model (normal view)
   * @param {Model3D} model - Model to reassemble
   */
  reassemble(model) {
    if (!model || !model.root || !this.isDisassembled) return;

    this.isDisassembled = false;

    // Restore original transforms
    traverseNodes(model.root, (node) => {
      if (node._threeObject && this.originalTransforms.has(node.id)) {
        const object = node._threeObject;
        const original = this.originalTransforms.get(node.id);

        object.position.copy(original.position);
        object.rotation.copy(original.rotation);
        object.scale.copy(original.scale);
      }
    });

    this.originalTransforms.clear();
  }

  /**
   * Isolates a specific node (hides all others)
   * @param {Model3D} model - Model
   * @param {string} nodeId - Node ID to isolate
   */
  isolateNode(model, nodeId) {
    if (!model || !model.root) return;

    traverseNodes(model.root, (node) => {
      if (node._threeObject) {
        // Show only the target node and its ancestors
        const shouldShow = this.isNodeOrAncestor(model.root, nodeId, node.id);
        node._threeObject.visible = shouldShow;
      }
    });
  }

  /**
   * Shows all nodes
   * @param {Model3D} model - Model
   */
  showAll(model) {
    if (!model || !model.root) return;

    traverseNodes(model.root, (node) => {
      if (node._threeObject) {
        node._threeObject.visible = true;
      }
    });
  }

  /**
   * Checks if a node is the target or an ancestor of the target
   * @param {ModelNode} root - Root node
   * @param {string} targetId - Target node ID
   * @param {string} checkId - Node ID to check
   * @returns {boolean}
   */
  isNodeOrAncestor(root, targetId, checkId) {
    // Find the target node and its ancestors
    const path = [];

    function findPath(node) {
      path.push(node.id);

      if (node.id === targetId) {
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (findPath(child)) {
            return true;
          }
        }
      }

      path.pop();
      return false;
    }

    findPath(root);
    return path.includes(checkId);
  }

  /**
   * Gets the center of the model
   * @param {Model3D} model - Model
   * @returns {Object} - Center point {x, y, z}
   */
  getModelCenter(model) {
    if (!model.bounds) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: (model.bounds.min.x + model.bounds.max.x) / 2,
      y: (model.bounds.min.y + model.bounds.max.y) / 2,
      z: (model.bounds.min.z + model.bounds.max.z) / 2,
    };
  }

  /**
   * Resets all transformations
   * @param {Model3D} model - Model
   */
  reset(model) {
    if (this.isDisassembled) {
      this.reassemble(model);
    }
    this.showAll(model);
  }
}
