/**
 * State Management System
 * Centralized state management for reliable synchronization
 * Follows clean architecture principles for predictable state transitions
 */

class StateManager {
  constructor(initialState = {}, options = {}) {
    this.state = { ...initialState };
    this.previousState = { ...initialState };
    this.listeners = new Map();
    this.middleware = [];
    this.history = [];
    this.maxHistorySize = options.maxHistorySize || 50;
    this.enableHistory = options.enableHistory || false;
    this.logger = options.logger || console;
  }

  /**
   * Get current state
   * @param {string} path - Optional dot-notation path (e.g., 'viewer.zoom')
   * @returns {*} State value
   */
  getState(path = null) {
    if (!path) {
      return { ...this.state };
    }

    return this._getNestedValue(this.state, path);
  }

  /**
   * Set state with validation and notification
   * @param {string|Object} pathOrUpdates - Path or updates object
   * @param {*} value - Value to set (if path provided)
   * @param {Object} options - Set options
   */
  setState(pathOrUpdates, value = undefined, options = {}) {
    const { silent = false, validate = true } = options;

    // Store previous state for rollback
    this.previousState = { ...this.state };

    let updates;
    if (typeof pathOrUpdates === "string") {
      updates = { [pathOrUpdates]: value };
    } else {
      updates = pathOrUpdates;
    }

    // Apply middleware
    for (const mw of this.middleware) {
      updates = mw(updates, this.state) || updates;
    }

    // Apply updates
    Object.entries(updates).forEach(([path, val]) => {
      this._setNestedValue(this.state, path, val);
    });

    // Record history
    if (this.enableHistory) {
      this._recordHistory(updates);
    }

    // Notify listeners
    if (!silent) {
      this._notifyListeners(updates);
    }

    return this.state;
  }

