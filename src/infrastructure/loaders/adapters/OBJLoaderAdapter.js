/**
 * OBJ Loader Adapter
 * Wraps Three.js OBJLoader with clean interface
 * Supports MTL material files
 */

import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export class OBJLoaderAdapter {
  constructor() {
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Load OBJ file (with optional MTL)
   *
   * @param {string|File} source - URL or File object
   * @param {string|File} [mtlSource] - Optional MTL source
   * @param {Function} [onProgress] - Progress callback
   * @returns {Promise<THREE.Object3D>}
   */
  async load(source, mtlSource = null, onProgress = null) {
    const url = source instanceof File ? URL.createObjectURL(source) : source;

    try {
      // Load MTL if provided
      if (mtlSource) {
        const materials = await this.loadMTL(mtlSource);
        this.objLoader.setMaterials(materials);
      }

      // Load OBJ
      const object = await new Promise((resolve, reject) => {
        this.objLoader.load(
          url,
          obj => resolve(obj),
          xhr => {
            if (onProgress && xhr.lengthComputable) {
              const percentComplete = (xhr.loaded / xhr.total) * 100;
              onProgress(percentComplete, xhr.loaded, xhr.total);
            }
          },
          error => reject(error)
        );
      });

      // Clean up object URL if created
      if (source instanceof File) {
        URL.revokeObjectURL(url);
      }

      return object;
    } catch (error) {
      // Clean up on error
      if (source instanceof File) {
        URL.revokeObjectURL(url);
      }
      throw new Error(`Failed to load OBJ: ${error.message}`);
    }
  }

  /**
   * Load MTL material file
   *
   * @param {string|File} mtlSource - MTL source
   * @returns {Promise<MTLLoader.MaterialCreator>}
   */
  async loadMTL(mtlSource) {
    const url = mtlSource instanceof File ? URL.createObjectURL(mtlSource) : mtlSource;

    try {
      const materials = await new Promise((resolve, reject) => {
        this.mtlLoader.load(
          url,
          materials => {
            materials.preload();
            resolve(materials);
          },
          null,
          error => reject(error)
        );
      });

      if (mtlSource instanceof File) {
        URL.revokeObjectURL(url);
      }

      return materials;
    } catch (error) {
      if (mtlSource instanceof File) {
        URL.revokeObjectURL(url);
      }
      // Don't throw - MTL is optional
      console.warn('Failed to load MTL file:', error.message);
      return null;
    }
  }

  /**
   * Validate if file is OBJ
   *
   * @param {string|File} source - Source to validate
   * @returns {Promise<boolean>}
   */
  async validate(source) {
    if (source instanceof File) {
      const ext = source.name.split('.').pop().toLowerCase();
      if (ext !== 'obj') {
        return false;
      }

      // Check file content starts with valid OBJ markers
      try {
        const text = await source.slice(0, 1000).text();
        const objMarkers = ['v ', 'vn ', 'vt ', 'f ', 'o ', 'g ', 'usemtl ', 'mtllib '];
        return objMarkers.some(marker => text.includes(marker));
      } catch {
        return false;
      }
    }

    if (typeof source === 'string') {
      const ext = source.split('.').pop().split('?')[0].toLowerCase();
      return ext === 'obj';
    }

    return false;
  }

  /**
   * Get supported extensions
   * @returns {string[]}
   */
  getSupportedExtensions() {
    return ['obj', 'mtl'];
  }

  /**
   * Get format name
   * @returns {string}
   */
  getFormatName() {
    return 'Wavefront OBJ';
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.objLoader = null;
    this.mtlLoader = null;
    this.textureLoader = null;
  }
}
