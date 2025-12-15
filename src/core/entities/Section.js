/**
 * Section Entity
 *
 * Represents a single section/part within a model hierarchy.
 * Supports nested children for complex assemblies.
 */
export class Section {
  constructor({
    id,
    name,
    parentId = null,
    children = [],
    geometry = null,
    material = null,
    transform = null,
    properties = {},
    visible = true,
    selectable = true,
  }) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.children = children;
    this.geometry = geometry;
    this.material = material;
    this.transform = transform;
    this.properties = properties;
    this.visible = visible;
    this.selectable = selectable;
  }

  /**
   * Check if section is a leaf (no children)
   */
  isLeaf() {
    return !this.children || this.children.length === 0;
  }

  /**
   * Check if section has geometry
   */
  hasGeometry() {
    return this.geometry !== null;
  }

  /**
   * Get section depth in hierarchy
   */
  getDepth() {
    let depth = 0;
    let current = this;
    while (current.parentId) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  /**
   * Clone section
   */
  clone() {
    return new Section({
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      children: this.children.map((child) => child.clone()),
      geometry: this.geometry ? { ...this.geometry } : null,
      material: this.material ? { ...this.material } : null,
      transform: this.transform ? { ...this.transform } : null,
      properties: { ...this.properties },
      visible: this.visible,
      selectable: this.selectable,
    });
  }
}
