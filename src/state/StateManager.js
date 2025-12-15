/**
 * Application State
 * Centralized state management with immutable updates
 */

import { NodeState } from "../core/types.js";

/**
 * Initial application state
 */
export const initialState = {
  model: null,
  selectedNodeIds: [],
  focusedNodeId: null,
  highlightedNodeIds: [],
  isolatedNodeId: null,
  isDisassembled: false,
  isFullscreen: false,
  isLoading: false,
  error: null,
  searchResults: [],
  viewMode: "default", // 'default', 'wireframe', 'xray'
};

/**
 * State reducer
 * Pure function that returns new state based on action
 */
export class StateManager {
  constructor(initialStateOverride = {}) {
    this.state = { ...initialState, ...initialStateOverride };
    this.listeners = new Set();
    this.history = [this.state];
    this.maxHistory = 50;
  }

  /**
   * Gets current state
   * @returns {Object}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Updates state
   * @param {Object} updates - Partial state updates
   * @returns {Object} - New state
   */
  setState(updates) {
    const newState = { ...this.state, ...updates };

    // Validate state before committing
    if (!this.validateState(newState)) {
      console.warn("Invalid state update rejected:", updates);
      return this.state;
    }

    this.state = newState;
    this.addToHistory(newState);
    this.notifyListeners();

    return this.state;
  }

  /**
   * Subscribes to state changes
   * @param {Function} listener - Listener function
   * @returns {Function} - Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== "function") {
      console.warn("Invalid listener");
      return () => {};
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifies all listeners of state change
   */
  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("Error in state listener:", error);
      }
    });
  }

  /**
   * Validates state consistency
   * @param {Object} state - State to validate
   * @returns {boolean}
   */
  validateState(state) {
    // Ensure arrays are arrays
    if (!Array.isArray(state.selectedNodeIds)) return false;
    if (!Array.isArray(state.highlightedNodeIds)) return false;
    if (!Array.isArray(state.searchResults)) return false;

    // Ensure booleans are booleans
    if (typeof state.isDisassembled !== "boolean") return false;
    if (typeof state.isFullscreen !== "boolean") return false;
    if (typeof state.isLoading !== "boolean") return false;

    return true;
  }

  /**
   * Adds state to history
   * @param {Object} state - State to add
   */
  addToHistory(state) {
    this.history.push({ ...state });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Gets state history
   * @returns {Object[]}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Resets state to initial
   */
  reset() {
    this.setState({ ...initialState });
  }

  // Convenience methods for common state updates

  setModel(model) {
    return this.setState({ model, error: null });
  }

  setLoading(isLoading) {
    return this.setState({ isLoading });
  }

  setError(error) {
    return this.setState({ error, isLoading: false });
  }

  clearError() {
    return this.setState({ error: null });
  }

  setSelection(nodeIds) {
    return this.setState({ selectedNodeIds: nodeIds });
  }

  addToSelection(nodeId) {
    const newSelection = [...this.state.selectedNodeIds, nodeId];
    return this.setState({ selectedNodeIds: newSelection });
  }

  clearSelection() {
    return this.setState({ selectedNodeIds: [] });
  }

  setFocus(nodeId) {
    return this.setState({ focusedNodeId: nodeId });
  }

  clearFocus() {
    return this.setState({ focusedNodeId: null });
  }

  setHighlight(nodeIds) {
    return this.setState({ highlightedNodeIds: nodeIds });
  }

  addHighlight(nodeId) {
    const newHighlights = [...this.state.highlightedNodeIds, nodeId];
    return this.setState({ highlightedNodeIds: newHighlights });
  }

  clearHighlight() {
    return this.setState({ highlightedNodeIds: [] });
  }

  setIsolated(nodeId) {
    return this.setState({ isolatedNodeId: nodeId });
  }

  clearIsolated() {
    return this.setState({ isolatedNodeId: null });
  }

  setDisassembled(isDisassembled) {
    return this.setState({ isDisassembled });
  }

  setFullscreen(isFullscreen) {
    return this.setState({ isFullscreen });
  }

  setSearchResults(results) {
    return this.setState({ searchResults: results });
  }

  setViewMode(mode) {
    return this.setState({ viewMode: mode });
  }
}

// Create singleton instance
export const stateManager = new StateManager();
