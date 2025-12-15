import { Model } from '../core/entities/Model.js';
import { Selection } from '../core/entities/Selection.js';
import { ViewState } from '../core/entities/ViewState.js';

/**
 * ApplicationState
 *
 * Defines the structure and initial state of the application.
 */
export class ApplicationState {
  static getInitialState() {
    return {
      // Model state
      model: null,
      isModelLoaded: false,
      modelFormat: null,

      // Selection state
      selection: new Selection(),

      // View state
      viewState: new ViewState(),

      // UI state
      ui: {
        isFullscreen: false,
        isSidebarLeftVisible: true,
        isSidebarRightVisible: true,
        uploadOverlayVisible: true,
        loading: false,
        error: null,
      },

      // Interaction state
      interaction: {
        hoveredSectionId: null,
        isExploded: false,
        explodeDistance: 0,
      },

      // Statistics
      statistics: {
        vertices: 0,
        faces: 0,
        objects: 0,
        loadTime: 0,
      },
    };
  }

  /**
   * Validate state structure
   */
  static validate(state) {
    const errors = [];

    if (state.model !== null && !(state.model instanceof Model)) {
      errors.push('Invalid model type');
    }

    if (!(state.selection instanceof Selection)) {
      errors.push('Invalid selection type');
    }

    if (!(state.viewState instanceof ViewState)) {
      errors.push('Invalid viewState type');
    }

    if (!state.ui || typeof state.ui !== 'object') {
      errors.push('Invalid ui state');
    }

    if (!state.interaction || typeof state.interaction !== 'object') {
      errors.push('Invalid interaction state');
    }

    if (!state.statistics || typeof state.statistics !== 'object') {
      errors.push('Invalid statistics state');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
