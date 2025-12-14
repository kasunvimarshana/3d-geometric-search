/**
 * Domain Model Interfaces
 * Contracts for services and handlers following Interface Segregation Principle
 */

/**
 * Model Loader Interface
 * Contract for loading 3D models from various sources
 *
 * @interface IModelLoader
 */
export class IModelLoader {
  /**
   * Load a model from source
   * @param {Model} model - Model to load
   * @returns {Promise<Object3D>} Loaded 3D object
   * @abstract
   */
  async load(model) {
    throw new Error('IModelLoader.load() must be implemented');
  }

  /**
   * Load model with progress callback
   * @param {Model} model - Model to load
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object3D>} Loaded 3D object
   * @abstract
   */
  async loadWithProgress(model, onProgress) {
    throw new Error('IModelLoader.loadWithProgress() must be implemented');
  }

  /**
   * Check if format is supported
   * @param {string} format - File format
   * @returns {boolean}
   * @abstract
   */
  supportsFormat(format) {
    throw new Error('IModelLoader.supportsFormat() must be implemented');
  }
}

/**
 * Format Handler Interface
 * Contract for handling specific file formats
 *
 * @interface IFormatHandler
 */
export class IFormatHandler {
  /**
   * Load and parse a file in this format
   * @param {string|File} source - File source
   * @returns {Promise<Object3D>} Parsed 3D object
   * @abstract
   */
  async load(source) {
    throw new Error('IFormatHandler.load() must be implemented');
  }

  /**
   * Validate if file is in correct format
   * @param {string|File} source - File source
   * @returns {Promise<boolean>}
   * @abstract
   */
  async validate(source) {
    throw new Error('IFormatHandler.validate() must be implemented');
  }

  /**
   * Get supported file extensions
   * @returns {string[]}
   * @abstract
   */
  getSupportedExtensions() {
    throw new Error('IFormatHandler.getSupportedExtensions() must be implemented');
  }

  /**
   * Get format name
   * @returns {string}
   * @abstract
   */
  getFormatName() {
    throw new Error('IFormatHandler.getFormatName() must be implemented');
  }
}

/**
 * Section Manager Interface
 * Contract for managing model sections
 *
 * @interface ISectionManager
 */
export class ISectionManager {
  /**
   * Discover sections from a loaded model
   * @param {Object3D} object3D - Three.js object
   * @returns {Section[]}
   * @abstract
   */
  discoverSections(object3D) {
    throw new Error('ISectionManager.discoverSections() must be implemented');
  }

  /**
   * Select a section
   * @param {string} sectionId - Section ID
   * @abstract
   */
  selectSection(sectionId) {
    throw new Error('ISectionManager.selectSection() must be implemented');
  }

  /**
   * Deselect a section
   * @param {string} sectionId - Section ID
   * @abstract
   */
  deselectSection(sectionId) {
    throw new Error('ISectionManager.deselectSection() must be implemented');
  }

  /**
   * Isolate a section (hide others)
   * @param {string} sectionId - Section ID
   * @abstract
   */
  isolateSection(sectionId) {
    throw new Error('ISectionManager.isolateSection() must be implemented');
  }

  /**
   * Highlight a section
   * @param {string} sectionId - Section ID
   * @param {boolean} highlighted - Highlight state
   * @abstract
   */
  highlightSection(sectionId, highlighted) {
    throw new Error('ISectionManager.highlightSection() must be implemented');
  }

  /**
   * Toggle section visibility
   * @param {string} sectionId - Section ID
   * @abstract
   */
  toggleVisibility(sectionId) {
    throw new Error('ISectionManager.toggleVisibility() must be implemented');
  }

  /**
   * Get section hierarchy tree
   * @returns {Object} Section tree
   * @abstract
   */
  getSectionTree() {
    throw new Error('ISectionManager.getSectionTree() must be implemented');
  }
}

/**
 * Navigation Service Interface
 * Contract for camera and navigation operations
 *
 * @interface INavigationService
 */
export class INavigationService {
  /**
   * Focus on a specific section
   * @param {string} sectionId - Section ID
   * @abstract
   */
  focusOnSection(sectionId) {
    throw new Error('INavigationService.focusOnSection() must be implemented');
  }

  /**
   * Focus on entire model
   * @abstract
   */
  focusOnModel() {
    throw new Error('INavigationService.focusOnModel() must be implemented');
  }

  /**
   * Exit focus mode
   * @abstract
   */
  exitFocusMode() {
    throw new Error('INavigationService.exitFocusMode() must be implemented');
  }

  /**
   * Frame object in view
   * @param {Object3D} object - Object to frame
   * @abstract
   */
  frameInView(object) {
    throw new Error('INavigationService.frameInView() must be implemented');
  }

  /**
   * Reset view to default
   * @abstract
   */
  resetView() {
    throw new Error('INavigationService.resetView() must be implemented');
  }

  /**
   * Set camera preset
   * @param {string} preset - Preset name (front, top, right, etc.)
   * @abstract
   */
  setCameraPreset(preset) {
    throw new Error('INavigationService.setCameraPreset() must be implemented');
  }
}

/**
 * Export Service Interface
 * Contract for exporting models
 *
 * @interface IExportService
 */
export class IExportService {
  /**
   * Export model in specified format
   * @param {Model} model - Model to export
   * @param {string} format - Target format
   * @returns {Promise<Blob>}
   * @abstract
   */
  async export(model, format) {
    throw new Error('IExportService.export() must be implemented');
  }

  /**
   * Get supported export formats
   * @returns {string[]}
   * @abstract
   */
  getSupportedFormats() {
    throw new Error('IExportService.getSupportedFormats() must be implemented');
  }
}

/**
 * State Manager Interface
 * Contract for managing application state
 *
 * @interface IStateManager
 */
export class IStateManager {
  /**
   * Get current state
   * @returns {ViewerState}
   * @abstract
   */
  getState() {
    throw new Error('IStateManager.getState() must be implemented');
  }

  /**
   * Set state (immutable update)
   * @param {Object} updates - State updates
   * @abstract
   */
  setState(updates) {
    throw new Error('IStateManager.setState() must be implemented');
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Change callback
   * @returns {Function} Unsubscribe function
   * @abstract
   */
  subscribe(callback) {
    throw new Error('IStateManager.subscribe() must be implemented');
  }

  /**
   * Get state history
   * @returns {ViewerState[]}
   * @abstract
   */
  getHistory() {
    throw new Error('IStateManager.getHistory() must be implemented');
  }
}

/**
 * Event Bus Interface
 * Contract for event pub/sub system
 *
 * @interface IEventBus
 */
export class IEventBus {
  /**
   * Emit an event
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   * @abstract
   */
  emit(eventName, data) {
    throw new Error('IEventBus.emit() must be implemented');
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Unsubscribe function
   * @abstract
   */
  subscribe(eventName, handler) {
    throw new Error('IEventBus.subscribe() must be implemented');
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Event name
   * @param {Function} handler - Event handler
   * @abstract
   */
  unsubscribe(eventName, handler) {
    throw new Error('IEventBus.unsubscribe() must be implemented');
  }

  /**
   * Clear all subscribers
   * @abstract
   */
  clear() {
    throw new Error('IEventBus.clear() must be implemented');
  }
}
