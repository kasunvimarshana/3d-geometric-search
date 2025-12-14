/**
 * Model Repository - Manages available 3D models
 * Following Repository Pattern and Single Responsibility Principle
 */

import { Model, Section } from '../domain/models.js';

export class ModelRepository {
  constructor() {
    this.models = this.initializeModels();
  }

  /**
   * Initialize available models
   * In a real application, this would fetch from an API
   */
  initializeModels() {
    return [
      new Model('demo-1', 'Simple Cube', '/models/cube.gltf', 'gltf'),
      new Model('demo-2', 'Building Model', '/models/building.gltf', 'gltf'),
      new Model('demo-3', 'Complex Structure', '/models/structure.gltf', 'gltf'),
    ];
  }

  /**
   * Get all available models
   */
  getAllModels() {
    return this.models;
  }

  /**
   * Get a model by ID
   */
  getModelById(id) {
    return this.models.find(model => model.id === id);
  }

  /**
   * Add a new model
   */
  addModel(model) {
    this.models.push(model);
  }

  /**
   * Create a model from external source (URL or File)
   */
  createExternalModel(source, name = null) {
    const id = `external-${Date.now()}`;
    const modelName = name || this.getNameFromSource(source);
    const type = this.getTypeFromSource(source);

    return new Model(id, modelName, source, type);
  }

  /**
   * Extract name from source (URL or filename)
   */
  getNameFromSource(source) {
    if (source instanceof File) {
      return source.name.replace(/\.[^/.]+$/, ''); // Remove extension
    }

    if (typeof source === 'string') {
      const parts = source.split('/');
      const filename = parts[parts.length - 1];
      return filename.replace(/\.[^/.]+$/, '');
    }

    return 'External Model';
  }

  /**
   * Determine model type from source
   */
  getTypeFromSource(source) {
    let filename = '';

    if (source instanceof File) {
      filename = source.name.toLowerCase();
    } else if (typeof source === 'string') {
      filename = source.toLowerCase();
    }

    // Check all supported formats
    if (filename.endsWith('.glb')) return 'glb';
    if (filename.endsWith('.gltf')) return 'gltf';
    if (filename.endsWith('.obj')) return 'obj';
    if (filename.endsWith('.stl') || filename.endsWith('.stla')) return 'stl';
    if (filename.endsWith('.fbx')) return 'fbx';
    if (filename.endsWith('.step') || filename.endsWith('.stp')) return 'step';
    if (filename.endsWith('.mtl')) return 'mtl';

    return 'unknown';
  }

  /**
   * Create sections for a loaded model
   * This analyzes the 3D object hierarchy and creates logical sections
   */
  createSectionsFromObject(object, modelId) {
    const sections = [];
    let sectionCounter = 1;

    const traverseAndCreateSections = (node, parentSectionId = null, depth = 0) => {
      if (node.isMesh) {
        // Create a section for each mesh
        const section = new Section(
          `${modelId}-section-${sectionCounter++}`,
          node.name || `Section ${sectionCounter}`,
          [node.name || node.uuid],
          parentSectionId
        );
        sections.push(section);
        return section.id;
      }

      if (node.children && node.children.length > 0) {
        // Create a parent section for groups
        const groupSection = new Section(
          `${modelId}-section-${sectionCounter++}`,
          node.name || `Group ${sectionCounter}`,
          [],
          parentSectionId
        );
        sections.push(groupSection);

        // Process children
        node.children.forEach(child => {
          const childSectionId = traverseAndCreateSections(child, groupSection.id, depth + 1);
          if (childSectionId) {
            groupSection.children.push(childSectionId);
          }
        });

        return groupSection.id;
      }

      return null;
    };

    traverseAndCreateSections(object);
    return sections;
  }
}
