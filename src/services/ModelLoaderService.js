/**
 * Model Loader Service - Handles loading and parsing of 3D models
 * Following Single Responsibility Principle and Dependency Inversion
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { IModelLoader } from '../domain/models.js';
import { MODEL_TYPES } from '../domain/constants.js';

export class ModelLoaderService extends IModelLoader {
  constructor() {
    super();
    this.gltfLoader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.loadedObjects = new Map(); // modelId -> THREE.Object3D
  }

  /**
   * Load a 3D model
   * @param {Model} model - Model to load
   * @returns {Promise<THREE.Object3D>} - Loaded 3D object
   */
  async load(model) {
    try {
      // Check if already loaded
      if (this.loadedObjects.has(model.id)) {
        return this.loadedObjects.get(model.id).clone();
      }

      let object;

      switch (model.type) {
      case MODEL_TYPES.GLTF:
      case MODEL_TYPES.GLB:
        object = await this.loadGLTF(model.url);
        break;
      default:
        throw new Error(`Unsupported model type: ${model.type}`);
      }

      // Store the loaded object
      this.loadedObjects.set(model.id, object);

      return object;
    } catch (error) {
      throw new Error(`Failed to load model ${model.name}: ${error.message}`);
    }
  }

  /**
   * Load GLTF/GLB model
   */
  async loadGLTF(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        gltf => {
          const object = gltf.scene;
          
          // Center the model
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.sub(center);

          // Normalize scale if needed
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          if (maxDim > 10) {
            const scale = 10 / maxDim;
            object.scale.multiplyScalar(scale);
          }

          resolve(object);
        },
        xhr => {
          // Progress callback (optional)
          const progress = (xhr.loaded / xhr.total) * 100;
          // Could emit progress event here
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Create a fallback demo geometry when models are not available
   */
  createDemoGeometry() {
    const group = new THREE.Group();
    group.name = 'Demo Model';

    // Create main structure
    const mainGeometry = new THREE.BoxGeometry(4, 6, 4);
    const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    mainMesh.name = 'Main Structure';
    mainMesh.position.y = 3;
    group.add(mainMesh);

    // Create roof
    const roofGeometry = new THREE.ConeGeometry(3, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const roofMesh = new THREE.Mesh(roofGeometry, roofMaterial);
    roofMesh.name = 'Roof';
    roofMesh.position.y = 7;
    roofMesh.rotation.y = Math.PI / 4;
    group.add(roofMesh);

    // Create door
    const doorGeometry = new THREE.BoxGeometry(1, 2, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.name = 'Door';
    doorMesh.position.set(0, 1, 2.1);
    group.add(doorMesh);

    // Create windows
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });

    const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    leftWindow.name = 'Left Window';
    leftWindow.position.set(-1.5, 3, 2.1);
    group.add(leftWindow);

    const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
    rightWindow.name = 'Right Window';
    rightWindow.position.set(1.5, 3, 2.1);
    group.add(rightWindow);

    return group;
  }

  /**
   * Dispose of loaded models to free memory
   */
  dispose() {
    this.loadedObjects.forEach(object => {
      object.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.loadedObjects.clear();
  }

  /**
   * Get all mesh names from a loaded object
   */
  getMeshNames(object) {
    const meshNames = [];
    object.traverse(child => {
      if (child.isMesh) {
        meshNames.push(child.name || child.uuid);
      }
    });
    return meshNames;
  }
}
