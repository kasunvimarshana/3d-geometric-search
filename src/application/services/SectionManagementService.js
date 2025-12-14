/**
 * Section Management Service
 * Implements ISectionManager interface
 * Manages model sections, hierarchy, and state
 */

export class SectionManagementService {
  constructor(modelRepository, eventBus) {
    this.modelRepository = modelRepository;
    this.eventBus = eventBus;
    this.selectedSections = new Set();
    this.highlightedSections = new Set();
    this.isolatedSections = new Set();
  }

  /**
   * Discover sections from model
   *
   * @param {string} modelId - Model ID
   * @returns {Section[]}
   */
  discoverSections(modelId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    this.eventBus.emit('sections:discovered', {
      modelId,
      sections: model.sections,
      count: model.sections.length,
    });

    return model.sections;
  }

  /**
   * Get section tree (hierarchical structure)
   *
   * @param {string} modelId - Model ID
   * @returns {Object} Tree structure
   */
  getSectionTree(modelId) {
    const sections = this.discoverSections(modelId);

    // Build tree from flat list
    const sectionMap = new Map(sections.map(s => [s.id, s]));
    const roots = [];

    for (const section of sections) {
      if (section.isRoot()) {
        roots.push(this.buildTreeNode(section, sectionMap));
      }
    }

    return {
      roots,
      totalCount: sections.length,
    };
  }

  /**
   * Build tree node recursively
   *
   * @param {Section} section - Section
   * @param {Map} sectionMap - Map of all sections
   * @returns {Object} Tree node
   */
  buildTreeNode(section, sectionMap) {
    return {
      id: section.id,
      name: section.name,
      level: section.level,
      isVisible: section.isVisible,
      isHighlighted: section.isHighlighted,
      isIsolated: section.isIsolated,
      isSelected: section.isSelected,
      meshCount: section.meshIds.length,
      children: section.children
        .map(childId => {
          const child = sectionMap.get(childId);
          return child ? this.buildTreeNode(child, sectionMap) : null;
        })
        .filter(Boolean),
    };
  }

  /**
   * Select section
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   * @param {boolean} [additive=false] - Add to selection vs replace
   */
  selectSection(modelId, sectionId, additive = false) {
    const model = this.modelRepository.findById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const section = model.findSection(sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    // Clear previous selection if not additive
    if (!additive) {
      this.clearSelection(modelId);
    }

    // Update section state
    const updatedSection = section.setSelection(true);
    this.updateSection(modelId, updatedSection);
    this.selectedSections.add(sectionId);

    this.eventBus.emit('section:selected', {
      modelId,
      sectionId,
      section: updatedSection,
      additive,
    });
  }

  /**
   * Deselect section
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   */
  deselectSection(modelId, sectionId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    const updatedSection = section.setSelection(false);
    this.updateSection(modelId, updatedSection);
    this.selectedSections.delete(sectionId);

    this.eventBus.emit('section:deselected', {
      modelId,
      sectionId,
      section: updatedSection,
    });
  }

  /**
   * Clear all selections
   *
   * @param {string} modelId - Model ID
   */
  clearSelection(modelId) {
    const sectionsToDeselect = Array.from(this.selectedSections);
    sectionsToDeselect.forEach(sectionId => {
      this.deselectSection(modelId, sectionId);
    });
  }

  /**
   * Highlight section
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   */
  highlightSection(modelId, sectionId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    const updatedSection = section.setHighlight(true);
    this.updateSection(modelId, updatedSection);
    this.highlightedSections.add(sectionId);

    this.eventBus.emit('section:highlighted', {
      modelId,
      sectionId,
      section: updatedSection,
    });
  }

  /**
   * Unhighlight section
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   */
  unhighlightSection(modelId, sectionId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    const updatedSection = section.setHighlight(false);
    this.updateSection(modelId, updatedSection);
    this.highlightedSections.delete(sectionId);

    this.eventBus.emit('section:unhighlighted', {
      modelId,
      sectionId,
      section: updatedSection,
    });
  }

  /**
   * Isolate section (hide all others)
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   */
  isolateSection(modelId, sectionId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    // Mark section as isolated
    const updatedSection = section.setIsolation(true);
    this.updateSection(modelId, updatedSection);
    this.isolatedSections.add(sectionId);

    this.eventBus.emit('section:isolated', {
      modelId,
      sectionId,
      section: updatedSection,
    });
  }

  /**
   * Exit isolation mode
   *
   * @param {string} modelId - Model ID
   */
  exitIsolation(modelId) {
    const sectionsToUnisolate = Array.from(this.isolatedSections);

    sectionsToUnisolate.forEach(sectionId => {
      const model = this.modelRepository.findById(modelId);
      if (!model) return;

      const section = model.findSection(sectionId);
      if (!section) return;

      const updatedSection = section.setIsolation(false);
      this.updateSection(modelId, updatedSection);
    });

    this.isolatedSections.clear();

    this.eventBus.emit('isolation:exited', {
      modelId,
    });
  }

  /**
   * Toggle section visibility
   *
   * @param {string} modelId - Model ID
   * @param {string} sectionId - Section ID
   */
  toggleVisibility(modelId, sectionId) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    const updatedSection = section.toggleVisibility();
    this.updateSection(modelId, updatedSection);

    this.eventBus.emit('section:visibility:changed', {
      modelId,
      sectionId,
      section: updatedSection,
      isVisible: updatedSection.isVisible,
    });
  }

  /**
   * Update section in model
   *
   * @param {string} modelId - Model ID
   * @param {Section} updatedSection - Updated section
   */
  updateSection(modelId, updatedSection) {
    const model = this.modelRepository.findById(modelId);
    if (!model) return;

    // Replace section in model
    const updatedSections = model.sections.map(s =>
      s.id === updatedSection.id ? updatedSection : s
    );

    const updatedModel = model.update({ sections: updatedSections });
    const threeObject = this.modelRepository.getThreeObject(modelId);

    this.modelRepository.save(updatedModel, threeObject);
  }

  /**
   * Get selected sections
   *
   * @returns {Set<string>}
   */
  getSelectedSections() {
    return new Set(this.selectedSections);
  }

  /**
   * Get highlighted sections
   *
   * @returns {Set<string>}
   */
  getHighlightedSections() {
    return new Set(this.highlightedSections);
  }

  /**
   * Get isolated sections
   *
   * @returns {Set<string>}
   */
  getIsolatedSections() {
    return new Set(this.isolatedSections);
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.selectedSections.clear();
    this.highlightedSections.clear();
    this.isolatedSections.clear();
  }
}
