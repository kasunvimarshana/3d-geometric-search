/**
 * glTF/GLB Loader
 * Loads glTF and GLB files using Three.js GLTFLoader
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BaseLoader } from "./BaseLoader.js";
import {
  createModel,
  createNode,
  NodeType,
  SupportedFormats,
} from "../core/types.js";

export class GltfLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = [SupportedFormats.GLTF, SupportedFormats.GLB];
    this.loader = new GLTFLoader();
  }

  /**
   * Loads a glTF/GLB file
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async load(file) {
    try {
      const arrayBuffer = await this.readAsArrayBuffer(file);
      const gltf = await this.parseGLTF(arrayBuffer, file.name);

      const model = this.convertToModel(gltf, file.name);
      return model;
    } catch (error) {
      throw new Error(`Failed to load glTF file: ${error.message}`);
    }
  }

  /**
   * Parses glTF data
   * @param {ArrayBuffer} data - File data
   * @param {string} filename - File name
   * @returns {Promise<Object>}
   */
  async parseGLTF(data, filename) {
    return new Promise((resolve, reject) => {
      this.loader.parse(
        data,
        "",
        (gltf) => resolve(gltf),
        (error) => reject(error)
      );
    });
  }

  /**
   * Converts Three.js GLTF to our Model3D format
   * @param {Object} gltf - GLTF object from Three.js
   * @param {string} filename - File name
   * @returns {Model3D}
   */
  convertToModel(gltf, filename) {
    const scene = gltf.scene;
    const format = filename.toLowerCase().endsWith(".glb")
      ? SupportedFormats.GLB
      : SupportedFormats.GLTF;

    // Create root node
    const rootNode = this.convertNode(scene);

    // Calculate bounds
    const bounds = this.calculateBounds(scene);

    const model = createModel({
      name: filename,
      format,
      root: rootNode,
      bounds,
      metadata: {
        animations: gltf.animations ? gltf.animations.length : 0,
        cameras: gltf.cameras ? gltf.cameras.length : 0,
        scenes: gltf.scenes ? gltf.scenes.length : 0,
      },
    });

    // Store Three.js scene reference for rendering
    model._threeScene = scene;

    return model;
  }

  /**
   * Converts Three.js Object3D to ModelNode
   * @param {THREE.Object3D} object - Three.js object
   * @returns {ModelNode}
   */
  convertNode(object) {
    const nodeType = this.getNodeType(object);

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
        scale: {
          x: object.scale.x,
          y: object.scale.y,
          z: object.scale.z,
        },
      },
      metadata: {
        uuid: object.uuid,
        type: object.type,
      },
    });

    // Store reference to Three.js object
    node._threeObject = object;

    // Extract geometry and material
    if (object.isMesh) {
      node.geometry = this.extractGeometry(object.geometry);
      node.material = this.extractMaterial(object.material);
    }

    // Calculate bounds
    if (object.isMesh || object.isGroup) {
      node.bounds = this.calculateBounds(object);
    }

    // Process children
    if (object.children && object.children.length > 0) {
      node.children = object.children.map((child) => this.convertNode(child));
    }

    return node;
  }

  /**
   * Determines node type from Three.js object
   * @param {THREE.Object3D} object - Three.js object
   * @returns {string}
   */
  getNodeType(object) {
    if (object.isMesh) return NodeType.MESH;
    if (object.isGroup) return NodeType.GROUP;
    if (object.isScene) return NodeType.ROOT;
    return NodeType.PART;
  }

  /**
   * Extracts geometry data
   * @param {THREE.BufferGeometry} geometry - Three.js geometry
   * @returns {Object}
   */
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

  /**
   * Extracts material properties
   * @param {THREE.Material} material - Three.js material
   * @returns {Object}
   */
  extractMaterial(material) {
    if (!material) return null;

    return {
      name: material.name,
      type: material.type,
      color: material.color ? material.color.getHex() : 0xcccccc,
      opacity: material.opacity !== undefined ? material.opacity : 1.0,
      transparent: material.transparent || false,
    };
  }

  /**
   * Calculates bounding box
   * @param {THREE.Object3D} object - Three.js object
   * @returns {BoundingBox}
   */
  calculateBounds(object) {
    const box = new THREE.Box3().setFromObject(object);

    return {
      min: {
        x: box.min.x,
        y: box.min.y,
        z: box.min.z,
      },
      max: {
        x: box.max.x,
        y: box.max.y,
        z: box.max.z,
      },
    };
  }
}
