/**
 * STL Format Handler
 * Implements IFormatHandler for STL files (binary and ASCII)
 * Handles model loading and metadata extraction
 */

import { STLLoaderAdapter } from '../adapters/STLLoaderAdapter.js';
import { Model, Section, Vector3D, BoundingBox } from '../../../domain/index.js';
import * as THREE from 'three';

export class STLHandler {
  constructor() {
    this.adapter = new STLLoaderAdapter();
  }

  /**
   * Load STL model and create domain Model
   *
   * @param {string|File} source - Model source
   * @param {Function} [onProgress] - Progress callback
   * @returns {Promise<{model: Model, threeObject: THREE.Object3D}>}
   */
  async load(source, onProgress = null) {
    try {
      // Load Three.js object
      const threeObject = await this.adapter.load(source, onProgress);

      // Create domain model
      const model = await this.createDomainModel(source, threeObject);

      return { model, threeObject };
    } catch (error) {
      throw new Error(`STL loading failed: ${error.message}`);
    }
  }

  /**
   * Create domain Model from Three.js object
   *
   * @param {string|File} source - Original source
   * @param {THREE.Object3D} threeObject - Loaded Three.js object
   * @returns {Promise<Model>}
   */
  async createDomainModel(source, threeObject) {
    const name = source instanceof File ? source.name : source.split('/').pop().split('?')[0];

    // STL files are typically single mesh, create simple section structure
    const sections = this.discoverSections(threeObject);

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(threeObject);

    // Extract metadata
    const metadata = await this.extractMetadata(source, threeObject);

    return new Model({
      id: `model-${Date.now()}`,
      name,
      format: 'stl',
      source: source instanceof File ? source.name : source,
      sections,
      boundingBox,
      metadata,
      loadedAt: Date.now(),
    });
  }

  /**
   * Discover sections (STL is typically single mesh)
   *
   * @param {THREE.Object3D} object - Root object
   * @returns {Section[]}
   */
  discoverSections(object) {
    const sections = [];

    // Create root section
    const mesh = object.children.find(child => child.isMesh);
    if (mesh) {
      const rootSection = new Section({
        id: object.uuid,
        name: 'STL Model',
        parentId: null,
        children: [mesh.uuid],
        meshIds: [],
        isVisible: true,
        level: 0,
        metadata: {
          type: 'root',
        },
      });
      sections.push(rootSection);

      // Create single mesh section
      const meshSection = new Section({
        id: mesh.uuid,
        name: mesh.name || 'Mesh',
        parentId: object.uuid,
        children: [],
        meshIds: [mesh.uuid],
        isVisible: mesh.visible,
        level: 1,
        metadata: {
          type: 'mesh',
          geometry: mesh.geometry.type,
        },
      });
      sections.push(meshSection);
    }

    return sections;
  }

  /**
   * Calculate bounding box for entire model
   *
   * @param {THREE.Object3D} object - Model object
   * @returns {BoundingBox}
   */
  calculateBoundingBox(object) {
    const box = new THREE.Box3().setFromObject(object);

    return new BoundingBox({
      min: new Vector3D({ x: box.min.x, y: box.min.y, z: box.min.z }),
      max: new Vector3D({ x: box.max.x, y: box.max.y, z: box.max.z }),
    });
  }

  /**
   * Extract metadata from STL
   *
   * @param {string|File} source - Original source
   * @param {THREE.Object3D} object - Model object
   * @returns {Promise<Object>}
   */
  async extractMetadata(source, object) {
    const metadata = {
      format: 'unknown',
      vertexCount: 0,
      triangleCount: 0,
      hasNormals: false,
      hasColors: false,
    };

    // Detect binary vs ASCII
    if (source instanceof File) {
      metadata.format = await this.adapter.detectSTLFormat(source);
    }

    // Get geometry info
    const mesh = object.children.find(child => child.isMesh);
    if (mesh && mesh.geometry) {
      const geometry = mesh.geometry;

      if (geometry.attributes.position) {
        metadata.vertexCount = geometry.attributes.position.count;
        metadata.triangleCount = metadata.vertexCount / 3;
      }

      metadata.hasNormals = !!geometry.attributes.normal;
      metadata.hasColors = !!geometry.attributes.color;
    }

    return metadata;
  }

  /**
   * Validate if source is STL
   *
   * @param {string|File} source - Source to validate
   * @returns {Promise<boolean>}
   */
  async validate(source) {
    return this.adapter.validate(source);
  }

  /**
   * Get supported extensions
   *
   * @returns {string[]}
   */
  getSupportedExtensions() {
    return this.adapter.getSupportedExtensions();
  }

  /**
   * Get format name
   *
   * @returns {string}
   */
  getFormatName() {
    return this.adapter.getFormatName();
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.adapter.dispose();
  }
}
