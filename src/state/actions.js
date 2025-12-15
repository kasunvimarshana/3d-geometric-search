/**
 * State Actions
 * Action creators for common state transitions
 */

import { stateManager } from "./StateManager.js";
import { dispatch, EventType } from "../events/EventDispatcher.js";

/**
 * Loads a model with validation and error handling
 * @param {Model3D} model - Model to load
 * @returns {boolean} Success status
 */
export function loadModel(model) {
  try {
    // Validate model
    if (!model || typeof model !== "object") {
      console.error("Invalid model provided to loadModel");
      return false;
    }

    if (!model.id || !model.root) {
      console.error("Model missing required properties (id, root)");
      return false;
    }

    // Update state safely
    stateManager.setModel(model);
    stateManager.clearSelection();
    stateManager.clearFocus();
    stateManager.clearHighlight();
    stateManager.clearIsolated();
    stateManager.setDisassembled(false);

    // Dispatch event with debounce to prevent rapid reloads
    dispatch(EventType.MODEL_LOAD_SUCCESS, { model }, { debounce: 100 });

    return true;
  } catch (error) {
    console.error("Error in loadModel action:", error);
    dispatch(EventType.ERROR, {
      error,
      message: `Failed to load model: ${error.message}`,
      context: { action: "loadModel" },
    });
    return false;
  }
}

/**
 * Unloads current model
 */
export function unloadModel() {
  stateManager.reset();
  dispatch(EventType.MODEL_UNLOAD, {});
}

/**
 * Selects nodes with validation
 * @param {string[]} nodeIds - Node IDs to select
 * @returns {boolean} Success status
 */
export function selectNodes(nodeIds) {
  try {
    // Validate input
    if (!Array.isArray(nodeIds)) {
      console.warn("selectNodes: nodeIds must be an array");
      return false;
    }

    // Filter valid node IDs (non-empty strings)
    const validNodeIds = nodeIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0
    );

    if (validNodeIds.length === 0) {
      console.debug("selectNodes: no valid node IDs provided");
      return clearSelection();
    }

    // Update state
    stateManager.setSelection(validNodeIds);

    // Dispatch with throttle to prevent rapid selection changes
    dispatch(
      EventType.SELECTION_CHANGE,
      { nodeIds: validNodeIds },
      { throttle: 50 }
    );

    return true;
  } catch (error) {
    console.error("Error in selectNodes action:", error);
    return false;
  }
}

/**
 * Clears selection safely
 * @returns {boolean} Success status
 */
export function clearSelection() {
  try {
    stateManager.clearSelection();
    dispatch(EventType.SELECTION_CLEAR, {}, { silent: true });
    return true;
  } catch (error) {
    console.error("Error in clearSelection action:", error);
    return false;
  }
}

/**
 * Focuses on a node with validation
 * @param {string} nodeId - Node ID to focus
 * @returns {boolean} Success status
 */
export function focusNode(nodeId) {
  try {
    // Validate input
    if (!nodeId || typeof nodeId !== "string") {
      console.warn("focusNode: invalid nodeId");
      return false;
    }

    // Update state
    stateManager.setFocus(nodeId);

    // Dispatch with priority and debounce
    dispatch(
      EventType.FOCUS_NODE,
      { nodeId },
      {
        priority: "high",
        debounce: 50,
      }
    );

    return true;
  } catch (error) {
    console.error("Error in focusNode action:", error);
    return false;
  }
}

/**
 * Clears focus safely
 * @returns {boolean} Success status
 */
export function clearFocus() {
  try {
    stateManager.clearFocus();
    dispatch(EventType.FOCUS_CLEAR, {}, { silent: true });
    return true;
  } catch (error) {
    console.error("Error in clearFocus action:", error);
    return false;
  }
}

/**
 * Highlights nodes with validation
 * @param {string[]} nodeIds - Node IDs to highlight
 * @returns {boolean} Success status
 */
export function highlightNodes(nodeIds) {
  try {
    // Validate input
    if (!Array.isArray(nodeIds)) {
      console.warn("highlightNodes: nodeIds must be an array");
      return false;
    }

    // Filter valid node IDs
    const validNodeIds = nodeIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0
    );

    if (validNodeIds.length === 0) {
      console.debug("highlightNodes: no valid node IDs provided");
      return false;
    }

    // Update state
    stateManager.setHighlight(validNodeIds);

    // Dispatch events with throttle to prevent flooding
    validNodeIds.forEach((nodeId) => {
      dispatch(EventType.NODE_HIGHLIGHT, { nodeId }, { throttle: 100 });
    });

    return true;
  } catch (error) {
    console.error("Error in highlightNodes action:", error);
    return false;
  }
}

/**
 * Clears highlights safely
 * @returns {boolean} Success status
 */
export function clearHighlights() {
  try {
    const state = stateManager.getState();
    const nodeIds = state.highlightedNodeIds || [];

    // Dispatch unhighlight events
    nodeIds.forEach((nodeId) => {
      dispatch(EventType.NODE_UNHIGHLIGHT, { nodeId }, { silent: true });
    });

    // Clear state
    stateManager.clearHighlight();

    return true;
  } catch (error) {
    console.error("Error in clearHighlights action:", error);
    return false;
  }
}

/**
 * Isolates a node with validation
 * @param {string} nodeId - Node ID to isolate
 * @returns {boolean} Success status
 */
