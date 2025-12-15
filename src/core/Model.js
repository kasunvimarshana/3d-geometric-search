/**
 * Core domain entity representing a 3D model
 * Encapsulates all model-related data and metadata
 */
export class Model {
  constructor(id, name, formatType) {
    this.id = id;
    this.name = name;
    this.formatType = formatType; // 'gltf', 'step', 'obj', 'stl'
    this.sections = [];
    this.metadata = {};
    this.boundingBox = null;
    this.created = new Date();
  }

  addSection(section) {
    if (!section || !(section instanceof Section)) {
      throw new Error('Invalid section');
    }
    this.sections.push(section);
    section.setParentModel(this);
  }

  getSectionById(id) {
    return this.findSectionRecursive(this.sections, id);
  }

  findSectionRecursive(sections, id) {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children.length > 0) {
        const found = this.findSectionRecursive(section.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  getAllSections() {
    const all = [];
    const traverse = (sections) => {
      for (const section of sections) {
        all.push(section);
        if (section.children.length > 0) {
          traverse(section.children);
        }
      }
    };
    traverse(this.sections);
    return all;
  }

  setBoundingBox(min, max) {
    this.boundingBox = { min, max };
  }

  setMetadata(key, value) {
    this.metadata[key] = value;
  }

  clone() {
    const cloned = new Model(this.id, this.name, this.formatType);
    cloned.metadata = { ...this.metadata };
    cloned.boundingBox = this.boundingBox ? { ...this.boundingBox } : null;
    cloned.sections = this.sections.map((s) => s.clone());
    return cloned;
  }
}
