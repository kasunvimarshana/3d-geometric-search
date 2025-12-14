/**
 * glTF Format Handler
 * Implements IFormatHandler for glTF/GLB files
 * Handles model loading, section discovery, and metadata extraction
 */

import { GLTFLoaderAdapter } from '../adapters/GLTFLoaderAdapter.js';
import { Model, Section, Vector3D, BoundingBox } from '../../../domain/index.js';
import * as THREE from 'three';

export class GLTFHandler {
  constructor() {
    this.adapter = new GLTFLoaderAdapter();
  }

  /**
   * Load glTF/GLB model and create domain Model
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
      throw new Error(`glTF loading failed: ${error.message}`);
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
    const format =
      source instanceof File
        ? source.name.endsWith('.glb')
          ? 'glb'
          : 'gltf'
        : source.endsWith('.glb')
          ? 'glb'
          : 'gltf';

    const name = source instanceof File ? source.name : source.split('/').pop().split('?')[0];

    // Discover sections from scene hierarchy
    const sections = this.discoverSections(threeObject);

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(threeObject);

    // Extract metadata
    const metadata = this.extractMetadata(threeObject);

    return new Model({
      id: `model-${Date.now()}`,
      name,
      format,
      source: source instanceof File ? source.name : source,
      sections,
      boundingBox,
      metadata,
      loadedAt: Date.now(),
    });
  }

  /**
   * Discover sections from Three.js scene hierarchy
   *
   * @param {THREE.Object3D} object - Root object
   * @returns {Section[]}
   */
  discoverSections(object) {
    const sections = [];
    const sectionMap = new Map();

    const traverse = (node, parentId = null, level = 0) => {
      // Only create sections for objects with meshes or children
      const meshes = [];
      node.traverse(child => {
        if (child.isMesh && child.parent === node) {
          meshes.push(child.uuid);
        }
      });

      if (meshes.length > 0 || node.children.length > 0) {
        const section = new Section({
          id: node.uuid,
          name: node.name || `Section_${sections.length}`,
          parentId,
          children: node.children
            .filter(child => child.isMesh || child.children.length > 0)
            .map(child => child.uuid),
          meshIds: meshes,
          isVisible: node.visible,
          level,
          metadata: {
            type: node.type,
            position: node.position.toArray(),
            rotation: node.rotation.toArray(),
            scale: node.scale.toArray(),
          },
        });

        sections.push(section);
        sectionMap.set(node.uuid, section);
      }

      // Recurse to children
      node.children.forEach(child => {
        traverse(child, node.uuid, level + 1);
      });
    };

    traverse(object);
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
   * Extract metadata from glTF
   *
   * @param {THREE.Object3D} object - Model object
   * @returns {Object}
   */
  extractMetadata(object) {
    const metadata = {
      nodeCount: 0,
      meshCount: 0,
      materialCount: 0,
      textureCount: 0,
      triangleCount: 0,
    };

    const materials = new Set();
    const textures = new Set();

    object.traverse(node => {
      metadata.nodeCount++;

      if (node.isMesh) {
        metadata.meshCount++;

        if (node.geometry) {
          const positions = node.geometry.attributes.position;
          if (positions) {
            metadata.triangleCount += positions.count / 3;
          }
        }

        if (node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(mat => {
            materials.add(mat.uuid);

            // Count textures
            if (mat.map) textures.add(mat.map.uuid);
            if (mat.normalMap) textures.add(mat.normalMap.uuid);
            if (mat.roughnessMap) textures.add(mat.roughnessMap.uuid);
            if (mat.metalnessMap) textures.add(mat.metalnessMap.uuid);
          });
        }
      }
    });

    metadata.materialCount = materials.size;
    metadata.textureCount = textures.size;

    return metadata;
  }

  /**
   * Validate if source is glTF/GLB
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
