/**
 * OBJ format loader
 * Supports OBJ with optional MTL material files
 */
import { BaseLoader } from './BaseLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { Model } from '../core/Model.js';
import * as THREE from 'three';

// Import Section separately to avoid any hoisting issues
import { Section } from '../core/Section.js';

export class OBJLoaderAdapter extends BaseLoader {
  constructor() {
    super();
    this.supportedExtensions = ['obj'];
    this.objLoader = new OBJLoader();
    this.mtlLoader = new MTLLoader();
  }

  async load(file, mtlFile = null) {
    this.validate(file);

    try {
      // Load MTL if provided
      if (mtlFile) {
        const mtlText = await this.readAsText(mtlFile);
        const materials = this.mtlLoader.parse(mtlText, '');
        materials.preload();
        this.objLoader.setMaterials(materials);
      }

      // Load OBJ
      const objText = await this.readAsText(file);
      const object = this.objLoader.parse(objText);

      // Convert to our domain model
      return this.convertToModel(object, file.name);
    } catch (error) {
      throw new Error(`Failed to load OBJ file: ${error.message}`);
    }
  }

  convertToModel(object, filename) {
    const model = new Model(`model_${Date.now()}`, filename, 'obj');

    // Calculate bounding box
    const bbox = new THREE.Box3().setFromObject(object);
    model.setBoundingBox(
      { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
      { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z }
    );

    // Convert object hierarchy to sections
    this.traverseObject(object, model);

    // Store original object
    model.setMetadata('objScene', object);

    return model;
  }

  traverseObject(object, model, parentSection = null) {
    if (!object) return;

    const section = new Section(
      `section_${object.uuid}`,
      object.name || 'Unnamed',
      object.type === 'Group' ? 'assembly' : 'part'
    );

    if (object.isMesh) {
      section.addMeshId(`mesh_${object.uuid}`);
      section.setProperty('geometry', object.geometry);
      section.setProperty('material', object.material);
    }

    section.setTransform(
      { x: object.position.x, y: object.position.y, z: object.position.z },
      { x: object.rotation.x, y: object.rotation.y, z: object.rotation.z },
      { x: object.scale.x, y: object.scale.y, z: object.scale.z }
    );

    if (parentSection) {
      parentSection.addChild(section);
    } else {
      model.addSection(section);
    }

    if (object.children && object.children.length > 0) {
      object.children.forEach((child) => {
        this.traverseObject(child, model, section);
      });
    }
  }
}