  /**
   * Subscribe to state changes
   * @param {string|Function} pathOrHandler - Path to watch or handler for all changes
   * @param {Function} handler - Handler function (if path provided)
   * @returns {Function} Unsubscribe function
   */
  subscribe(pathOrHandler, handler = null) {
    let path, actualHandler;

    if (typeof pathOrHandler === "function") {
      path = "*";
      actualHandler = pathOrHandler;
    } else {
      path = pathOrHandler;
      actualHandler = handler;
    }

    if (!this.listeners.has(path)) {
      this.listeners.set(path, new Set());
    }

    this.listeners.get(path).add(actualHandler);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.delete(actualHandler);
        if (listeners.size === 0) {
          this.listeners.delete(path);
        }
      }
    };
  }

  /**
   * Add middleware for state transformations
   * @param {Function} middleware - Middleware function
   */
  use(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Reset state to initial or provided state
   * @param {Object} newState - Optional new state
   */
  reset(newState = null) {
    this.previousState = { ...this.state };

    if (newState) {
      this.state = { ...newState };
    } else {
      // Reset to empty object or initial state if stored
      this.state = {};
    }

    this._notifyListeners({ "*": "reset" });
  }

  /**
   * Rollback to previous state
   */
  rollback() {
    const temp = this.state;
    this.state = this.previousState;
    this.previousState = temp;

    this._notifyListeners({ "*": "rollback" });
  }

  /**
   * Get state history
   * @returns {Array}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear state history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Batch multiple state updates
   * @param {Function} updateFn - Function that performs multiple setState calls
   */
  batch(updateFn) {
    const originalState = { ...this.state };
    let allUpdates = {};

    // Collect all updates silently
    const originalSetState = this.setState.bind(this);
    this.setState = (pathOrUpdates, value, options = {}) => {
      const updates =
        typeof pathOrUpdates === "string"
          ? { [pathOrUpdates]: value }
          : pathOrUpdates;

      allUpdates = { ...allUpdates, ...updates };
      originalSetState(pathOrUpdates, value, { ...options, silent: true });
    };

    try {
      updateFn();
    } finally {
      this.setState = originalSetState;
    }

    // Notify once with all updates
    this._notifyListeners(allUpdates);
  }

  /**
   * Create a computed property that updates automatically
   * @param {string} targetPath - Path where computed value will be stored
   * @param {string[]} dependencies - Paths to watch
   * @param {Function} compute - Computation function
   */
  computed(targetPath, dependencies, compute) {
    const update = () => {
      const values = dependencies.map((dep) => this.getState(dep));
      const computed = compute(...values);
      this.setState(targetPath, computed, { silent: true });
    };

    // Subscribe to each dependency
    dependencies.forEach((dep) => {
      this.subscribe(dep, update);
    });

    // Compute initial value
    update();
  }

  // Private methods

  _getNestedValue(obj, path) {
    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  _setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    let current = obj;

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  _notifyListeners(updates) {
    // Notify specific path listeners
    Object.keys(updates).forEach((path) => {
      const listeners = this.listeners.get(path);
      if (listeners) {
        listeners.forEach((handler) => {
          try {
            handler(updates[path], path, this.state);
          } catch (error) {
            this.logger.error(`State listener error for ${path}:`, error);
          }
        });
      }
    });

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get("*");
    if (wildcardListeners) {
      wildcardListeners.forEach((handler) => {
        try {
          handler(updates, this.state, this.previousState);
        } catch (error) {
          this.logger.error("State wildcard listener error:", error);
        }
      });
    }
  }

  _recordHistory(updates) {
    this.history.push({
      timestamp: Date.now(),
      updates,
      state: { ...this.state },
      previousState: { ...this.previousState },
    });

    // Trim history if too large
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
}

/**
 * Application State Manager
 * Manages global application state with defined structure
 */
class AppStateManager extends StateManager {
  constructor() {
    super(
      {
        // Viewer state
        viewer: {
          zoom: 50,
          autoRotate: false,
          wireframe: false,
          grid: true,
          axes: true,
          shadows: true,
          scale: 1.0,
          fullscreen: false,
        },

        // Model state
        model: {
          loaded: false,
          name: null,
          type: null,
          vertexCount: 0,
          faceCount: 0,
        },

        // Selection state
        selection: {
          selectedObject: null,
          hoveredObject: null,
          isolatedObject: null,
          selectedNode: null,
        },

        // UI state
        ui: {
          hierarchyPanelOpen: false,
          navigationOpen: false,
          advancedControlsOpen: false,
        },

        // Camera state
        camera: {
          position: null,
          target: null,
          preset: null,
        },
      },
      {
        enableHistory: true,
        maxHistorySize: 100,
      }
    );

    this._setupComputedProperties();
  }

  _setupComputedProperties() {
    // Computed: Is any object selected?
    this.computed(
      "selection.hasSelection",
      ["selection.selectedObject", "selection.isolatedObject"],
      (selected, isolated) => selected !== null || isolated !== null
    );

    // Computed: Is model ready for interaction?
    this.computed(
      "model.ready",
      ["model.loaded", "model.vertexCount"],
      (loaded, vertexCount) => loaded && vertexCount > 0
    );
  }

  // Convenience methods for common state operations

  setViewerState(updates) {
    const prefixed = {};
    Object.entries(updates).forEach(([key, value]) => {
      prefixed[`viewer.${key}`] = value;
    });
    this.setState(prefixed);
  }

  setModelState(updates) {
    const prefixed = {};
    Object.entries(updates).forEach(([key, value]) => {
      prefixed[`model.${key}`] = value;
    });
    this.setState(prefixed);
  }

  setSelectionState(updates) {
    const prefixed = {};
    Object.entries(updates).forEach(([key, value]) => {
      prefixed[`selection.${key}`] = value;
    });
    this.setState(prefixed);
  }

  setUIState(updates) {
    const prefixed = {};
    Object.entries(updates).forEach(([key, value]) => {
      prefixed[`ui.${key}`] = value;
    });
    this.setState(prefixed);
  }

  clearSelection() {
    this.setSelectionState({
      selectedObject: null,
      hoveredObject: null,
      isolatedObject: null,
      selectedNode: null,
    });
  }

  resetModel() {
    this.setModelState({
      loaded: false,
      name: null,
      type: null,
      vertexCount: 0,
      faceCount: 0,
    });
    this.clearSelection();
  }
}

// Export singleton instance
const appState = new AppStateManager();

// Make available globally
if (typeof window !== "undefined") {
  window.AppState = appState;
  window.StateManager = StateManager;
}

export { StateManager, AppStateManager, appState };
export default appState;
