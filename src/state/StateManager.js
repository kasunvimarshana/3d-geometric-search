/**
 * Centralized application state manager
 * Implements observer pattern for reactive state updates
 * Single source of truth for all application state
 */
export class StateManager {
  constructor() {
    this.state = {
      model: null,
      camera: null,
      selection: null,
      viewMode: 'default', // 'default', 'fullscreen', 'isolated'
      highlightedSectionId: null,
      hoveredSectionId: null,
      isLoading: false,
      isDisassembled: false,
      error: null,
      ui: {
        sidebarVisible: true,
        propertiesPanelVisible: true,
        toolbarVisible: true,
      },
    };
    this.listeners = new Map();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistorySize = 50;
  }

  /**
   * Get current state (immutable)
   */
  getState() {
    return this.deepClone(this.state);
  }

  /**
   * Get specific state slice
   */
  get(path) {
    const keys = path.split('.');
    let value = this.state;
    for (const key of keys) {
      value = value?.[key];
    }
    return this.deepClone(value);
  }

  /**
   * Update state with validation and history tracking
   */
  setState(updates, options = {}) {
    const { skipHistory = false, skipNotify = false } = options;

    // Validate updates
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid state update');
    }

    // Save to history
    if (!skipHistory) {
      this.saveToHistory();
    }

    // Apply updates
    const prevState = this.deepClone(this.state);
    this.state = this.deepMerge(this.state, updates);

    // Notify listeners
    if (!skipNotify) {
      this.notifyListeners(prevState, this.state);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener, filter = null) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    const id = this.generateId();
    this.listeners.set(id, { listener, filter });

    // Return unsubscribe function
    return () => this.listeners.delete(id);
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners(prevState, nextState) {
    this.listeners.forEach(({ listener, filter }) => {
      try {
        if (!filter || this.hasChanged(prevState, nextState, filter)) {
          listener(nextState, prevState);
        }
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Check if specific paths have changed
   */
  hasChanged(prevState, nextState, paths) {
    if (typeof paths === 'string') {
      paths = [paths];
    }

    return paths.some((path) => {
      const prevValue = this.getValueByPath(prevState, path);
      const nextValue = this.getValueByPath(nextState, path);
      return prevValue !== nextValue;
    });
  }

  /**
   * History management
   */
  saveToHistory() {
    // Remove future history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.history.push(this.deepClone(this.state));

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = this.deepClone(this.history[this.historyIndex]);
      this.notifyListeners({}, this.state);
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = this.deepClone(this.history[this.historyIndex]);
      this.notifyListeners({}, this.state);
      return true;
    }
    return false;
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Reset state to initial
   */
  reset() {
    this.state = {
      model: null,
      camera: null,
      selection: null,
      viewMode: 'default',
      highlightedSectionId: null,
      hoveredSectionId: null,
      isLoading: false,
      isDisassembled: false,
      error: null,
      ui: {
        sidebarVisible: true,
        propertiesPanelVisible: true,
        toolbarVisible: true,
      },
    };
    this.history = [];
    this.historyIndex = -1;
    this.notifyListeners({}, this.state);
  }

  /**
   * Utility methods
   */
  getValueByPath(obj, path) {
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      value = value?.[key];
    }
    return value;
  }

  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Set) return new Set(Array.from(obj));
    if (obj instanceof Map) return new Map(Array.from(obj));
    if (Array.isArray(obj)) return obj.map((item) => this.deepClone(item));

    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  }

  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  generateId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const stateManager = new StateManager();
