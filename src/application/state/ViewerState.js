/**
 * Viewer State
 * Immutable state container for viewer application
 * Manages all application state in a centralized, predictable way
 */

export class ViewerState {
  constructor(initialState = {}) {
    this.state = this.createDefaultState();

    // Merge with initial state
    if (initialState) {
      this.state = this.deepMerge(this.state, initialState);
    }

    Object.freeze(this);
  }

  /**
   * Create default state structure
   *
   * @returns {Object}
   */
  createDefaultState() {
    return {
      // Model state
      models: {
        loaded: [],
        active: null,
        loading: false,
        loadProgress: 0,
      },

      // Section state
      sections: {
        discovered: [],
        selected: [],
        highlighted: [],
        isolated: [],
        tree: null,
      },

      // Camera state
      camera: {
        position: { x: 5, y: 5, z: 5 },
        target: { x: 0, y: 0, z: 0 },
        fov: 60,
        preset: 'isometric',
      },

      // Navigation state
      navigation: {
        focusMode: false,
        focusTarget: null,
      },

      // Selection state
      selection: {
        enabled: true,
        mode: 'single', // 'single' | 'multi'
        hovered: null,
        clicked: null,
      },

      // UI state
      ui: {
        sidebarOpen: true,
        sidebarTab: 'sections', // 'sections' | 'properties' | 'settings'
        showStats: false,
        showGrid: true,
        showAxes: true,
        theme: 'dark',
      },

      // Viewer settings
      settings: {
        backgroundColor: '#1a1a1a',
        shadowsEnabled: true,
        antialiasingEnabled: true,
        highlightColor: '#00ff00',
        selectionColor: '#0088ff',
      },

      // Error state
      errors: {
        current: null,
        history: [],
      },
    };
  }

  /**
   * Get entire state
   *
   * @returns {Object}
   */
  getState() {
    return this.state;
  }

  /**
   * Get state by path
   *
   * @param {string} path - Dot-notation path (e.g., 'models.active')
   * @returns {*}
   */
  get(path) {
    return this.getNestedValue(this.state, path);
  }

  /**
   * Create new state with updates
   *
   * @param {Object} updates - State updates
   * @returns {ViewerState}
   */
  update(updates) {
    const newState = this.deepMerge(this.state, updates);
    return new ViewerState(newState);
  }

  /**
   * Set value by path
   *
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @returns {ViewerState}
   */
  set(path, value) {
    const newState = this.setNestedValue(this.state, path, value);
    return new ViewerState(newState);
  }

  /**
   * Deep merge objects
   *
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object}
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && !Array.isArray(source[key]) && key in target) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Get nested value by path
   *
   * @param {Object} obj - Object
   * @param {string} path - Dot-notation path
   * @returns {*}
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value by path
   *
   * @param {Object} obj - Object
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @returns {Object}
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const result = JSON.parse(JSON.stringify(obj)); // Deep clone

    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  /**
   * Convert to JSON
   *
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Create from JSON
   *
   * @param {string} json - JSON string
   * @returns {ViewerState}
   */
  static fromJSON(json) {
    const state = JSON.parse(json);
    return new ViewerState(state);
  }
}
