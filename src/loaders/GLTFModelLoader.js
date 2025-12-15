import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Model } from '../core/entities/Model.js';
import { Section } from '../core/entities/Section.js';

/**
 * GLTFModelLoader
 *
 * Loads glTF and GLB format models.
 */
export class GLTFModelLoader {
  constructor() {
    this.loader = new GLTFLoader();
  }

  /**
   * Load model from file
   */
  async load(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const blob = new Blob([arrayBuffer]);
          const url = URL.createObjectURL(blob);

          this.loader.load(
            url,
            (gltf) => {
              URL.revokeObjectURL(url);
              const model = this.processGLTF(gltf, file.name);
              resolve({ model, object3D: gltf.scene });
            },
            (progress) => {
              // Progress callback
            },
            (error) => {
              URL.revokeObjectURL(url);
              reject(new Error(`Failed to load glTF model: ${error.message}`));
            }
          );
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Process loaded glTF
   */
  processGLTF(gltf, fileName) {
    const sections = [];
    let sectionId = 0;

    // Process scene hierarchy
    gltf.scene.traverse((node) => {
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
      format: 'gltf',
      sections: rootSections,
      metadata: {
        author: gltf.asset?.generator || 'Unknown',
        version: gltf.asset?.version || '2.0',
      },
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
    return ext === 'gltf' || ext === 'glb';
  }
}
