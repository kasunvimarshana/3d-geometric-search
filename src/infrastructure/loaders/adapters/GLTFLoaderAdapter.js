/**
 * GLTF Loader Adapter
 * Wraps Three.js GLTFLoader with clean interface
 * Follows Adapter Pattern to isolate Three.js dependency
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLTFLoaderAdapter {
  constructor() {
    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * Load glTF/GLB file
   *
   * @param {string|File} source - URL or File object
   * @param {Function} [onProgress] - Progress callback
   * @returns {Promise<THREE.Object3D>}
   */
  async load(source, onProgress = null) {
    const url = source instanceof File ? URL.createObjectURL(source) : source;

    try {
      const gltf = await new Promise((resolve, reject) => {
        this.loader.load(
          url,
          gltf => resolve(gltf),
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

      return gltf.scene;
    } catch (error) {
      // Clean up on error
      if (source instanceof File) {
        URL.revokeObjectURL(url);
      }
      throw new Error(`Failed to load glTF: ${error.message}`);
    }
  }

  /**
   * Validate if file is glTF/GLB
   *
   * @param {string|File} source - Source to validate
   * @returns {Promise<boolean>}
   */
  async validate(source) {
    if (source instanceof File) {
      // Check file extension
      const ext = source.name.split('.').pop().toLowerCase();
      if (!['gltf', 'glb'].includes(ext)) {
        return false;
      }

      // For GLB, check magic number (first 4 bytes should be "glTF")
      if (ext === 'glb') {
        try {
          const buffer = await source.slice(0, 4).arrayBuffer();
          const magic = new TextDecoder().decode(buffer);
          return magic === 'glTF';
        } catch {
          return false;
        }
      }

      return true;
    }

    if (typeof source === 'string') {
      const ext = source.split('.').pop().split('?')[0].toLowerCase();
      return ['gltf', 'glb'].includes(ext);
    }

    return false;
  }

  /**
   * Get supported extensions
   * @returns {string[]}
   */
  getSupportedExtensions() {
    return ['gltf', 'glb'];
  }

  /**
   * Get format name
   * @returns {string}
   */
  getFormatName() {
    return 'glTF';
  }

  /**
   * Dispose resources
   */
  dispose() {
    // GLTFLoader doesn't require explicit disposal
    // but we can clear any cached data if needed
    this.loader = null;
    this.textureLoader = null;
  }
}
