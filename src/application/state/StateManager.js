/**
 * State Manager
 * Implements IStateManager interface
 * Manages application state with history and subscriptions
 */

import { ViewerState } from './ViewerState.js';

export class StateManager {
  constructor(eventBus, initialState = null) {
    this.eventBus = eventBus;
    this.currentState = new ViewerState(initialState);
    this.history = [this.currentState];
    this.historyIndex = 0;
    this.maxHistorySize = 50;
    this.subscribers = new Set();
  }

  /**
   * Get current state
   *
   * @returns {Object}
   */
  getState() {
    return this.currentState.getState();
  }

  /**
   * Get state by path
   *
   * @param {string} path - Dot-notation path
   * @returns {*}
   */
  get(path) {
    return this.currentState.get(path);
  }

  /**
   * Set state
   *
   * @param {Object} updates - State updates
   */
  setState(updates) {
    // Create new state
    const newState = this.currentState.update(updates);

    // Update current state
    const previousState = this.currentState;
    this.currentState = newState;

    // Add to history
    this.addToHistory(newState);

    // Notify subscribers
    this.notifySubscribers(newState, previousState);

    // Emit state change event
    this.eventBus.emit('state:changed', {
      state: newState.getState(),
      previous: previousState.getState(),
      updates,
    });
  }

  /**
   * Set value by path
   *
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   */
  set(path, value) {
    const newState = this.currentState.set(path, value);

    const previousState = this.currentState;
    this.currentState = newState;

    this.addToHistory(newState);
    this.notifySubscribers(newState, previousState);

    this.eventBus.emit('state:changed', {
      state: newState.getState(),
      previous: previousState.getState(),
      path,
      value,
    });
  }

  /**
   * Subscribe to state changes
   *
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   *
   * @param {ViewerState} newState - New state
   * @param {ViewerState} previousState - Previous state
   */
  notifySubscribers(newState, previousState) {
    this.subscribers.forEach(callback => {
      try {
        callback(newState.getState(), previousState.getState());
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  /**
   * Add state to history
   *
   * @param {ViewerState} state - State to add
   */
  addToHistory(state) {
    // Remove any future states if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add new state
    this.history.push(state);
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Get state history
   *
   * @returns {Array}
   */
  getHistory() {
    return this.history.map(state => state.getState());
  }

  /**
   * Undo state change
   *
   * @returns {boolean} True if undo was successful
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const previousState = this.currentState;
      this.currentState = this.history[this.historyIndex];

      this.notifySubscribers(this.currentState, previousState);

      this.eventBus.emit('state:undo', {
        state: this.currentState.getState(),
        index: this.historyIndex,
      });

      return true;
    }
    return false;
  }

  /**
   * Redo state change
   *
   * @returns {boolean} True if redo was successful
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const previousState = this.currentState;
      this.currentState = this.history[this.historyIndex];

      this.notifySubscribers(this.currentState, previousState);

      this.eventBus.emit('state:redo', {
        state: this.currentState.getState(),
        index: this.historyIndex,
      });

      return true;
    }
    return false;
  }

  /**
   * Check if undo is available
   *
   * @returns {boolean}
   */
  canUndo() {
    return this.historyIndex > 0;
  }

  /**
   * Check if redo is available
   *
   * @returns {boolean}
   */
  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [this.currentState];
    this.historyIndex = 0;

    this.eventBus.emit('state:history:cleared', {});
  }

  /**
   * Reset to initial state
   */
  reset() {
    const previousState = this.currentState;
    this.currentState = new ViewerState();
    this.history = [this.currentState];
    this.historyIndex = 0;

    this.notifySubscribers(this.currentState, previousState);

    this.eventBus.emit('state:reset', {
      state: this.currentState.getState(),
    });
  }

  /**
   * Export state as JSON
   *
   * @returns {string}
   */
  export() {
    return this.currentState.toJSON();
  }

  /**
   * Import state from JSON
   *
   * @param {string} json - JSON string
   */
  import(json) {
    try {
      const previousState = this.currentState;
      this.currentState = ViewerState.fromJSON(json);
      this.history = [this.currentState];
      this.historyIndex = 0;

      this.notifySubscribers(this.currentState, previousState);

      this.eventBus.emit('state:imported', {
        state: this.currentState.getState(),
      });
    } catch (error) {
      throw new Error(`State import failed: ${error.message}`);
    }
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.subscribers.clear();
    this.history = [];
    this.historyIndex = 0;
  }
}
