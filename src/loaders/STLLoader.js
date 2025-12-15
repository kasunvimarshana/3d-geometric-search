/**
 * STL format loader
 * Supports both ASCII and binary STL formats
 */
import { BaseLoader } from './BaseLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Model } from '../core/Model.js';
import * as THREE from 'three';

// Import Section separately
import { Section } from '../core/Section.js';

export class STLLoaderAdapter extends BaseLoader {
  constructor() {
    super();
    this.supportedExtensions = ['stl'];
    this.loader = new STLLoader();
  }

  async load(file) {
    this.validate(file);

    try {
      const arrayBuffer = await this.readAsArrayBuffer(file);
      const geometry = this.loader.parse(arrayBuffer);

      // Convert to our domain model
      return this.convertToModel(geometry, file.name);
    } catch (error) {
      throw new Error(`Failed to load STL file: ${error.message}`);
    }
  }

  convertToModel(geometry, filename) {
    const model = new Model(`model_${Date.now()}`, filename, 'stl');

    // Compute bounding box
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    model.setBoundingBox(
      { x: bbox.min.x, y: bbox.min.y, z: bbox.min.z },
      { x: bbox.max.x, y: bbox.max.y, z: bbox.max.z }
    );

    // Create single section for STL (typically single solid)
    const section = new Section(`section_${Date.now()}`, filename, 'part');
    const meshId = `mesh_${Date.now()}`;
    section.addMeshId(meshId);
    section.setProperty('geometry', geometry);

    // Create default material
    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.2,
      roughness: 0.6,
    });
    section.setProperty('material', material);

    model.addSection(section);
    model.setMetadata('geometry', geometry);

    return model;
  }
}
