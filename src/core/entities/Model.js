/**
 * Model Entity
 *
 * Core domain entity representing a 3D model with its metadata,
 * hierarchy, and geometric properties.
 */
export class Model {
  constructor({ id, name, format, sections = [], metadata = {}, bounds = null }) {
    this.id = id;
    this.name = name;
    this.format = format;
    this.sections = sections;
    this.metadata = metadata;
    this.bounds = bounds;
    this.createdAt = new Date();
  }

  /**
   * Get model statistics
   */
  getStatistics() {
    let totalVertices = 0;
    let totalFaces = 0;
    let objectCount = 0;

    const traverse = (section) => {
      if (section.geometry) {
        totalVertices += section.geometry.vertexCount || 0;
        totalFaces += section.geometry.faceCount || 0;
        objectCount++;
      }
      section.children?.forEach(traverse);
    };

    this.sections.forEach(traverse);

    return {
      vertices: totalVertices,
      faces: totalFaces,
      objects: objectCount,
    };
  }

  /**
   * Find section by ID
   */
  findSection(sectionId) {
    const search = (sections) => {
      for (const section of sections) {
        if (section.id === sectionId) return section;
        if (section.children) {
          const found = search(section.children);
          if (found) return found;
        }
      }
      return null;
    };
    return search(this.sections);
  }

  /**
   * Get all sections flat
   */
  getAllSections() {
    const sections = [];
    const traverse = (section) => {
      sections.push(section);
      section.children?.forEach(traverse);
    };
    this.sections.forEach(traverse);
    return sections;
  }

  /**
   * Clone model
   */
  clone() {
    return new Model({
      id: this.id,
      name: this.name,
      format: this.format,
      sections: JSON.parse(JSON.stringify(this.sections)),
      metadata: { ...this.metadata },
      bounds: this.bounds ? { ...this.bounds } : null,
    });
  }
}
