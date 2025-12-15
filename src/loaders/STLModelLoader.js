import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Model } from '../core/entities/Model.js';
import { Section } from '../core/entities/Section.js';

/**
 * STLModelLoader
 *
 * Loads STL format models.
 */
export class STLModelLoader {
  constructor() {
    this.loader = new STLLoader();
  }

  /**
   * Load model from file
   */
  async load(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const geometry = this.loader.parse(arrayBuffer);

          // Create mesh with default material
          const material = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            specular: 0x111111,
            shininess: 200,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = file.name;

          // Create object3D container
          const object3D = new THREE.Group();
          object3D.add(mesh);

          const model = this.processSTL(mesh, file.name);
          resolve({ model, object3D });
        } catch (error) {
          reject(new Error(`Failed to load STL model: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Process loaded STL
   */
  processSTL(mesh, fileName) {
    const geometry = mesh.geometry;

    const section = new Section({
      id: 'section_0',
      name: fileName,
      parentId: null,
      children: [],
      geometry: {
        vertexCount: geometry.attributes.position?.count || 0,
        faceCount: geometry.index
          ? geometry.index.count / 3
          : geometry.attributes.position?.count / 3 || 0,
        bounds: this.calculateBounds(geometry),
      },
      material: mesh.material?.name || null,
      transform: {
        position: mesh.position.toArray(),
        rotation: mesh.rotation.toArray(),
        scale: mesh.scale.toArray(),
      },
      properties: {},
      visible: mesh.visible,
      selectable: true,
    });

    // Store section ID in mesh
    mesh.userData.sectionId = section.id;

    // Create model
    const model = new Model({
      id: `model_${Date.now()}`,
      name: fileName,
      format: 'stl',
      sections: [section],
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
    return ext === 'stl';
  }
}
