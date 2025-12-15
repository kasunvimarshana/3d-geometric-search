/**
 * StateActions
 *
 * Defines all available state mutations.
 * Each action returns a partial state update.
 */
export class StateActions {
  /**
   * Set model
   */
  static setModel(model) {
    return {
      model,
      isModelLoaded: model !== null,
      modelFormat: model?.format || null,
      statistics: model
        ? model.getStatistics()
        : {
            vertices: 0,
            faces: 0,
            objects: 0,
          },
    };
  }

  /**
   * Clear model
   */
  static clearModel() {
    return {
      model: null,
      isModelLoaded: false,
      modelFormat: null,
      statistics: {
        vertices: 0,
        faces: 0,
        objects: 0,
        loadTime: 0,
      },
    };
  }

  /**
   * Update selection
   */
  static updateSelection(selection) {
    return {
      selection,
    };
  }

  /**
   * Update view state
   */
  static updateViewState(viewState) {
    return {
      viewState,
    };
  }

  /**
   * Set loading
   */
  static setLoading(loading) {
    return {
      ui: {
        loading,
      },
    };
  }

  /**
   * Set error
   */
  static setError(error) {
    return {
      ui: {
        error,
      },
    };
  }

  /**
   * Set fullscreen
   */
  static setFullscreen(isFullscreen) {
    return {
      ui: {
        isFullscreen,
      },
    };
  }

  /**
   * Toggle sidebar
   */
  static toggleSidebar(side, visible) {
    if (side === 'left') {
      return {
        ui: {
          isSidebarLeftVisible: visible,
        },
      };
    } else if (side === 'right') {
      return {
        ui: {
          isSidebarRightVisible: visible,
        },
      };
    }
    return {};
  }

  /**
   * Set upload overlay visibility
   */
  static setUploadOverlayVisible(visible) {
    return {
      ui: {
        uploadOverlayVisible: visible,
      },
    };
  }

  /**
   * Set hovered section
   */
  static setHoveredSection(sectionId) {
    return {
      interaction: {
        hoveredSectionId: sectionId,
      },
    };
  }

  /**
   * Set exploded state
   */
  static setExploded(isExploded, distance = 2) {
    return {
      interaction: {
        isExploded,
        explodeDistance: isExploded ? distance : 0,
      },
    };
  }

  /**
   * Update statistics
   */
  static updateStatistics(statistics) {
    return {
      statistics,
    };
  }
}
