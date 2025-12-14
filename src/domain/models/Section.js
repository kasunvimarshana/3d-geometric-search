/**
 * Section Entity - Represents a logical section/part of a 3D model
 * Pure domain logic with hierarchy support
 *
 * @class Section
 * @description Immutable domain entity representing a model section with hierarchy
 */

export class Section {
  /**
   * Create a new Section instance
   *
   * @param {Object} params - Section parameters
   * @param {string} params.id - Unique identifier
   * @param {string} params.name - Display name
   * @param {string|null} [params.parentId=null] - Parent section ID
   * @param {Section[]} [params.children=[]] - Child sections
   * @param {string[]} [params.meshIds=[]] - Associated mesh IDs
   * @param {boolean} [params.isVisible=true] - Visibility state
   * @param {boolean} [params.isHighlighted=false] - Highlight state
   * @param {boolean} [params.isIsolated=false] - Isolation state
   * @param {boolean} [params.isSelected=false] - Selection state
   * @param {Object} [params.metadata={}] - Additional metadata
   * @param {number} [params.level=0] - Hierarchy level (0 = root)
   */
  constructor({
    id,
    name,
    parentId = null,
    children = [],
    meshIds = [],
    isVisible = true,
    isHighlighted = false,
    isIsolated = false,
    isSelected = false,
    metadata = {},
    level = 0,
  }) {
    // Validate required fields
    if (!id) throw new Error('Section id is required');
    if (!name) throw new Error('Section name is required');

    // Make properties immutable
    Object.defineProperties(this, {
      id: { value: id, enumerable: true },
      name: { value: name, enumerable: true },
      parentId: { value: parentId, enumerable: true },
      children: { value: Object.freeze([...children]), enumerable: true },
      meshIds: { value: Object.freeze([...meshIds]), enumerable: true },
      isVisible: { value: Boolean(isVisible), enumerable: true },
      isHighlighted: { value: Boolean(isHighlighted), enumerable: true },
      isIsolated: { value: Boolean(isIsolated), enumerable: true },
      isSelected: { value: Boolean(isSelected), enumerable: true },
      metadata: { value: Object.freeze({ ...metadata }), enumerable: true },
      level: { value: level, enumerable: true },
    });

    // Freeze the instance
    Object.freeze(this);
  }

  /**
   * Check if section is a root section (no parent)
   * @returns {boolean}
   */
  isRoot() {
    return this.parentId === null;
  }

  /**
   * Check if section has children
   * @returns {boolean}
   */
  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * Check if section is a leaf (no children)
   * @returns {boolean}
   */
  isLeaf() {
    return this.children.length === 0;
  }

  /**
   * Get total number of children (recursive)
   * @returns {number}
   */
  getTotalChildCount() {
    let count = this.children.length;
    for (const child of this.children) {
      count += child.getTotalChildCount();
    }
    return count;
  }

  /**
   * Find child section by ID (recursive)
   * @param {string} childId
   * @returns {Section|null}
   */
  findChild(childId) {
    // Check direct children
    const directChild = this.children.find(c => c.id === childId);
    if (directChild) return directChild;

    // Check nested children
    for (const child of this.children) {
      const found = child.findChild(childId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Get all descendant sections (flattened)
   * @returns {Section[]}
   */
  getAllDescendants() {
    const descendants = [];

    const collectDescendants = section => {
      for (const child of section.children) {
        descendants.push(child);
        collectDescendants(child);
      }
    };

    collectDescendants(this);
    return descendants;
  }

  /**
   * Get path from root to this section
   * @param {Map<string, Section>} allSections - Map of all sections
   * @returns {Section[]}
   */
  getPath(allSections) {
    const path = [this];
    let current = this;

    while (current.parentId) {
      const parent = allSections.get(current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }

    return path;
  }

  /**
   * Get total number of meshes (including children)
   * @returns {number}
   */
  getTotalMeshCount() {
    let count = this.meshIds.length;
    for (const child of this.children) {
      count += child.getTotalMeshCount();
    }
    return count;
  }

  /**
   * Create a new Section with updated properties (immutable update)
   *
   * @param {Object} updates - Properties to update
   * @returns {Section} New Section instance
   */
  update(updates) {
    return new Section({
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      children: this.children,
      meshIds: this.meshIds,
      isVisible: this.isVisible,
      isHighlighted: this.isHighlighted,
      isIsolated: this.isIsolated,
      isSelected: this.isSelected,
      metadata: this.metadata,
      level: this.level,
      ...updates,
    });
  }

  /**
   * Toggle visibility
   * @returns {Section}
   */
  toggleVisibility() {
    return this.update({ isVisible: !this.isVisible });
  }

  /**
   * Set highlight state
   * @param {boolean} highlighted
   * @returns {Section}
   */
  setHighlight(highlighted) {
    return this.update({ isHighlighted: Boolean(highlighted) });
  }

  /**
   * Set isolation state
   * @param {boolean} isolated
   * @returns {Section}
   */
  setIsolation(isolated) {
    return this.update({ isIsolated: Boolean(isolated) });
  }

  /**
   * Set selection state
   * @param {boolean} selected
   * @returns {Section}
   */
  setSelection(selected) {
    return this.update({ isSelected: Boolean(selected) });
  }

  /**
   * Validate section data
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

    if (this.level < 0) {
      errors.push('Level cannot be negative');
    }

    if (!Array.isArray(this.meshIds)) {
      errors.push('meshIds must be an array');
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
      parentId: this.parentId,
      childCount: this.children.length,
      meshCount: this.meshIds.length,
      totalMeshCount: this.getTotalMeshCount(),
      isVisible: this.isVisible,
      isHighlighted: this.isHighlighted,
      isIsolated: this.isIsolated,
      isSelected: this.isSelected,
      level: this.level,
      metadata: this.metadata,
    };
  }

  /**
   * Create Section from plain object
   *
   * @param {Object} data - Plain object data
   * @returns {Section}
   */
  static fromJSON(data) {
    return new Section({
      id: data.id,
      name: data.name,
      parentId: data.parentId || null,
      children: (data.children || []).map(c => Section.fromJSON(c)),
      meshIds: data.meshIds || [],
      isVisible: data.isVisible !== false,
      isHighlighted: data.isHighlighted || false,
      isIsolated: data.isIsolated || false,
      isSelected: data.isSelected || false,
      metadata: data.metadata || {},
      level: data.level || 0,
    });
  }

  /**
   * Create a clone of the section
   * @returns {Section}
   */
  clone() {
    return new Section({
      id: this.id,
      name: this.name,
      parentId: this.parentId,
      children: this.children.map(c => c.clone()),
      meshIds: [...this.meshIds],
      isVisible: this.isVisible,
      isHighlighted: this.isHighlighted,
      isIsolated: this.isIsolated,
      isSelected: this.isSelected,
      metadata: { ...this.metadata },
      level: this.level,
    });
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `Section(id=${this.id}, name=${this.name}, level=${this.level}, children=${this.children.length}, meshes=${this.meshIds.length})`;
  }
}
