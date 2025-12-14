/**
 * Model Repository
 * Manages model data persistence and retrieval
 * Implements Repository Pattern for data access abstraction
 */

export class ModelRepository {
  constructor() {
    this.models = new Map();
    this.threeObjects = new Map();
  }

  /**
   * Save model and its Three.js representation
   *
   * @param {Model} model - Domain model
   * @param {THREE.Object3D} threeObject - Three.js object
   */
  save(model, threeObject) {
    if (!model || !model.id) {
      throw new Error('Invalid model: must have id');
    }

    this.models.set(model.id, model);
    this.threeObjects.set(model.id, threeObject);
  }

  /**
   * Find model by ID
   *
   * @param {string} modelId - Model ID
   * @returns {Model|null}
   */
  findById(modelId) {
    return this.models.get(modelId) || null;
  }

  /**
   * Get Three.js object by model ID
   *
   * @param {string} modelId - Model ID
   * @returns {THREE.Object3D|null}
   */
  getThreeObject(modelId) {
    return this.threeObjects.get(modelId) || null;
  }

  /**
   * Find all models
   *
   * @returns {Model[]}
   */
  findAll() {
    return Array.from(this.models.values());
  }

  /**
   * Find models by format
   *
   * @param {string} format - Format name
   * @returns {Model[]}
   */
  findByFormat(format) {
    return Array.from(this.models.values()).filter(model => model.format === format);
  }

  /**
   * Update existing model
   *
   * @param {string} modelId - Model ID
   * @param {Object} updates - Fields to update
   * @returns {Model|null}
   */
  update(modelId, updates) {
    const existing = this.models.get(modelId);
    if (!existing) {
      return null;
    }

    const updated = existing.update(updates);
    this.models.set(modelId, updated);
    return updated;
  }

  /**
   * Delete model by ID
   *
   * @param {string} modelId - Model ID
   * @returns {boolean} True if deleted
   */
  delete(modelId) {
    const threeObject = this.threeObjects.get(modelId);
    if (threeObject) {
      // Dispose Three.js resources
      this.disposeThreeObject(threeObject);
    }

    const hadModel = this.models.delete(modelId);
    this.threeObjects.delete(modelId);

    return hadModel;
  }

  /**
   * Delete all models
   */
  deleteAll() {
    // Dispose all Three.js objects
    this.threeObjects.forEach(obj => this.disposeThreeObject(obj));

    this.models.clear();
    this.threeObjects.clear();
  }

  /**
   * Check if model exists
   *
   * @param {string} modelId - Model ID
   * @returns {boolean}
   */
  exists(modelId) {
    return this.models.has(modelId);
  }

  /**
   * Get count of stored models
   *
   * @returns {number}
   */
  count() {
    return this.models.size;
  }

  /**
   * Dispose Three.js object resources
   *
   * @param {THREE.Object3D} object - Object to dispose
   */
  disposeThreeObject(object) {
    object.traverse(node => {
      if (node.geometry) {
        node.geometry.dispose();
      }

      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];

        materials.forEach(material => {
          // Dispose textures
          if (material.map) material.map.dispose();
          if (material.lightMap) material.lightMap.dispose();
          if (material.bumpMap) material.bumpMap.dispose();
          if (material.normalMap) material.normalMap.dispose();
          if (material.specularMap) material.specularMap.dispose();
          if (material.envMap) material.envMap.dispose();
          if (material.roughnessMap) material.roughnessMap.dispose();
          if (material.metalnessMap) material.metalnessMap.dispose();

          // Dispose material
          material.dispose();
        });
      }
    });
  }

  /**
   * Get repository statistics
   *
   * @returns {Object}
   */
  getStatistics() {
    const stats = {
      totalModels: this.models.size,
      byFormat: {},
      totalSections: 0,
      totalMeshes: 0,
    };

    this.models.forEach(model => {
      // Count by format
      stats.byFormat[model.format] = (stats.byFormat[model.format] || 0) + 1;

      // Count sections
      stats.totalSections += model.getSectionCount();

      // Count meshes
      model.sections.forEach(section => {
        stats.totalMeshes += section.meshIds.length;
      });
    });

    return stats;
  }
}
