/**
 * Model Entity - Represents a 3D model in the domain
 * Pure domain logic with no external dependencies
 *
 * @class Model
 * @description Immutable domain entity representing a complete 3D model
 */

import { BoundingBox } from '../values/BoundingBox.js';

export class Model {
  /**
   * Create a new Model instance
   *
   * @param {Object} params - Model parameters
   * @param {string} params.id - Unique identifier
   * @param {string} params.name - Display name
   * @param {string} params.format - File format (gltf, glb, obj, stl, step)
   * @param {string|File} params.source - URL or File object
   * @param {Object} [params.metadata={}] - Additional metadata
   * @param {Section[]} [params.sections=[]] - Model sections
   * @param {Assembly} [params.assembly=null] - Assembly structure
   * @param {BoundingBox} [params.boundingBox=null] - Bounding box
   * @param {Date} [params.loadedAt=null] - Load timestamp
   */
  constructor({
    id,
    name,
    format,
    source,
    metadata = {},
    sections = [],
    assembly = null,
    boundingBox = null,
    loadedAt = null,
  }) {
    // Validate required fields
    if (!id) throw new Error('Model id is required');
    if (!name) throw new Error('Model name is required');
    if (!format) throw new Error('Model format is required');
    if (!source) throw new Error('Model source is required');

    // Make properties immutable
    Object.defineProperties(this, {
      id: { value: id, enumerable: true },
      name: { value: name, enumerable: true },
      format: { value: format.toLowerCase(), enumerable: true },
      source: { value: source, enumerable: true },
      metadata: { value: Object.freeze({ ...metadata }), enumerable: true },
      sections: { value: Object.freeze([...sections]), enumerable: true },
      assembly: { value: assembly, enumerable: true },
      boundingBox: { value: boundingBox, enumerable: true },
      loadedAt: { value: loadedAt || new Date(), enumerable: true },
    });

    // Freeze the instance
    Object.freeze(this);
  }

  /**
   * Check if model is loaded from a file
   * @returns {boolean}
   */
  isFile() {
    return this.source instanceof File;
  }

  /**
   * Check if model is loaded from a URL
   * @returns {boolean}
   */
  isURL() {
    return typeof this.source === 'string';
  }

  /**
   * Get model file extension
   * @returns {string}
   */
  getExtension() {
    let ext = '';
    if (this.isFile()) {
      ext = this.source.name.split('.').pop().toLowerCase();
    } else if (this.isURL()) {
      ext = this.source.split('.').pop().split('?')[0].toLowerCase();
    } else {
      ext = this.format;
    }
    // Return with dot prefix if extension is valid
    return ext && !ext.includes('/') ? `.${ext}` : '';
  }

  /**
   * Check if format is supported
   * @returns {boolean}
   */
  isFormatSupported() {
    const supportedFormats = ['gltf', 'glb', 'obj', 'stl', 'step', 'stp', 'fbx'];
    return supportedFormats.includes(this.format);
  }

  /**
   * Get total number of sections
   * @returns {number}
   */
  getSectionCount() {
    return this.sections.length;
  }

  /**
   * Get all sections
   * @returns {Section[]}
   */
  getSections() {
    return this.sections;
  }

  /**
   * Find section by ID
   * @param {string} sectionId
   * @returns {Section|null}
   */
  findSection(sectionId) {
    return this.sections.find(s => s.id === sectionId) || null;
  }

  /**
   * Check if model has assembly structure
   * @returns {boolean}
   */
  hasAssembly() {
    return this.assembly !== null;
  }

  /**
   * Check if model has sections
   * @returns {boolean}
   */
  hasSections() {
    return this.sections.length > 0;
  }

  /**
   * Get volume from bounding box
   * @returns {number}
   */
  getVolume() {
    if (!this.boundingBox) return 0;
    return this.boundingBox.getVolume();
  }

  /**
   * Get model dimensions from bounding box
   * @returns {{width: number, height: number, depth: number}|null}
   */
  getDimensions() {
    if (!this.boundingBox) return null;
    return this.boundingBox.getDimensions();
  }

  /**
   * Create a new Model with updated properties (immutable update)
   *
   * @param {Object} updates - Properties to update
   * @returns {Model} New Model instance
   */
  update(updates) {
    return new Model({
      id: this.id,
      name: this.name,
      format: this.format,
      source: this.source,
      metadata: this.metadata,
      sections: this.sections,
      assembly: this.assembly,
      boundingBox: this.boundingBox,
      loadedAt: this.loadedAt,
      ...updates,
    });
  }

  /**
   * Validate model data
   * @returns {{isValid: boolean, errors: string[]}}
   */
  validate() {
    const errors = [];

    if (!this.id || typeof this.id !== 'string') {
      errors.push('Invalid or missing id');
    }

    if (!this.name || typeof this.name !== 'string') {
      errors.push('Invalid or missing name');
    }

    if (!this.isFormatSupported()) {
      errors.push(`Unsupported format: ${this.format}`);
    }

    if (!this.source) {
      errors.push('Missing source');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      format: this.format,
      source: this.isFile()
        ? {
            name: this.source.name,
            type: this.source.type,
            size: this.source.size,
          }
        : this.source,
      metadata: this.metadata,
      sections: this.sections,
      assembly: this.assembly,
      boundingBox: this.boundingBox,
      loadedAt: this.loadedAt.toISOString(),
    };
  }

  /**
   * Create Model from plain object
   *
   * @param {Object} data - Plain object data
   * @returns {Model}
   */
  static fromJSON(data) {
    return new Model({
      id: data.id,
      name: data.name,
      format: data.format,
      source: data.source,
      metadata: data.metadata || {},
      sections: data.sections || [],
      assembly: data.assembly || null,
      boundingBox: data.boundingBox ? BoundingBox.fromJSON(data.boundingBox) : null,
      loadedAt: data.loadedAt ? new Date(data.loadedAt) : new Date(),
    });
  }

  /**
   * Create a clone of the model with optional overrides
   * @param {Object} [overrides={}] - Properties to override in the clone
   * @returns {Model}
   */
  clone(overrides = {}) {
    return new Model({
      id: this.id,
      name: this.name,
      format: this.format,
      source: this.source,
      metadata: { ...this.metadata },
      sections: [...this.sections],
      assembly: this.assembly ? { ...this.assembly } : null,
      boundingBox: this.boundingBox ? this.boundingBox.clone() : null,
      loadedAt: new Date(this.loadedAt),
      ...overrides,
    });
  }

  /**
   * Compare with another model
   * @param {Model|null} other - Model to compare with
   * @returns {boolean}
   */
  equals(other) {
    if (!other || !(other instanceof Model)) return false;
    return this.id === other.id;
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `Model(id=${this.id}, name=${this.name}, format=${this.format}, sections=${this.getSectionCount()})`;
  }
}
