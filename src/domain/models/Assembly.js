/**
 * Assembly Entity - Represents hierarchical assembly structure
 * Pure domain logic for managing model assemblies
 *
 * @class Assembly
 * @description Represents the hierarchical structure of a 3D assembly
 */

export class Assembly {
  /**
   * Create a new Assembly instance
   *
   * @param {Object} params - Assembly parameters
   * @param {string} params.id - Unique identifier
   * @param {string} params.name - Assembly name
   * @param {Assembly[]} [params.subAssemblies=[]] - Child assemblies
   * @param {string[]} [params.partIds=[]] - Part/component IDs
   * @param {Object} [params.transform=null] - Transform matrix
   * @param {Object} [params.metadata={}] - Additional metadata
   * @param {number} [params.level=0] - Hierarchy level
   */
  constructor({
    id,
    name,
    subAssemblies = [],
    partIds = [],
    transform = null,
    metadata = {},
    level = 0,
  }) {
    if (!id) throw new Error('Assembly id is required');
    if (!name) throw new Error('Assembly name is required');

    Object.defineProperties(this, {
      id: { value: id, enumerable: true },
      name: { value: name, enumerable: true },
      subAssemblies: { value: Object.freeze([...subAssemblies]), enumerable: true },
      partIds: { value: Object.freeze([...partIds]), enumerable: true },
      transform: { value: transform, enumerable: true },
      metadata: { value: Object.freeze({ ...metadata }), enumerable: true },
      level: { value: level, enumerable: true },
    });

    Object.freeze(this);
  }

  /**
   * Check if assembly has sub-assemblies
   * @returns {boolean}
   */
  hasSubAssemblies() {
    return this.subAssemblies.length > 0;
  }

  /**
   * Check if assembly has parts
   * @returns {boolean}
   */
  hasParts() {
    return this.partIds.length > 0;
  }

  /**
   * Get total number of parts (recursive)
   * @returns {number}
   */
  getTotalPartCount() {
    let count = this.partIds.length;
    for (const sub of this.subAssemblies) {
      count += sub.getTotalPartCount();
    }
    return count;
  }

  /**
   * Get total number of assemblies (recursive)
   * @returns {number}
   */
  getTotalAssemblyCount() {
    let count = 1; // Include self
    for (const sub of this.subAssemblies) {
      count += sub.getTotalAssemblyCount();
    }
    return count;
  }

  /**
   * Find sub-assembly by ID (recursive)
   * @param {string} assemblyId
   * @returns {Assembly|null}
   */
  findAssembly(assemblyId) {
    if (this.id === assemblyId) return this;

    for (const sub of this.subAssemblies) {
      const found = sub.findAssembly(assemblyId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Get all assemblies (flattened)
   * @returns {Assembly[]}
   */
  getAllAssemblies() {
    const assemblies = [this];
    for (const sub of this.subAssemblies) {
      assemblies.push(...sub.getAllAssemblies());
    }
    return assemblies;
  }

  /**
   * Create a new Assembly with updated properties
   * @param {Object} updates - Properties to update
   * @returns {Assembly}
   */
  update(updates) {
    return new Assembly({
      id: this.id,
      name: this.name,
      subAssemblies: this.subAssemblies,
      partIds: this.partIds,
      transform: this.transform,
      metadata: this.metadata,
      level: this.level,
      ...updates,
    });
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      subAssemblyCount: this.subAssemblies.length,
      partCount: this.partIds.length,
      totalParts: this.getTotalPartCount(),
      totalAssemblies: this.getTotalAssemblyCount(),
      level: this.level,
    };
  }

  /**
   * Create Assembly from plain object
   * @param {Object} data - Plain object data
   * @returns {Assembly}
   */
  static fromJSON(data) {
    return new Assembly({
      id: data.id,
      name: data.name,
      subAssemblies: (data.subAssemblies || []).map(a => Assembly.fromJSON(a)),
      partIds: data.partIds || [],
      transform: data.transform || null,
      metadata: data.metadata || {},
      level: data.level || 0,
    });
  }

  /**
   * Clone the assembly
   * @returns {Assembly}
   */
  clone() {
    return new Assembly({
      id: this.id,
      name: this.name,
      subAssemblies: this.subAssemblies.map(a => a.clone()),
      partIds: [...this.partIds],
      transform: this.transform ? { ...this.transform } : null,
      metadata: { ...this.metadata },
      level: this.level,
    });
  }

  /**
   * String representation
   * @returns {string}
   */
  toString() {
    return `Assembly(id=${this.id}, name=${this.name}, parts=${this.getTotalPartCount()}, assemblies=${this.getTotalAssemblyCount()})`;
  }
}
