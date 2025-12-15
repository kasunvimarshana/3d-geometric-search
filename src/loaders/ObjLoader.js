/**
 * OBJ Loader
 * Loads OBJ files using Three.js OBJLoader
 */

import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { BaseLoader } from "./BaseLoader.js";
import {
  createModel,
  createNode,
  NodeType,
  SupportedFormats,
} from "../core/types.js";

export class ObjLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = [SupportedFormats.OBJ];
    this.loader = new OBJLoader();
  }

  /**
   * Loads an OBJ file
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async load(file) {
    try {
      const text = await this.readAsText(file);
      const object = this.loader.parse(text);

      const model = this.convertToModel(object, file.name);
      return model;
    } catch (error) {
      throw new Error(`Failed to load OBJ file: ${error.message}`);
    }
  }

  /**
   * Converts Three.js Object3D to our Model3D format
   * @param {THREE.Object3D} object - Three.js object
   * @param {string} filename - File name
   * @returns {Model3D}
   */
  convertToModel(object, filename) {
    const rootNode = this.convertNode(object);
    const bounds = this.calculateBounds(object);

    const model = createModel({
      name: filename,
      format: SupportedFormats.OBJ,
      root: rootNode,
      bounds,
      metadata: {
        children: object.children.length,
      },
    });

    model._threeScene = object;

    return model;
  }

  /**
   * Converts Three.js Object3D to ModelNode
   * @param {THREE.Object3D} object - Three.js object
   * @returns {ModelNode}
   */
  convertNode(object) {
    const nodeType = object.isMesh ? NodeType.MESH : NodeType.GROUP;

    const node = createNode({
      name: object.name || "Unnamed",
      type: nodeType,
      transform: {
        position: {
          x: object.position.x,
          y: object.position.y,
          z: object.position.z,
        },
        rotation: {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z,
        },
        scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z },
      },
      metadata: { uuid: object.uuid },
    });

    node._threeObject = object;

    if (object.isMesh) {
      node.geometry = this.extractGeometry(object.geometry);
      node.material = this.extractMaterial(object.material);
      node.bounds = this.calculateBounds(object);
    }

    if (object.children && object.children.length > 0) {
      node.children = object.children.map((child) => this.convertNode(child));
    }

    return node;
  }

  extractGeometry(geometry) {
    if (!geometry) return null;

    const vertices = geometry.attributes.position
      ? Array.from(geometry.attributes.position.array)
      : [];
    const indices = geometry.index ? Array.from(geometry.index.array) : [];

    return {
      vertices,
      indices,
      vertexCount: vertices.length / 3,
      faceCount: indices.length / 3,
    };
  }

  extractMaterial(material) {
    if (!material) return null;

    return {
      name: material.name,
      type: material.type,
      color: material.color ? material.color.getHex() : 0xcccccc,
      opacity: material.opacity !== undefined ? material.opacity : 1.0,
    };
  }

  calculateBounds(object) {
    const box = new THREE.Box3().setFromObject(object);
    return {
      min: { x: box.min.x, y: box.min.y, z: box.min.z },
      max: { x: box.max.x, y: box.max.y, z: box.max.z },
    };
  }
}
