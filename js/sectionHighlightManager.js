/**
 * Section Highlighting Manager
 * Handles bidirectional synchronization between model sections and UI list
 * Clean, efficient, and maintainable implementation
 */

class SectionHighlightManager {
  constructor(viewer, eventBus) {
    this.viewer = viewer;
    this.eventBus = eventBus;
    this.currentHighlight = null;
    this.highlightedElements = new Set();

    this.init();
  }

  init() {
    // Listen for model interactions
    this.eventBus.on("model:section:click", (data) => {
      this.highlightSection(data.sectionId, "model");
    });

    this.eventBus.on("model:section:hover", (data) => {
      this.hoverSection(data.sectionId);
    });

    // Listen for list interactions
    this.eventBus.on("list:section:click", (data) => {
      this.highlightSection(data.sectionId, "list");
    });

    this.eventBus.on("list:section:hover", (data) => {
      this.hoverSection(data.sectionId);
    });

    // Listen for reset
    this.eventBus.on("highlight:clear", () => {
      this.clearHighlight();
    });
  }

  /**
   * Highlight a section from either source (model or list)
   * @param {string} sectionId - Section identifier
   * @param {string} source - 'model' or 'list'
   */
  highlightSection(sectionId, source) {
    // Clear previous highlight
    this.clearHighlight();

    this.currentHighlight = sectionId;

    // Highlight in model
    if (source !== "model") {
      this._highlightInModel(sectionId);
    }

    // Highlight in list
    if (source !== "list") {
      this._highlightInList(sectionId);
    }

    // Emit unified event
    this.eventBus.emit("section:highlighted", {
      sectionId,
      source,
    });
  }

  /**
   * Hover effect (lighter than highlight)
   * @param {string} sectionId - Section identifier
   */
  hoverSection(sectionId) {
    this._hoverInModel(sectionId);
    this._hoverInList(sectionId);
  }

  /**
   * Clear all highlights
   */
  clearHighlight() {
    // Clear model highlights
    if (this.viewer && this.viewer.clearHighlights) {
      this.viewer.clearHighlights();
    }

    // Clear list highlights
    this.highlightedElements.forEach((element) => {
      element.classList.remove("highlighted", "hover");
    });
    this.highlightedElements.clear();

    this.currentHighlight = null;
  }

  /**
   * Highlight section in 3D model
   * @private
   */
  _highlightInModel(sectionId) {
    if (!this.viewer) return;

    const object = this.viewer.getObjectByUuid(sectionId);
    if (!object || !object.isMesh) return;

    // Store original material
    if (!object.userData.originalMaterial) {
      object.userData.originalMaterial = object.material;
    }

    // Apply highlight material (subtle glow)
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.8,
    });

    object.material = highlightMaterial;
  }

  /**
   * Highlight section in list
   * @private
   */
  _highlightInList(sectionId) {
    const listItem = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!listItem) return;

    listItem.classList.add("highlighted");
    this.highlightedElements.add(listItem);

    // Scroll into view smoothly
    listItem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  /**
   * Hover effect in model
   * @private
   */
  _hoverInModel(sectionId) {
    if (!this.viewer || this.currentHighlight === sectionId) return;

    const object = this.viewer.getObjectByUuid(sectionId);
    if (!object || !object.isMesh) return;

    // Subtle hover effect
    if (object.material && object.material.emissiveIntensity !== undefined) {
      object.material.emissiveIntensity = 0.15;
    }
  }

  /**
   * Hover effect in list
   * @private
   */
  _hoverInList(sectionId) {
    if (this.currentHighlight === sectionId) return;

    const listItem = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!listItem) return;

    listItem.classList.add("hover");
    this.highlightedElements.add(listItem);
  }

  /**
   * Cleanup
   */
  destroy() {
    this.clearHighlight();
    this.eventBus.off("model:section:click");
    this.eventBus.off("model:section:hover");
    this.eventBus.off("list:section:click");
    this.eventBus.off("list:section:hover");
    this.eventBus.off("highlight:clear");
  }
}

// Export for use in app
if (typeof window !== "undefined") {
  window.SectionHighlightManager = SectionHighlightManager;
}
