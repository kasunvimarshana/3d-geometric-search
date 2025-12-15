import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Model } from '../core/entities/Model.js';
import { Section } from '../core/entities/Section.js';

/**
 * OBJModelLoader
 *
 * Loads OBJ format models with optional MTL materials.
 */
export class OBJModelLoader {
  constructor() {
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
  }

  /**
   * Load model from file
   */
  async load(file, mtlFile = null) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const objText = e.target.result;

          let materials = null;
          if (mtlFile) {
            materials = await this.loadMTL(mtlFile);
            if (materials) {
              this.objLoader.setMaterials(materials);
            }
          }

          const object = this.objLoader.parse(objText);
          const model = this.processOBJ(object, file.name);
          resolve({ model, object3D: object });
        } catch (error) {
          reject(new Error(`Failed to load OBJ model: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Load MTL materials
   */
  async loadMTL(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const mtlText = e.target.result;
          const materials = this.mtlLoader.parse(mtlText);
          materials.preload();
          resolve(materials);
        } catch (error) {
          console.warn('Failed to load MTL:', error);
          resolve(null);
        }
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsText(file);
    });
  }

  /**
   * Process loaded OBJ
   */
  processOBJ(object, fileName) {
    const sections = [];
    let sectionId = 0;

    // Process object hierarchy
    object.traverse((node) => {
      if (node.isMesh) {
        const section = new Section({
          id: `section_${sectionId++}`,
          name: node.name || `Mesh ${sectionId}`,
          parentId: node.parent?.userData?.sectionId || null,
          children: [],
          geometry: {
            vertexCount: node.geometry.attributes.position?.count || 0,
            faceCount: node.geometry.index
              ? node.geometry.index.count / 3
              : node.geometry.attributes.position?.count / 3 || 0,
            bounds: this.calculateBounds(node.geometry),
          },
          material: node.material?.name || null,
          transform: {
            position: node.position.toArray(),
            rotation: node.rotation.toArray(),
            scale: node.scale.toArray(),
          },
          properties: {},
          visible: node.visible,
          selectable: true,
        });

        // Store section ID in node
        node.userData.sectionId = section.id;

        sections.push(section);
      }
    });

    // Build hierarchy
    const sectionsMap = new Map(sections.map((s) => [s.id, s]));
    const rootSections = [];

    sections.forEach((section) => {
      if (section.parentId && sectionsMap.has(section.parentId)) {
        const parent = sectionsMap.get(section.parentId);
        parent.children.push(section);
      } else {
        rootSections.push(section);
      }
    });

    // Create model
    const model = new Model({
      id: `model_${Date.now()}`,
      name: fileName,
      format: 'obj',
      sections: rootSections,
      metadata: {},
    });

    return model;
  }

  /**
   * Calculate geometry bounds
   */
  calculateBounds(geometry) {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;

    if (!bbox) {
      return null;
    }

    return {
      min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
      max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
    };
  }

  /**
   * Check if file is supported
   */
  static supports(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    return ext === 'obj';
  }
}
