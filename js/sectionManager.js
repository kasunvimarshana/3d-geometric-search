/**
 * Section Manager - Handles lazy loading and on-demand rendering of UI sections
 * Improves performance by loading sections only when needed
 */

export class SectionManager {
  constructor() {
    this.sections = new Map();
    this.loadedSections = new Set();
    this.visibleSections = new Set();
  }

  /**
   * Register a section for lazy loading
   * @param {string} sectionId - ID of the section element
   * @param {Object} config - Section configuration
   * @param {string} config.trigger - ID of element that triggers section load
   * @param {Function} config.onLoad - Callback when section is first loaded
   * @param {boolean} config.persistent - Whether section stays loaded after hiding
   */
  registerSection(sectionId, config) {
    this.sections.set(sectionId, {
      id: sectionId,
      trigger: config.trigger,
      onLoad: config.onLoad,
      persistent: config.persistent || false,
      element: null,
      loaded: false,
    });

    // Setup trigger if specified
    if (config.trigger) {
      const triggerElement = document.getElementById(config.trigger);
      if (triggerElement) {
        triggerElement.addEventListener("click", () => {
          this.toggleSection(sectionId);
        });
      }
    }
  }

  /**
   * Toggle section visibility
   * @param {string} sectionId - Section to toggle
   */
  toggleSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) {
      console.warn(`[SectionManager] Section not found: ${sectionId}`);
      return;
    }

    const isVisible = this.visibleSections.has(sectionId);

    if (isVisible) {
      this.hideSection(sectionId);
    } else {
      this.showSection(sectionId);
    }
  }

  /**
   * Show a section (load if needed)
   * @param {string} sectionId - Section to show
   */
  async showSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) return;

    // Load section content if not already loaded
    if (!section.loaded) {
      await this.loadSection(sectionId);
    }

    // Get or find the section element
    if (!section.element) {
      section.element = document.getElementById(sectionId);
    }

    if (section.element) {
      section.element.style.display = "block";
      section.element.classList.add("section-visible");
      this.visibleSections.add(sectionId);

      // Dispatch custom event
      section.element.dispatchEvent(
        new CustomEvent("sectionShown", {
          detail: { sectionId },
        })
      );

      console.log(`[SectionManager] Showed section: ${sectionId}`);
    }
  }

  /**
   * Hide a section
   * @param {string} sectionId - Section to hide
   */
  hideSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) return;

    if (!section.element) {
      section.element = document.getElementById(sectionId);
    }

    if (section.element) {
      section.element.style.display = "none";
      section.element.classList.remove("section-visible");
      this.visibleSections.delete(sectionId);

      // Unload section if not persistent
      if (!section.persistent && section.loaded) {
        this.unloadSection(sectionId);
      }

      // Dispatch custom event
      section.element.dispatchEvent(
        new CustomEvent("sectionHidden", {
          detail: { sectionId },
        })
      );

      console.log(`[SectionManager] Hid section: ${sectionId}`);
    }
  }

  /**
   * Load section content on-demand
   * @param {string} sectionId - Section to load
   */
  async loadSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section || section.loaded) return;

    console.log(`[SectionManager] Loading section: ${sectionId}...`);

    try {
      // Call the onLoad callback
      if (section.onLoad) {
        await section.onLoad();
      }

      section.loaded = true;
      this.loadedSections.add(sectionId);

      console.log(`[SectionManager] Section loaded: ${sectionId}`);
    } catch (error) {
      console.error(
        `[SectionManager] Failed to load section ${sectionId}:`,
        error
      );
    }
  }

  /**
   * Unload section content (for non-persistent sections)
   * @param {string} sectionId - Section to unload
   */
  unloadSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) return;

    console.log(`[SectionManager] Unloading section: ${sectionId}`);

    section.loaded = false;
    this.loadedSections.delete(sectionId);

    // Clear section content if needed
    if (section.element) {
      // You can add custom cleanup logic here
    }
  }

  /**
   * Check if a section is loaded
   * @param {string} sectionId - Section ID
   * @returns {boolean}
   */
  isLoaded(sectionId) {
    return this.loadedSections.has(sectionId);
  }

  /**
   * Check if a section is visible
   * @param {string} sectionId - Section ID
   * @returns {boolean}
   */
  isVisible(sectionId) {
    return this.visibleSections.has(sectionId);
  }

  /**
   * Preload a section without showing it
   * @param {string} sectionId - Section to preload
   */
  async preloadSection(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section || section.loaded) return;

    console.log(`[SectionManager] Preloading section: ${sectionId}...`);
    await this.loadSection(sectionId);
  }

  /**
   * Get all registered sections
   * @returns {Array} Array of section IDs
   */
  getAllSections() {
    return Array.from(this.sections.keys());
  }

  /**
   * Get section status
   * @param {string} sectionId - Section ID
   * @returns {Object} Section status
   */
  getSectionStatus(sectionId) {
    const section = this.sections.get(sectionId);
    if (!section) return null;

    return {
      id: sectionId,
      loaded: section.loaded,
      visible: this.visibleSections.has(sectionId),
      persistent: section.persistent,
    };
  }

  /**
   * Get stats about all sections
   * @returns {Object} Section statistics
   */
  getStats() {
    return {
      total: this.sections.size,
      loaded: this.loadedSections.size,
      visible: this.visibleSections.size,
      sections: Array.from(this.sections.keys()).map((id) =>
        this.getSectionStatus(id)
      ),
    };
  }
}