export function isolateNode(nodeId) {
  try {
    // Validate input
    if (!nodeId || typeof nodeId !== "string") {
      console.warn("isolateNode: invalid nodeId");
      dispatch(EventType.ERROR, {
        error: new Error("Invalid node ID for isolation"),
        context: "isolateNode",
      });
      return false;
    }

    // Update state
    stateManager.setIsolated(nodeId);

    // Dispatch with high priority (affects visibility)
    dispatch(EventType.NODE_ISOLATE, { nodeId }, { priority: "high" });

    return true;
  } catch (error) {
    console.error("Error in isolateNode action:", error);
    dispatch(EventType.ERROR, { error, context: "isolateNode" });
    return false;
  }
}

/**
 * Shows all nodes safely
 * @returns {boolean} Success status
 */
export function showAll() {
  try {
    // Clear isolated state
    stateManager.clearIsolated();

    // Dispatch with high priority (affects visibility)
    dispatch(EventType.SHOW_ALL, {}, { priority: "high" });

    return true;
  } catch (error) {
    console.error("Error in showAll action:", error);
    dispatch(EventType.ERROR, { error, context: "showAll" });
    return false;
  }
}

/**
 * Disassembles model safely
 * @returns {boolean} Success status
 */
export function disassemble() {
  try {
    // Update state
    stateManager.setDisassembled(true);

    // Dispatch with debounce to prevent rapid toggling
    dispatch(EventType.DISASSEMBLE, {}, { debounce: 200 });

    return true;
  } catch (error) {
    console.error("Error in disassemble action:", error);
    dispatch(EventType.ERROR, { error, context: "disassemble" });
    return false;
  }
}

/**
 * Reassembles model safely
 * @returns {boolean} Success status
 */
export function reassemble() {
  try {
    // Update state
    stateManager.setDisassembled(false);

    // Dispatch with debounce to prevent rapid toggling
    dispatch(EventType.REASSEMBLE, {}, { debounce: 200 });

    return true;
  } catch (error) {
    console.error("Error in reassemble action:", error);
    dispatch(EventType.ERROR, { error, context: "reassemble" });
    return false;
  }
}

/**
 * Resets camera safely
 * @returns {boolean} Success status
 */
export function resetCamera() {
  try {
    // Dispatch with debounce to prevent rapid resets
    dispatch(EventType.CAMERA_RESET, {}, { debounce: 100 });

    return true;
  } catch (error) {
    console.error("Error in resetCamera action:", error);
    dispatch(EventType.ERROR, { error, context: "resetCamera" });
    return false;
  }
}

/**
 * Enters fullscreen safely
 * @returns {boolean} Success status
 */
export function enterFullscreen() {
  try {
    // Update state
    stateManager.setFullscreen(true);

    // Dispatch with retry (browser API may fail)
    dispatch(EventType.FULLSCREEN_ENTER, {}, { retry: true });

    return true;
  } catch (error) {
    console.error("Error in enterFullscreen action:", error);
    dispatch(EventType.ERROR, { error, context: "enterFullscreen" });
    return false;
  }
}

/**
 * Exits fullscreen safely
 * @returns {boolean} Success status
 */
export function exitFullscreen() {
  try {
    // Update state
    stateManager.setFullscreen(false);

    // Dispatch with retry (browser API may fail)
    dispatch(EventType.FULLSCREEN_EXIT, {}, { retry: true });

    return true;
  } catch (error) {
    console.error("Error in exitFullscreen action:", error);
    dispatch(EventType.ERROR, { error, context: "exitFullscreen" });
    return false;
  }
}

/**
 * Sets error safely
 * @param {Error|string} error - Error to set
 * @returns {boolean} Success status
 */
export function setError(error) {
  try {
    // Validate input
    if (!error) {
      console.warn("setError: no error provided");
      return false;
    }

    // Format error message
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Update state
    stateManager.setError(errorMessage);

    // Dispatch with high priority (user needs immediate feedback)
    dispatch(
      EventType.ERROR,
      {
        error,
        message: errorMessage,
      },
      { priority: "high" }
    );

    return true;
  } catch (err) {
    console.error("Error in setError action:", err);
    return false;
  }
}

/**
 * Clears error safely
 * @returns {boolean} Success status
 */
export function clearError() {
  try {
    stateManager.clearError();
    return true;
  } catch (error) {
    console.error("Error in clearError action:", error);
    return false;
  }
}

/**
 * Sets loading state safely
 * @param {boolean} isLoading - Loading state
 * @returns {boolean} Success status
 */
export function setLoading(isLoading) {
  try {
    // Validate input
    if (typeof isLoading !== "boolean") {
      console.warn("setLoading: isLoading must be a boolean");
      return false;
    }

    // Update state
    stateManager.setLoading(isLoading);

    return true;
  } catch (error) {
    console.error("Error in setLoading action:", error);
    return false;
  }
}

/**
 * Sets search results with validation
 * @param {Array} results - Search results
 * @returns {boolean} Success status
 */
export function setSearchResults(results) {
  try {
    // Validate input
    if (!Array.isArray(results)) {
      console.warn("setSearchResults: results must be an array");
      return false;
    }

    // Update state
    stateManager.setSearchResults(results);

    return true;
  } catch (error) {
    console.error("Error in setSearchResults action:", error);
    dispatch(EventType.ERROR, { error, context: "setSearchResults" });
    return false;
  }
}
