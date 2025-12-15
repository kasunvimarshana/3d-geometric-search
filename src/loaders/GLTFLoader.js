/**
 * glTF/GLB format loader
 * Supports both glTF JSON and binary GLB formats
 */
import { BaseLoader } from './BaseLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Model } from '../core/Model.js';
import * as THREE from 'three';

// Import Section separately
import { Section } from '../core/Section.js';

export class GLTFLoaderAdapter extends BaseLoader {
  constructor() {
    super();
    this.supportedExtensions = ['gltf', 'glb'];
    this.loader = new GLTFLoader();
  }

  async load(file) {
    this.validate(file);

    try {
      const arrayBuffer = await this.readAsArrayBuffer(file);
      const url = URL.createObjectURL(new Blob([arrayBuffer]));

      const gltf = await new Promise((resolve, reject) => {
        this.loader.load(
          url,
          (result) => resolve(result),
          undefined,
          (error) => reject(error)
        );
      });

      URL.revokeObjectURL(url);

      // Convert glTF to our domain model
      return this.convertToModel(gltf, file.name);
    } catch (error) {
      throw new Error(`Failed to load glTF file: ${error.message}`);
    }
  }

  convertToModel(gltf, filename) {
    const model = new Model(`model_${Date.now()}`, filename, 'gltf');

    // Extract bounding box
    const bbox = this.calculateBoundingBox(gltf.scene);
    model.setBoundingBox(bbox.min, bbox.max);

    // Convert scene hierarchy to sections
    this.traverseScene(gltf.scene, model);

    // Store original glTF data
    model.setMetadata('gltfScene', gltf.scene);
    model.setMetadata('animations', gltf.animations);

    return model;
  }

  traverseScene(object, model, parentSection = null) {
    if (!object) return;

    // Create section for this object
    const section = new Section(
      `section_${object.uuid}`,
      object.name || 'Unnamed',
      object.type === 'Group' ? 'assembly' : 'component'
    );

    // Store mesh reference
    if (object.isMesh) {
      section.addMeshId(`mesh_${object.uuid}`);
      section.setProperty('geometry', object.geometry);
      section.setProperty('material', object.material);
    }

    // Store transform
    section.setTransform(
      { x: object.position.x, y: object.position.y, z: object.position.z },
      { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
      { x: object.scale.x, y: object.scale.y, z: object.scale.z }
    );

    // Add to parent or model
    if (parentSection) {
      parentSection.addChild(section);
    } else {
      model.addSection(section);
    }

    // Recursively process children
    if (object.children && object.children.length > 0) {
      object.children.forEach((child) => {
        this.traverseScene(child, model, section);
      });
    }
  }

  calculateBoundingBox(object) {
    const bbox = new THREE.Box3().setFromObject(object);
    return {
      min: { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
      max: { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z },
    };
  }
}
