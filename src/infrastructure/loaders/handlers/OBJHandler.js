/**
 * OBJ Format Handler
 * Implements IFormatHandler for OBJ/MTL files
 * Handles model loading, section discovery, and metadata extraction
 */

import { OBJLoaderAdapter } from '../adapters/OBJLoaderAdapter.js';
import { Model, Section, Vector3D, BoundingBox } from '../../../domain/index.js';
import * as THREE from 'three';

export class OBJHandler {
  constructor() {
    this.adapter = new OBJLoaderAdapter();
  }

  /**
   * Load OBJ model and create domain Model
   *
   * @param {string|File} source - Model source
   * @param {string|File} [mtlSource] - Optional MTL source
   * @param {Function} [onProgress] - Progress callback
   * @returns {Promise<{model: Model, threeObject: THREE.Object3D}>}
   */
  async load(source, mtlSource = null, onProgress = null) {
    try {
      // Load Three.js object
      const threeObject = await this.adapter.load(source, mtlSource, onProgress);

      // Create domain model
      const model = await this.createDomainModel(source, threeObject);

      return { model, threeObject };
    } catch (error) {
      throw new Error(`OBJ loading failed: ${error.message}`);
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

    // Discover sections (OBJ groups/objects)
    const sections = this.discoverSections(threeObject);

    // Calculate bounding box
    const boundingBox = this.calculateBoundingBox(threeObject);

    // Extract metadata
    const metadata = this.extractMetadata(threeObject);

    return new Model({
      id: `model-${Date.now()}`,
      name,
      format: 'obj',
      source: source instanceof File ? source.name : source,
      sections,
      boundingBox,
      metadata,
      loadedAt: Date.now(),
    });
  }

  /**
   * Discover sections from OBJ groups and objects
   *
   * @param {THREE.Object3D} object - Root object
   * @returns {Section[]}
   */
  discoverSections(object) {
    const sections = [];
    const rootSection = this.createRootSection(object);
    sections.push(rootSection);

    // OBJ files are typically flat - each child is a group or mesh
    object.children.forEach((child, index) => {
      const meshIds = [];

      if (child.isMesh) {
        meshIds.push(child.uuid);
      } else {
        // Group - collect all meshes
        child.traverse(node => {
          if (node.isMesh) {
            meshIds.push(node.uuid);
          }
        });
      }

      if (meshIds.length > 0) {
        const section = new Section({
          id: child.uuid,
          name: child.name || `Group_${index}`,
          parentId: rootSection.id,
          children: [],
          meshIds,
          isVisible: child.visible,
          level: 1,
          metadata: {
            type: child.type,
            meshCount: meshIds.length,
          },
        });

        sections.push(section);
      }
    });

    return sections;
  }

  /**
   * Create root section
   *
   * @param {THREE.Object3D} object - Root object
   * @returns {Section}
   */
  createRootSection(object) {
    const childIds = object.children
      .filter(child => child.isMesh || child.children.length > 0)
      .map(child => child.uuid);

    return new Section({
      id: object.uuid,
      name: object.name || 'Root',
      parentId: null,
      children: childIds,
      meshIds: [],
      isVisible: true,
      level: 0,
      metadata: {
        type: 'root',
        childCount: childIds.length,
      },
    });
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
   * Extract metadata from OBJ
   *
   * @param {THREE.Object3D} object - Model object
   * @returns {Object}
   */
  extractMetadata(object) {
    const metadata = {
      groupCount: 0,
      meshCount: 0,
      materialCount: 0,
      vertexCount: 0,
      faceCount: 0,
    };

    const materials = new Set();

    object.traverse(node => {
      if (node.type === 'Group') {
        metadata.groupCount++;
      }

      if (node.isMesh) {
        metadata.meshCount++;

        if (node.geometry) {
          const positions = node.geometry.attributes.position;
          if (positions) {
            metadata.vertexCount += positions.count;
            metadata.faceCount += positions.count / 3;
          }
        }

        if (node.material) {
          const mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(mat => materials.add(mat.uuid));
        }
      }
    });

    metadata.materialCount = materials.size;

    return metadata;
  }

  /**
   * Validate if source is OBJ
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
    return ['obj']; // Don't include 'mtl' as it's not a primary format
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
