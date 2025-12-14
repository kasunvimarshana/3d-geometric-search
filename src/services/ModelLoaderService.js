/**
 * Model Loader Service - Handles loading and parsing of 3D models
 * Following Single Responsibility Principle and Dependency Inversion
 * Supports: GLTF/GLB (preferred), OBJ, STL, FBX, STEP (via conversion)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { IModelLoader } from '../domain/models.js';
import { MODEL_TYPES } from '../domain/constants.js';
import { FormatConversionService } from './FormatConversionService.js';

export class ModelLoaderService extends IModelLoader {
  constructor() {
    super();
    this.gltfLoader = new GLTFLoader();
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
    this.stlLoader = new STLLoader();
    this.fbxLoader = new FBXLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.conversionService = new FormatConversionService();
    this.loadedObjects = new Map(); // modelId -> THREE.Object3D
    this.loadingProgress = new Map(); // modelId -> progress percentage
  }

  /**
   * Load a 3D model with format detection and conversion support
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
        case MODEL_TYPES.OBJ:
          object = await this.loadOBJ(model.url);
          break;
        case MODEL_TYPES.STL:
          object = await this.loadSTL(model.url);
          break;
        case MODEL_TYPES.FBX:
          object = await this.loadFBX(model.url);
          break;
        case MODEL_TYPES.STEP:
        case MODEL_TYPES.STP:
          object = await this.loadSTEP(model.url);
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
      // Handle File objects by creating an object URL
      const loadUrl = url instanceof File ? URL.createObjectURL(url) : url;

      this.gltfLoader.load(
        loadUrl,
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

          // Clean up object URL if it was created
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
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
   * Load OBJ model
   */
  async loadOBJ(url) {
    return new Promise((resolve, reject) => {
      const loadUrl = url instanceof File ? URL.createObjectURL(url) : url;

      this.objLoader.load(
        loadUrl,
        object => {
          // Process and normalize the object
          const processed = this.processLoadedObject(object);

          // Clean up object URL if it was created
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }

          resolve(processed);
        },
        xhr => {
          // Progress callback
        },
        error => {
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }
          reject(error);
        }
      );
    });
  }

  /**
   * Load STL model
   */
  async loadSTL(url) {
    return new Promise((resolve, reject) => {
      const loadUrl = url instanceof File ? URL.createObjectURL(url) : url;

      this.stlLoader.load(
        loadUrl,
        geometry => {
          // STL loader returns geometry, not a full object
          const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            flatShading: false,
          });

          // Compute normals for smooth shading
          geometry.computeVertexNormals();

          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = 'STL Model';

          // Process and normalize
          const group = new THREE.Group();
          group.add(mesh);
          const processed = this.processLoadedObject(group);

          // Clean up object URL if it was created
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }

          resolve(processed);
        },
        xhr => {
          // Progress callback
        },
        error => {
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }
          reject(error);
        }
      );
    });
  }

  /**
   * Process and normalize loaded object
   * Centers and scales the object to fit viewport
   */
  processLoadedObject(object) {
    console.log('Processing loaded object:', object.name);

    let meshCount = 0;
    let lineCount = 0;

    // Ensure all meshes have proper materials and convert lines to meshes
    object.traverse(child => {
      if (child.isMesh) {
        meshCount++;
        // If mesh has no material or invalid material, create a default one
        if (!child.material) {
          console.log(`Creating default material for mesh: ${child.name}`);
          child.material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            side: THREE.DoubleSide,
          });
        } else if (child.material.isLineMaterial || child.material.isLineBasicMaterial) {
          // Replace line materials with mesh materials
          console.log(`Converting line material to mesh material for: ${child.name}`);
          const color = child.material.color || new THREE.Color(0x808080);
          child.material = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
          });
        }
      } else if (child.isLine || child.isLineSegments) {
        lineCount++;
        console.log(`Found line object: ${child.name}, converting to mesh`);
        // Lines found - this might be the issue
        // OBJ files sometimes create Line objects instead of Meshes
        if (child.geometry) {
          // Convert line to mesh by creating a mesh with the same geometry
          const color = child.material?.color || new THREE.Color(0x808080);
          const mesh = new THREE.Mesh(
            child.geometry,
            new THREE.MeshStandardMaterial({
              color: color,
              side: THREE.DoubleSide,
            })
          );
          mesh.name = child.name;
          mesh.position.copy(child.position);
          mesh.rotation.copy(child.rotation);
          mesh.scale.copy(child.scale);

          // Replace the line with the mesh
          if (child.parent) {
            child.parent.add(mesh);
            child.parent.remove(child);
          }
        }
      }
    });

    console.log(`Found ${meshCount} meshes and ${lineCount} line objects in loaded object`);

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
      console.log(
        `Scaled model by ${scale.toFixed(2)} (original max dimension: ${maxDim.toFixed(2)})`
      );
    }

    console.log('Processed object:', {
      name: object.name,
      meshes: meshCount,
      lines: lineCount,
      boundingBox: { center, size },
      position: object.position,
      scale: object.scale,
    });

    return object;
  }

  /**
   * Load FBX model
   */
  async loadFBX(url) {
    return new Promise((resolve, reject) => {
      const loadUrl = url instanceof File ? URL.createObjectURL(url) : url;

      this.fbxLoader.load(
        loadUrl,
        object => {
          // FBX loader returns complete object with hierarchy
          const processed = this.processLoadedObject(object);

          // Clean up object URL if it was created
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }

          resolve(processed);
        },
        xhr => {
          // Progress callback
          const progress = xhr.loaded / xhr.total;
          console.log(`FBX loading progress: ${(progress * 100).toFixed(0)}%`);
        },
        error => {
          if (url instanceof File) {
            URL.revokeObjectURL(loadUrl);
          }
          reject(error);
        }
      );
    });
  }

  /**
   * Load STEP model (with automatic conversion)
   */
  async loadSTEP(url) {
    try {
      // Check if we have a File object (can attempt conversion)
      if (url instanceof File) {
        console.log('Attempting STEP conversion...');

        const conversionResult = await this.conversionService.convertSTEPToGLTF(url);

        if (conversionResult.success && conversionResult.data) {
          // Conversion successful, load the converted GLTF
          console.log('STEP conversion successful, loading GLTF...');
          return await this.loadGLTF(conversionResult.data);
        } else if (conversionResult.requiresManualConversion) {
          // Conversion not available, provide instructions
          const error = new Error(conversionResult.message);
          error.instructions = conversionResult.instructions;
          error.isManualConversionRequired = true;
          throw error;
        }
      }

      // URL-based STEP files cannot be converted client-side
      throw new Error(
        'STEP format from URL requires pre-conversion. Please convert to GLTF/GLB format first. See documentation: /docs/STEP_FORMAT_GUIDE.md'
      );
    } catch (error) {
      console.error('STEP loading failed:', error);
      throw error;
    }
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
