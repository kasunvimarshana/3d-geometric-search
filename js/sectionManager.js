/**
 * Section Manager - Handles lazy loading and on-demand rendering of UI sections
 * Improves performance by loading sections only when needed
 *
 * Enhanced with:
 * - Resilient event handling with proper cleanup
 * - Error recovery and logging
 * - Event handler reference tracking
 */

class SectionManager {
  constructor() {
    this.sections = new Map();
    this.loadedSections = new Set();
    this.visibleSections = new Set();
    // Get EventHandlerManager from global scope
    const EventHandlerManager = window.EventHandlerManager;
    this.eventManager = new EventHandlerManager();
    this.cleanupFunctions = new Map();
    this.toggleDebounce = new Map(); // Prevent rapid toggles
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
    if (!sectionId) {
      console.error("[SectionManager] sectionId is required");
      return;
    }

    this.sections.set(sectionId, {
      id: sectionId,
      trigger: config.trigger,
      onLoad: config.onLoad,
      persistent: config.persistent || false,
      element: null,
      loaded: false,
      error: null,
    });

    // Setup trigger if specified
    if (config.trigger) {
      this._setupTrigger(sectionId, config.trigger);
    }
  }

  /**
   * Setup event trigger for a section
   * @private
   */
  _setupTrigger(sectionId, triggerId) {
    const triggerElement = document.getElementById(triggerId);
    if (!triggerElement) {
      console.warn(`[SectionManager] Trigger element not found: ${triggerId}`);
      return;
    }

    // Create a resilient handler with error handling
    const handler = (event) => {
      try {
        event.preventDefault();
        event.stopPropagation();
        this.toggleSection(sectionId);
      } catch (error) {
        console.error(
          `[SectionManager] Error toggling section ${sectionId}:`,
          error
        );
      }
    };

    // Add event listener with tracking
    this.eventManager.add(triggerElement, "click", handler);
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

    // Prevent rapid successive toggles (debounce 300ms)
    const now = Date.now();
    const lastToggle = this.toggleDebounce.get(sectionId) || 0;
    if (now - lastToggle < 300) {
      console.log(`[SectionManager] Ignoring rapid toggle for ${sectionId}`);
      return;
    }
    this.toggleDebounce.set(sectionId, now);

    const isVisible = this.visibleSections.has(sectionId);

    console.log(
      `[SectionManager] Toggling ${sectionId}: ${
        isVisible ? "visible->hide" : "hidden->show"
      }`
    );

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
    if (!section) {
      console.warn(`[SectionManager] Section not found: ${sectionId}`);
      return;
    }

    try {
      // Load section content if not already loaded
      if (!section.loaded && !section.error) {
        await this.loadSection(sectionId);
      }

      // Get or find the section element
      if (!section.element) {
        section.element = document.getElementById(sectionId);
      }

      if (section.element) {
        section.element.style.display = "block";
        requestAnimationFrame(() => {
          section.element.classList.add("section-visible");
        });
        this.visibleSections.add(sectionId);

        // Dispatch custom event with error handling
        this._dispatchSectionEvent(section.element, "sectionShown", {
          sectionId,
          loadTime: section.loadTime,
        });

        console.log(`[SectionManager] Showed section: ${sectionId}`);
      } else {
        console.error(
          `[SectionManager] Section element not found in DOM: ${sectionId}`
        );
      }
    } catch (error) {
      console.error(
        `[SectionManager] Error showing section ${sectionId}:`,
        error
      );
      section.error = error.message;
    }
  }

  /**
   * Hide a section
   * @param {string} sectionId - Section to hide
   */
  hideSection(sectionId) {
    try {
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
        this._dispatchSectionEvent(section.element, "sectionHidden", {
          sectionId,
          timestamp: Date.now(),
        });

        console.log(`[SectionManager] Hid section: ${sectionId}`);
      }
    } catch (error) {
      console.error(
        `[SectionManager] Error hiding section ${sectionId}:`,
        error
      );
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
      const startTime = performance.now();

      // Call the onLoad callback with error handling
      if (section.onLoad) {
        const cleanup = await Promise.resolve(section.onLoad()).catch(
          (error) => {
            console.error(
              `[SectionManager] onLoad callback error for ${sectionId}:`,
              error
            );
            throw error;
          }
        );

        // Store cleanup function if returned
        if (typeof cleanup === "function") {
          this.cleanupFunctions.set(sectionId, cleanup);
        }
      }

      const loadTime = performance.now() - startTime;
      section.loaded = true;
      section.loadTime = loadTime;
      section.error = null;
      this.loadedSections.add(sectionId);

      if (section.element) {
        section.element.classList.remove("loading-section");
      }

      console.log(
        `[SectionManager] Section loaded: ${sectionId} (${loadTime.toFixed(
          2
        )}ms)`
      );
    } catch (error) {
      section.error = error.message;
      if (section.element) {
        section.element.classList.remove("loading-section");
        section.element.classList.add("error-section");
      }
      console.error(
        `[SectionManager] Failed to load section ${sectionId}:`,
        error
      );
      throw error;
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

    // Execute cleanup function if it exists
    const cleanup = this.cleanupFunctions.get(sectionId);
    if (cleanup) {
      try {
        if (typeof cleanup === "function") {
          cleanup();
        } else {
          console.warn(
            `[SectionManager] Cleanup for ${sectionId} is not a function:`,
            typeof cleanup
          );
        }
        this.cleanupFunctions.delete(sectionId);
      } catch (error) {
        console.error(
          `[SectionManager] Error in cleanup for ${sectionId}:`,
          error
        );
      }
    }

    section.loaded = false;
    this.loadedSections.delete(sectionId);

    // Clear section content if needed
    if (section.element) {
      this._dispatchSectionEvent(section.element, "sectionUnloaded", {
        sectionId,
      });
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

  /**
   * Helper method to dispatch section events consistently
   * @private
   * @param {HTMLElement} element - Element to dispatch event on
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event detail object
   */
  _dispatchSectionEvent(element, eventName, detail = {}) {
    if (!element) return;

    try {
      const event = new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    } catch (error) {
      console.error(`[SectionManager] Error dispatching ${eventName}:`, error);
    }
  }

  /**
   * Clean up all event listeners and resources
   * Call this when the SectionManager is being destroyed
   */
  cleanup() {
    console.log("[SectionManager] Cleaning up all event listeners...");

    // Remove all DOM event listeners
    this.eventManager.clear();

    // Execute all cleanup functions
    this.cleanupFunctions.forEach((cleanup, sectionId) => {
      try {
        if (typeof cleanup === "function") {
          cleanup();
          console.log(`[SectionManager] Cleaned up section: ${sectionId}`);
        }
      } catch (error) {
        console.error(
          `[SectionManager] Error cleaning up ${sectionId}:`,
          error
        );
      }
    });

    this.cleanupFunctions.clear();
    this.sections.clear();
    this.loadedSections.clear();
    this.visibleSections.clear();

    console.log("[SectionManager] Cleanup complete");
  }
}

// Export to global scope
if (typeof window !== "undefined") {
  window.SectionManager = SectionManager;
}
