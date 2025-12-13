/**
 * Core domain interfaces for the 3D geometric search application
 * Following Interface Segregation Principle (ISP)
 */

/**
 * Represents a 3D model with metadata
 */
export class Model {
  constructor(id, name, url, type = 'gltf') {
    this.id = id;
    this.name = name;
    this.url = url;
    this.type = type;
    this.sections = [];
  }
}

/**
 * Represents a section within a 3D model
 */
export class Section {
  constructor(id, name, meshNames = [], parent = null) {
    this.id = id;
    this.name = name;
    this.meshNames = meshNames; // Array of mesh names that belong to this section
    this.parent = parent; // Parent section ID for nested sections
    this.children = []; // Child section IDs
    this.isVisible = true;
    this.isHighlighted = false;
    this.isIsolated = false;
  }
}

/**
 * Represents the current state of the viewer
 */
export class ViewerState {
  constructor() {
    this.currentModel = null;
    this.sections = new Map(); // sectionId -> Section
    this.selectedSection = null;
    this.isolatedSection = null;
    this.zoom = 100;
    this.isFullscreen = false;
    this.cameraPosition = { x: 0, y: 0, z: 10 };
    this.cameraTarget = { x: 0, y: 0, z: 0 };
  }

  reset() {
    this.selectedSection = null;
    this.isolatedSection = null;
    this.zoom = 100;
    this.cameraPosition = { x: 0, y: 0, z: 10 };
    this.cameraTarget = { x: 0, y: 0, z: 0 };
  }
}

/**
 * Interface for model loaders
 */
export class IModelLoader {
  async load(model) {
    throw new Error('Method not implemented');
  }

  dispose() {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface for section managers
 */
export class ISectionManager {
  addSection(section) {
    throw new Error('Method not implemented');
  }

  getSection(id) {
    throw new Error('Method not implemented');
  }

  getAllSections() {
    throw new Error('Method not implemented');
  }

  isolateSection(id) {
    throw new Error('Method not implemented');
  }

  highlightSection(id) {
    throw new Error('Method not implemented');
  }

  clearIsolation() {
    throw new Error('Method not implemented');
  }
}

/**
 * Interface for event handlers
 */
export class IEventHandler {
  subscribe(eventType, callback) {
    throw new Error('Method not implemented');
  }

  unsubscribe(eventType, callback) {
    throw new Error('Method not implemented');
  }

  emit(eventType, data) {
    throw new Error('Method not implemented');
  }
}
