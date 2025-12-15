/**
 * Model Service
 *
 * Business logic for model operations including loading, validation,
 * and hierarchy management.
 */
export class ModelService {
  /**
   * Validate model data
   */
  validateModel(model) {
    const errors = [];

    if (!model.id) {
      errors.push('Model ID is required');
    }

    if (!model.name) {
      errors.push('Model name is required');
    }

    if (!model.format) {
      errors.push('Model format is required');
    }

    if (!Array.isArray(model.sections)) {
      errors.push('Model sections must be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate model bounds
   */
  calculateBounds(model) {
    const bounds = {
      min: { x: Infinity, y: Infinity, z: Infinity },
      max: { x: -Infinity, y: -Infinity, z: -Infinity },
    };

    const processSection = (section) => {
      if (section.geometry && section.geometry.bounds) {
        const { min, max } = section.geometry.bounds;
        bounds.min.x = Math.min(bounds.min.x, min.x);
        bounds.min.y = Math.min(bounds.min.y, min.y);
        bounds.min.z = Math.min(bounds.min.z, min.z);
        bounds.max.x = Math.max(bounds.max.x, max.x);
        bounds.max.y = Math.max(bounds.max.y, max.y);
        bounds.max.z = Math.max(bounds.max.z, max.z);
      }

      section.children?.forEach(processSection);
    };

    model.sections.forEach(processSection);

    // Calculate center and size
    bounds.center = {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2,
    };

    bounds.size = {
      x: bounds.max.x - bounds.min.x,
      y: bounds.max.y - bounds.min.y,
      z: bounds.max.z - bounds.min.z,
    };

    return bounds;
  }

  /**
   * Build section hierarchy
   */
  buildHierarchy(sections) {
    const sectionMap = new Map();
    const rootSections = [];

    // Create map of all sections
    sections.forEach((section) => {
      sectionMap.set(section.id, { ...section, children: [] });
    });

    // Build parent-child relationships
    sections.forEach((section) => {
      const sectionNode = sectionMap.get(section.id);
      if (section.parentId && sectionMap.has(section.parentId)) {
        const parent = sectionMap.get(section.parentId);
        parent.children.push(sectionNode);
      } else {
        rootSections.push(sectionNode);
      }
    });

    return rootSections;
  }

  /**
   * Flatten hierarchy
   */
  flattenHierarchy(sections) {
    const flat = [];
    const traverse = (section) => {
      flat.push(section);
      section.children?.forEach(traverse);
    };
    sections.forEach(traverse);
    return flat;
  }

  /**
   * Get section path (from root to section)
   */
  getSectionPath(model, sectionId) {
    const path = [];
    const search = (sections, targetId) => {
      for (const section of sections) {
        path.push(section);
        if (section.id === targetId) {
          return true;
        }
        if (section.children && search(section.children, targetId)) {
          return true;
        }
        path.pop();
      }
      return false;
    };

    search(model.sections, sectionId);
    return path;
  }

  /**
   * Get section descendants
   */
  getSectionDescendants(section) {
    const descendants = [];
    const traverse = (s) => {
      descendants.push(s);
      s.children?.forEach(traverse);
    };
    section.children?.forEach(traverse);
    return descendants;
  }
}
