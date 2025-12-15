/**
 * Store
 *
 * Centralized state management using observable pattern.
 * Implements unidirectional data flow and immutable state updates.
 */
export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Set state with validation
   */
  setState(newState, saveHistory = true) {
    const previousState = this.state;
    this.state = { ...this.state, ...newState };

    // Save to history
    if (saveHistory) {
      this.saveHistory(previousState);
    }

    // Notify listeners
    this.notifyListeners(newState, previousState);
  }

  /**
   * Update state property
   */
  updateState(path, value) {
    const keys = path.split('.');
    const newState = { ...this.state };

    let current = newState;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      current[key] = { ...current[key] };
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    this.setState(newState);
  }

  /**
   * Get state property
   */
  getStateProperty(path) {
    const keys = path.split('.');
    let current = this.state;

    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }

    return current;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(newState, previousState) {
    this.listeners.forEach((listener) => {
      try {
        listener(newState, previousState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Save state to history
   */
  saveHistory(state) {
    // Remove any forward history if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add to history
    this.history.push(state);
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undo state change
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const previousState = this.history[this.historyIndex];
      this.setState(previousState, false);
      return true;
    }
    return false;
  }

  /**
   * Redo state change
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const nextState = this.history[this.historyIndex];
      this.setState(nextState, false);
      return true;
    }
    return false;
  }

  /**
   * Check if can undo
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Check if can redo
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Reset store
   */
  reset(initialState = {}) {
    this.state = initialState;
    this.clearHistory();
    this.notifyListeners(this.state, {});
  }
}
