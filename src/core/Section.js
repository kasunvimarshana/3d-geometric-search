/**
 * Section entity representing a part or component of a 3D model
 * Supports hierarchical nesting and parent-child relationships
 */
export class Section {
  constructor(id, name, type = 'component') {
    this.id = id;
    this.name = name;
    this.type = type; // 'component', 'assembly', 'part'
    this.children = [];
    this.parent = null;
    this.parentModel = null;
    this.properties = {};
    this.meshIds = [];
    this.visible = true;
    this.selected = false;
    this.highlighted = false;
    this.isolated = false;
    this.position = null;
    this.rotation = null;
    this.scale = null;
  }

  addChild(section) {
    if (!section || !(section instanceof Section)) {
      throw new Error('Invalid child section');
    }
    this.children.push(section);
    section.parent = this;
  }

  removeChild(sectionId) {
    const index = this.children.findIndex((c) => c.id === sectionId);
    if (index !== -1) {
      this.children[index].parent = null;
      this.children.splice(index, 1);
    }
  }

  setParentModel(model) {
    this.parentModel = model;
  }

  setProperty(key, value) {
    this.properties[key] = value;
  }

  getProperty(key) {
    return this.properties[key];
  }

  addMeshId(meshId) {
    if (!this.meshIds.includes(meshId)) {
      this.meshIds.push(meshId);
    }
  }

  setVisible(visible) {
    this.visible = visible;
    // Propagate to children
    this.children.forEach((child) => child.setVisible(visible));
  }

  setSelected(selected) {
    this.selected = selected;
  }

  setHighlighted(highlighted) {
    this.highlighted = highlighted;
  }

  setIsolated(isolated) {
    this.isolated = isolated;
  }

  setTransform(position, rotation, scale) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  getAncestors() {
    const ancestors = [];
    let current = this.parent;
    while (current) {
      ancestors.unshift(current);
      current = current.parent;
    }
    return ancestors;
  }

  getDescendants() {
    const descendants = [];
    const traverse = (section) => {
      section.children.forEach((child) => {
        descendants.push(child);
        traverse(child);
      });
    };
    traverse(this);
    return descendants;
  }

  clone() {
    const cloned = new Section(this.id, this.name, this.type);
    cloned.properties = { ...this.properties };
    cloned.meshIds = [...this.meshIds];
    cloned.visible = this.visible;
    cloned.selected = this.selected;
    cloned.highlighted = this.highlighted;
    cloned.isolated = this.isolated;
    cloned.position = this.position;
    cloned.rotation = this.rotation;
    cloned.scale = this.scale;
    cloned.children = this.children.map((c) => c.clone());
    return cloned;
  }
}
