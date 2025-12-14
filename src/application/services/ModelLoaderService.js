/**
 * Model Loader Service
 * Implements IModelLoader interface
 * Orchestrates model loading with format handlers
 */

import {
  GLTFHandler,
  OBJHandler,
  STLHandler,
  STEPHandler,
  FormatDetector,
} from '../../infrastructure/index.js';

export class ModelLoaderService {
  constructor(modelRepository, eventBus) {
    this.modelRepository = modelRepository;
    this.eventBus = eventBus;

    // Initialize format handlers
    this.handlers = new Map([
      ['gltf', new GLTFHandler()],
      ['glb', new GLTFHandler()],
      ['obj', new OBJHandler()],
      ['stl', new STLHandler()],
      ['step', new STEPHandler()],
      ['stp', new STEPHandler()],
    ]);
  }

  /**
   * Load model with progress tracking
   *
   * @param {string|File} source - Model source
   * @param {Object} [options] - Loading options
   * @param {string} [options.format] - Force specific format
   * @param {string|File} [options.mtlSource] - MTL file for OBJ
   * @returns {Promise<Model>}
   */
  async loadWithProgress(source, options = {}) {
    try {
      // Emit start event
      this.eventBus.emit('model:load:started', { source });

      // Detect format
      const format = options.format || (await this.detectFormat(source));
      if (!format) {
        throw new Error('Unknown file format. Please specify format explicitly.');
      }

      // Get appropriate handler
      const handler = this.getHandler(format);
      if (!handler) {
        throw new Error(`No handler available for format: ${format}`);
      }

      // Create progress callback
      const onProgress = (percent, loaded, total) => {
        this.eventBus.emit('model:load:progress', {
          source,
          format,
          percent,
          loaded,
          total,
        });
      };

      // Load model
      let result;
      if (format === 'obj' && options.mtlSource) {
        result = await handler.load(source, options.mtlSource, onProgress);
      } else {
        result = await handler.load(source, onProgress);
      }

      const { model, threeObject } = result;

      // Store in repository
      this.modelRepository.save(model, threeObject);

      // Emit success event
      this.eventBus.emit('model:loaded', {
        model,
        format,
        source,
      });

      return model;
    } catch (error) {
      // Emit failure event
      this.eventBus.emit('model:load:failed', {
        source,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Load model without progress tracking
   *
   * @param {string|File} source - Model source
   * @param {Object} [options] - Loading options
   * @returns {Promise<Model>}
   */
  async load(source, options = {}) {
    return this.loadWithProgress(source, options);
  }

  /**
   * Detect format from source
   *
   * @param {string|File} source - Model source
   * @returns {Promise<string|null>}
   */
  async detectFormat(source) {
    if (source instanceof File) {
      return FormatDetector.detectFromFile(source);
    } else if (typeof source === 'string') {
      return FormatDetector.detectFromURL(source);
    }
    return null;
  }

  /**
   * Get handler for format
   *
   * @param {string} format - Format name
   * @returns {IFormatHandler|null}
   */
  getHandler(format) {
    return this.handlers.get(format.toLowerCase()) || null;
  }

  /**
   * Check if format is supported
   *
   * @param {string} format - Format name
   * @returns {boolean}
   */
  supportsFormat(format) {
    return this.handlers.has(format.toLowerCase());
  }

  /**
   * Get all supported formats
   *
   * @returns {string[]}
   */
  getSupportedFormats() {
    return Array.from(new Set(this.handlers.keys()));
  }

  /**
   * Get all supported extensions
   *
   * @returns {string[]}
   */
  getSupportedExtensions() {
    return FormatDetector.getSupportedExtensions();
  }

  /**
   * Unload model
   *
   * @param {string} modelId - Model ID
   */
  unload(modelId) {
    const model = this.modelRepository.findById(modelId);
    if (model) {
      this.modelRepository.delete(modelId);

      this.eventBus.emit('model:unloaded', {
        modelId,
        model,
      });
    }
  }

  /**
   * Unload all models
   */
  unloadAll() {
    const models = this.modelRepository.findAll();
    this.modelRepository.deleteAll();

    models.forEach(model => {
      this.eventBus.emit('model:unloaded', {
        modelId: model.id,
        model,
      });
    });
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.handlers.forEach(handler => handler.dispose());
    this.handlers.clear();
  }
}
