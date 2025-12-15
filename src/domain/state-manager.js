/**
 * State Management System
 *
 * Centralized, immutable state management following Redux-like patterns
 * with unidirectional data flow and event-driven updates.
 */

import { ViewportState, SelectionState } from "./models.js";

/**
 * Application state structure
 */
class ApplicationState {
  constructor() {
    this.model = null;
    this.viewport = new ViewportState();
    this.selection = new SelectionState();
    this.ui = {
      loading: false,
      loadingMessage: "",
      expandedNodes: new Set(),
      disassembled: false,
    };
    this.history = {
      past: [],
      future: [],
    };
  }
}

/**
 * State Manager - Central state store with observer pattern
 */
export class StateManager {
  constructor() {
    this.state = new ApplicationState();
    this.listeners = new Map();
    this.middleware = [];
  }

  /**
   * Gets the current state (immutable read-only)
   */
  getState() {
    // Return state without deep cloning to preserve class methods
    // State should be treated as immutable by consumers
    return this.state;
  }

  /**
   * Subscribes to state changes
   * @param {string} stateKey - Specific state path to observe (e.g., 'model', 'selection')
   * @param {Function} callback - Called when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(stateKey, callback) {
    if (!this.listeners.has(stateKey)) {
      this.listeners.set(stateKey, new Set());
    }
    this.listeners.get(stateKey).add(callback);

    return () => {
      this.listeners.get(stateKey).delete(callback);
    };
  }

  /**
   * Dispatches a state change action
   * @param {Object} action - Action object with type and payload
   */
  dispatch(action) {
    if (!action || !action.type) {
      throw new Error("Action must have a type property");
    }

    // Apply middleware
    let processedAction = action;
    for (const middleware of this.middleware) {
      processedAction = middleware(this.state, processedAction);
      if (!processedAction) return; // Middleware can cancel action
    }

    // Apply state change (no history tracking for now to avoid memory issues with large models)
    this.state = this.reducer(this.state, processedAction);

    // Notify listeners
    this.notifyListeners(processedAction.type);
  }

  /**
   * Reducer - Pure function that produces new state
   */
  reducer(state, action) {
    const newState = { ...state };

    switch (action.type) {
      case "MODEL_LOADED":
        newState.model = action.payload.model;
        newState.ui.loading = false;
        break;

      case "MODEL_LOADING":
        newState.ui.loading = true;
        newState.ui.loadingMessage =
          action.payload.message || "Loading model...";
        break;

      case "MODEL_ERROR":
        newState.ui.loading = false;
        newState.model = null;
        break;

      case "SECTION_SELECTED":
        newState.selection = {
          ...newState.selection,
          selectedSections: action.payload.sectionIds,
        };
        break;

      case "SECTION_HIGHLIGHTED":
        newState.selection = {
          ...newState.selection,
          highlightedSections: action.payload.sectionIds,
        };
        break;

      case "SECTION_ISOLATED":
        newState.selection = {
          ...newState.selection,
          isolatedSections: action.payload.sectionIds,
        };
        break;

      case "SELECTION_CLEARED":
        newState.selection = new SelectionState();
        break;

      case "VIEWPORT_UPDATED":
        newState.viewport = {
          ...newState.viewport,
          ...action.payload,
        };
        break;

      case "CAMERA_UPDATED":
        newState.viewport.camera = {
          ...newState.viewport.camera,
          ...action.payload,
        };
        break;

      case "FULLSCREEN_TOGGLED":
        newState.viewport.fullscreen = !newState.viewport.fullscreen;
        break;

      case "NODE_EXPANDED":
        newState.ui.expandedNodes = new Set(newState.ui.expandedNodes);
        newState.ui.expandedNodes.add(action.payload.nodeId);
        break;

      case "NODE_COLLAPSED":
        newState.ui.expandedNodes = new Set(newState.ui.expandedNodes);
        newState.ui.expandedNodes.delete(action.payload.nodeId);
        break;

      case "ALL_NODES_EXPANDED":
        if (newState.model) {
          const allIds = newState.model.getAllSections().map((s) => s.id);
          newState.ui.expandedNodes = new Set(allIds);
        }
        break;

      case "DISASSEMBLE":
        newState.ui.disassembled = true;
        break;

      case "ASSEMBLE":
        newState.ui.disassembled = false;
        break;

      case "STATE_RESET":
        return new ApplicationState();

      default:
        break;
    }

    return newState;
  }

  /**
   * Notifies all listeners subscribed to the changed state
   */
  notifyListeners(actionType) {
    // Notify global listeners
    const globalListeners = this.listeners.get("*");
    if (globalListeners) {
      globalListeners.forEach((callback) =>
        callback(this.getState(), actionType)
      );
    }

    // Notify specific listeners
    this.listeners.forEach((callbacks, key) => {
      if (key !== "*" && actionType.toLowerCase().includes(key.toLowerCase())) {
        callbacks.forEach((callback) => callback(this.getState(), actionType));
      }
    });
  }

  /**
   * Adds middleware for action processing
   */
  use(middleware) {
    this.middleware.push(middleware);
  }

  /**
   * Undo last action
   */
  undo() {
    if (this.state.history.past.length === 0) return;

    const previousState = this.state.history.past.pop();
    this.state.history.future.push(JSON.parse(JSON.stringify(this.state)));
    this.state = previousState;
    this.notifyListeners("UNDO");
  }

  /**
   * Redo last undone action
   */
  redo() {
    if (this.state.history.future.length === 0) return;

    const nextState = this.state.history.future.pop();
    this.state.history.past.push(JSON.parse(JSON.stringify(this.state)));
    this.state = nextState;
    this.notifyListeners("REDO");
  }
}

/**
 * Action creators for common operations
 */
export const Actions = {
  loadModel: (model) => ({
    type: "MODEL_LOADED",
    payload: { model },
  }),

  setLoading: (message) => ({
    type: "MODEL_LOADING",
    payload: { message },
  }),

  selectSection: (sectionIds) => ({
    type: "SECTION_SELECTED",
    payload: {
      sectionIds: Array.isArray(sectionIds) ? sectionIds : [sectionIds],
    },
  }),

  highlightSection: (sectionIds) => ({
    type: "SECTION_HIGHLIGHTED",
    payload: {
      sectionIds: Array.isArray(sectionIds) ? sectionIds : [sectionIds],
    },
  }),

  isolateSection: (sectionIds) => ({
    type: "SECTION_ISOLATED",
    payload: {
      sectionIds: Array.isArray(sectionIds) ? sectionIds : [sectionIds],
    },
  }),

  clearSelection: () => ({
    type: "SELECTION_CLEARED",
  }),

  updateCamera: (cameraState) => ({
    type: "CAMERA_UPDATED",
    payload: cameraState,
  }),

  toggleFullscreen: () => ({
    type: "FULLSCREEN_TOGGLED",
  }),

  expandNode: (nodeId) => ({
    type: "NODE_EXPANDED",
    payload: { nodeId },
  }),

  collapseNode: (nodeId) => ({
    type: "NODE_COLLAPSED",
    payload: { nodeId },
  }),

  expandAllNodes: () => ({
    type: "ALL_NODES_EXPANDED",
  }),

  disassemble: () => ({
    type: "DISASSEMBLE",
  }),

  assemble: () => ({
    type: "ASSEMBLE",
  }),

  reset: () => ({
    type: "STATE_RESET",
  }),
};
