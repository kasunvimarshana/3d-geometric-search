/**
 * STL Loader Adapter
 * Wraps Three.js STLLoader with clean interface
 * Supports both ASCII and binary STL formats
 */

import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export class STLLoaderAdapter {
  constructor() {
    this.loader = new STLLoader();
  }

  /**
   * Load STL file
   *
   * @param {string|File} source - URL or File object
   * @param {Function} [onProgress] - Progress callback
   * @returns {Promise<THREE.Object3D>}
   */
  async load(source, onProgress = null) {
    const url = source instanceof File ? URL.createObjectURL(source) : source;

    try {
      const geometry = await new Promise((resolve, reject) => {
        this.loader.load(
          url,
          geometry => resolve(geometry),
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

      // STL loader returns geometry, wrap it in mesh
      return this.createMeshFromGeometry(geometry);
    } catch (error) {
      // Clean up on error
      if (source instanceof File) {
        URL.revokeObjectURL(url);
      }
      throw new Error(`Failed to load STL: ${error.message}`);
    }
  }

  /**
   * Create mesh from STL geometry
   *
   * @param {THREE.BufferGeometry} geometry - Loaded geometry
   * @returns {THREE.Object3D}
   */
  createMeshFromGeometry(geometry) {
    // Compute normals for smooth shading
    geometry.computeVertexNormals();

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.1,
      roughness: 0.8,
      flatShading: false,
    });

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'STL Model';
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Wrap in group for consistency with other loaders
    const group = new THREE.Group();
    group.add(mesh);
    group.name = 'STL Root';

    return group;
  }

  /**
   * Validate if file is STL
   *
   * @param {string|File} source - Source to validate
   * @returns {Promise<boolean>}
   */
  async validate(source) {
    if (source instanceof File) {
      const ext = source.name.split('.').pop().toLowerCase();
      if (!['stl', 'stla'].includes(ext)) {
        return false;
      }

      // Check if binary or ASCII STL
      try {
        const buffer = await source.slice(0, 100).arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Binary STL check: first 80 bytes are header, next 4 bytes are triangle count
        // ASCII STL check: starts with "solid"
        const text = new TextDecoder().decode(bytes);

        // Check for ASCII STL
        if (text.toLowerCase().startsWith('solid')) {
          return true;
        }

        // Binary STL is harder to validate without loading
        // Just check if it's not obviously wrong
        return bytes.length >= 84; // Minimum size for binary STL
      } catch {
        return false;
      }
    }

    if (typeof source === 'string') {
      const ext = source.split('.').pop().split('?')[0].toLowerCase();
      return ['stl', 'stla'].includes(ext);
    }

    return false;
  }

  /**
   * Detect if STL is binary or ASCII
   *
   * @param {File} file - File to check
   * @returns {Promise<'binary'|'ascii'>}
   */
  async detectSTLFormat(file) {
    const buffer = await file.slice(0, 100).arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    return text.toLowerCase().startsWith('solid') ? 'ascii' : 'binary';
  }

  /**
   * Get supported extensions
   * @returns {string[]}
   */
  getSupportedExtensions() {
    return ['stl', 'stla'];
  }

  /**
   * Get format name
   * @returns {string}
   */
  getFormatName() {
    return 'STL (Stereolithography)';
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.loader = null;
  }
}
