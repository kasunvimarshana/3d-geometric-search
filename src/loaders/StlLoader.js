/**
 * STL Loader
 * Loads STL files using Three.js STLLoader
 */

import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { BaseLoader } from "./BaseLoader.js";
import {
  createModel,
  createNode,
  NodeType,
  SupportedFormats,
} from "../core/types.js";

export class StlLoader extends BaseLoader {
  constructor() {
    super();
    this.supportedFormats = [SupportedFormats.STL];
    this.loader = new STLLoader();
  }

  /**
   * Loads an STL file
   * @param {File} file - File to load
   * @returns {Promise<Model3D>}
   */
  async load(file) {
    try {
      const arrayBuffer = await this.readAsArrayBuffer(file);
      const geometry = this.loader.parse(arrayBuffer);

      // Create mesh from geometry
      const material = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.3,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = file.name;

      const model = this.convertToModel(mesh, file.name);
      return model;
    } catch (error) {
      throw new Error(`Failed to load STL file: ${error.message}`);
    }
  }

  /**
   * Converts Three.js Mesh to our Model3D format
   * @param {THREE.Mesh} mesh - Three.js mesh
   * @param {string} filename - File name
   * @returns {Model3D}
   */
  convertToModel(mesh, filename) {
    const rootNode = this.convertNode(mesh);
    const bounds = this.calculateBounds(mesh);

    const model = createModel({
      name: filename,
      format: SupportedFormats.STL,
      root: rootNode,
      bounds,
      metadata: {
        vertices: mesh.geometry.attributes.position.count,
      },
    });

    model._threeScene = mesh;

    return model;
  }

  /**
   * Converts Three.js Mesh to ModelNode
   * @param {THREE.Mesh} mesh - Three.js mesh
   * @returns {ModelNode}
   */
  convertNode(mesh) {
    const node = createNode({
      name: mesh.name || "STL Model",
      type: NodeType.MESH,
      transform: {
        position: {
          x: mesh.position.x,
          y: mesh.position.y,
          z: mesh.position.z,
        },
        rotation: {
          x: mesh.rotation.x,
          y: mesh.rotation.y,
          z: mesh.rotation.z,
        },
        scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
      },
    });

    node._threeObject = mesh;
    node.geometry = this.extractGeometry(mesh.geometry);
    node.material = this.extractMaterial(mesh.material);
    node.bounds = this.calculateBounds(mesh);

    return node;
  }

  extractGeometry(geometry) {
    if (!geometry) return null;

    const vertices = geometry.attributes.position
      ? Array.from(geometry.attributes.position.array)
      : [];

    return {
      vertices,
      indices: [],
      vertexCount: vertices.length / 3,
      faceCount: vertices.length / 9,
    };
  }

  extractMaterial(material) {
    if (!material) return null;

    return {
      name: material.name,
      type: material.type,
      color: material.color ? material.color.getHex() : 0x888888,
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
