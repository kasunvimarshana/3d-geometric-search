/**
 * Core Domain Models
 *
 * These models represent the business domain entities following Domain-Driven Design principles.
 * They are framework-agnostic and contain the essential business logic.
 */

/**
 * Represents a 3D model in the application domain
 */
export class Model {
  constructor({ id, name, format, data, metadata = {}, sections = [] }) {
    this.id = id;
    this.name = name;
    this.format = format;
    this.data = data;
    this.metadata = metadata;
    this.sections = sections;
    this.createdAt = new Date();
  }

  /**
   * Validates if the model data is complete and well-formed
   */
  isValid() {
    return !!(this.id && this.name && this.format && this.data);
  }

  /**
   * Finds a section by its unique identifier
   */
  findSectionById(sectionId) {
    const findRecursive = (sections) => {
      for (const section of sections) {
        if (section.id === sectionId) return section;
        if (section.children.length > 0) {
          const found = findRecursive(section.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findRecursive(this.sections);
  }

  /**
   * Gets all sections in a flat list
   */
  getAllSections() {
    const result = [];
    const traverse = (sections) => {
      sections.forEach((section) => {
        result.push(section);
        if (section.children.length > 0) {
          traverse(section.children);
        }
      });
    };
    traverse(this.sections);
    return result;
  }
}

/**
 * Represents a section (part/component) of a 3D model
 */
export class Section {
  constructor({
    id,
    name,
    type = "part",
    meshId,
    properties = {},
    visible = true,
    highlighted = false,
    isolated = false,
    children = [],
    parent = null,
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.meshId = meshId;
    this.properties = properties;
    this.visible = visible;
    this.highlighted = highlighted;
    this.isolated = isolated;
    this.children = children;
    this.parent = parent;
  }

  /**
   * Checks if this section is a leaf node (has no children)
   */
  isLeaf() {
    return this.children.length === 0;
  }

  /**
   * Checks if this section is a root node (has no parent)
   */
  isRoot() {
    return this.parent === null;
  }

  /**
   * Gets the full hierarchical path of this section
   */
  getPath() {
    const path = [this.name];
    let current = this.parent;
    while (current) {
      path.unshift(current.name);
      current = current.parent;
    }
    return path.join(" / ");
  }

  /**
   * Gets all child sections recursively
   */
  getAllChildren() {
    const result = [];
    const traverse = (section) => {
      section.children.forEach((child) => {
        result.push(child);
        traverse(child);
      });
    };
    traverse(this);
    return result;
  }
}

/**
 * Represents the camera state in 3D space
 */
export class CameraState {
  constructor({
    position = { x: 0, y: 0, z: 5 },
    target = { x: 0, y: 0, z: 0 },
    zoom = 1,
    fov = 45,
  } = {}) {
    this.position = position;
    this.target = target;
    this.zoom = zoom;
    this.fov = fov;
  }

  clone() {
    return new CameraState({
      position: { ...this.position },
      target: { ...this.target },
      zoom: this.zoom,
      fov: this.fov,
    });
  }
}

/**
 * Represents the viewport state
 */
export class ViewportState {
  constructor({
    width = 800,
    height = 600,
    fullscreen = false,
    camera = new CameraState(),
  } = {}) {
    this.width = width;
    this.height = height;
    this.fullscreen = fullscreen;
    this.camera = camera;
  }
}

/**
 * Represents selection state
 */
export class SelectionState {
  constructor({
    selectedSections = [],
    highlightedSections = [],
    isolatedSections = [],
  } = {}) {
    this.selectedSections = selectedSections;
    this.highlightedSections = highlightedSections;
    this.isolatedSections = isolatedSections;
  }

  hasSelection() {
    return this.selectedSections.length > 0;
  }

  isSelected(sectionId) {
    return this.selectedSections.includes(sectionId);
  }

  isHighlighted(sectionId) {
    return this.highlightedSections.includes(sectionId);
  }

  isIsolated(sectionId) {
    return this.isolatedSections.includes(sectionId);
  }
}

/**
 * Supported file formats
 */
export const SupportedFormats = {
  GLTF: "gltf",
  GLB: "glb",
  OBJ: "obj",
  STL: "stl",
  STEP: "step",
  STP: "stp",
};

/**
 * Format metadata and capabilities
 */
export const FormatCapabilities = {
  [SupportedFormats.GLTF]: {
    extensions: [".gltf"],
    mimeTypes: ["model/gltf+json"],
    supportsHierarchy: true,
    supportsMaterials: true,
    supportsAnimations: true,
  },
  [SupportedFormats.GLB]: {
    extensions: [".glb"],
    mimeTypes: ["model/gltf-binary"],
    supportsHierarchy: true,
    supportsMaterials: true,
    supportsAnimations: true,
  },
  [SupportedFormats.OBJ]: {
    extensions: [".obj"],
    mimeTypes: ["model/obj"],
    supportsHierarchy: false,
    supportsMaterials: true,
    supportsAnimations: false,
  },
  [SupportedFormats.STL]: {
    extensions: [".stl"],
    mimeTypes: ["model/stl"],
    supportsHierarchy: false,
    supportsMaterials: false,
    supportsAnimations: false,
  },
  [SupportedFormats.STEP]: {
    extensions: [".step", ".stp"],
    mimeTypes: ["application/step"],
    supportsHierarchy: true,
    supportsMaterials: false,
    supportsAnimations: false,
  },
};
