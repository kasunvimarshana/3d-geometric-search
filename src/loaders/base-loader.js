/**
 * Base Loader Interface
 *
 * Defines the contract that all format loaders must implement.
 * Follows the Interface Segregation Principle.
 */

export class BaseLoader {
  /**
   * Loads a 3D model from file data
   * @param {ArrayBuffer|String} data - File data
   * @param {String} filename - Original filename
   * @returns {Promise<LoadResult>} Load result with scene and sections
   */
  async load(data, filename) {
    throw new Error("load() must be implemented by subclass");
  }

  /**
   * Validates if the loader can handle the given format
   * @param {String} extension - File extension
   * @returns {Boolean}
   */
  canHandle(extension) {
    throw new Error("canHandle() must be implemented by subclass");
  }
}

/**
 * Load result structure
 */
export class LoadResult {
  constructor(scene, sections, metadata = {}) {
    this.scene = scene;
    this.sections = sections;
    this.metadata = metadata;
  }
}
