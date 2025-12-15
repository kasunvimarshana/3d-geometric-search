/**
 * Geometric Search Engine
 * Performs similarity search based on geometric features
 */

import {
  extractFeatures,
  compareSimilarity,
} from "../core/geometricFeatures.js";

export class SearchEngine {
  constructor() {
    this.modelDatabase = new Map();
    this.featureCache = new Map();
  }

  /**
   * Indexes a model for search
   * @param {Model3D} model - Model to index
   */
  indexModel(model) {
    if (!model || !model.id) return;

    try {
      const features = extractFeatures(model);
      this.modelDatabase.set(model.id, model);
      this.featureCache.set(model.id, features);
    } catch (error) {
      console.error("Error indexing model:", error);
    }
  }

  /**
   * Searches for similar models
   * @param {Model3D} queryModel - Query model
   * @param {number} topK - Number of results to return
   * @returns {Array} - Search results with similarity scores
   */
  search(queryModel, topK = 10) {
    if (!queryModel) return [];

    try {
      // Extract features from query model
      const queryFeatures =
        this.featureCache.get(queryModel.id) || extractFeatures(queryModel);

      // Compare with all indexed models
      const results = [];

      this.featureCache.forEach((features, modelId) => {
        if (modelId === queryModel.id) return; // Skip self

        const similarity = compareSimilarity(queryFeatures, features);
        const model = this.modelDatabase.get(modelId);

        if (model) {
          results.push({
            model,
            similarity,
            score: Math.round(similarity * 100),
          });
        }
      });

      // Sort by similarity (descending)
      results.sort((a, b) => b.similarity - a.similarity);

      // Return top K results
      return results.slice(0, topK);
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  /**
   * Removes a model from the index
   * @param {string} modelId - Model ID to remove
   */
  removeModel(modelId) {
    this.modelDatabase.delete(modelId);
    this.featureCache.delete(modelId);
  }

  /**
   * Clears the entire index
   */
  clear() {
    this.modelDatabase.clear();
    this.featureCache.clear();
  }

  /**
   * Gets the number of indexed models
   * @returns {number}
   */
  getIndexSize() {
    return this.modelDatabase.size;
  }

  /**
   * Gets all indexed models
   * @returns {Model3D[]}
   */
  getAllModels() {
    return Array.from(this.modelDatabase.values());
  }

  /**
   * Filters models by criteria
   * @param {Function} predicate - Filter function
   * @returns {Model3D[]}
   */
  filterModels(predicate) {
    const models = this.getAllModels();
    return models.filter(predicate);
  }

  /**
   * Searches by format
   * @param {string} format - File format
   * @returns {Model3D[]}
   */
  searchByFormat(format) {
    return this.filterModels((model) => model.format === format);
  }

  /**
   * Searches by size range
   * @param {number} minSize - Minimum size
   * @param {number} maxSize - Maximum size
   * @returns {Model3D[]}
   */
  searchBySize(minSize, maxSize) {
    return this.filterModels((model) => {
      const features = this.featureCache.get(model.id);
      if (!features) return false;

      const volume = features.volume;
      return volume >= minSize && volume <= maxSize;
    });
  }
}
