/**
 * State Actions
 * Action creators for common state transitions
 */

import { stateManager } from "./StateManager.js";
import { dispatch, EventType } from "../events/EventDispatcher.js";

/**
 * Loads a model
 * @param {Model3D} model - Model to load
 */
export function loadModel(model) {
  stateManager.setModel(model);
  stateManager.clearSelection();
  stateManager.clearFocus();
  stateManager.clearHighlight();
  stateManager.clearIsolated();
  stateManager.setDisassembled(false);

  dispatch(EventType.MODEL_LOAD_SUCCESS, { model });
}

/**
 * Unloads current model
 */
export function unloadModel() {
  stateManager.reset();
  dispatch(EventType.MODEL_UNLOAD, {});
}

/**
 * Selects nodes
 * @param {string[]} nodeIds - Node IDs to select
 */
export function selectNodes(nodeIds) {
  stateManager.setSelection(nodeIds);
  dispatch(EventType.SELECTION_CHANGE, { nodeIds });
}

/**
 * Clears selection
 */
export function clearSelection() {
  stateManager.clearSelection();
  dispatch(EventType.SELECTION_CLEAR, {});
}

/**
 * Focuses on a node
 * @param {string} nodeId - Node ID to focus
 */
export function focusNode(nodeId) {
  stateManager.setFocus(nodeId);
  dispatch(EventType.FOCUS_NODE, { nodeId });
}

/**
 * Clears focus
 */
export function clearFocus() {
  stateManager.clearFocus();
  dispatch(EventType.FOCUS_CLEAR, {});
}

/**
 * Highlights nodes
 * @param {string[]} nodeIds - Node IDs to highlight
 */
export function highlightNodes(nodeIds) {
  stateManager.setHighlight(nodeIds);
  nodeIds.forEach((nodeId) => {
    dispatch(EventType.NODE_HIGHLIGHT, { nodeId });
  });
}

/**
 * Clears highlights
 */
export function clearHighlights() {
  const nodeIds = stateManager.getState().highlightedNodeIds;
  nodeIds.forEach((nodeId) => {
    dispatch(EventType.NODE_UNHIGHLIGHT, { nodeId });
  });
  stateManager.clearHighlight();
}

/**
 * Isolates a node
 * @param {string} nodeId - Node ID to isolate
 */
export function isolateNode(nodeId) {
  stateManager.setIsolated(nodeId);
  dispatch(EventType.NODE_ISOLATE, { nodeId });
}

/**
 * Shows all nodes
 */
export function showAll() {
  stateManager.clearIsolated();
  dispatch(EventType.SHOW_ALL, {});
}

/**
 * Disassembles model
 */
export function disassemble() {
  stateManager.setDisassembled(true);
  dispatch(EventType.DISASSEMBLE, {});
}

/**
 * Reassembles model
 */
export function reassemble() {
  stateManager.setDisassembled(false);
  dispatch(EventType.REASSEMBLE, {});
}

/**
 * Resets camera
 */
export function resetCamera() {
  dispatch(EventType.CAMERA_RESET, {});
}

/**
 * Enters fullscreen
 */
export function enterFullscreen() {
  stateManager.setFullscreen(true);
  dispatch(EventType.FULLSCREEN_ENTER, {});
}

/**
 * Exits fullscreen
 */
export function exitFullscreen() {
  stateManager.setFullscreen(false);
  dispatch(EventType.FULLSCREEN_EXIT, {});
}

/**
 * Sets error
 * @param {Error|string} error - Error to set
 */
export function setError(error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  stateManager.setError(errorMessage);
  dispatch(EventType.ERROR, { error, message: errorMessage });
}

/**
 * Clears error
 */
export function clearError() {
  stateManager.clearError();
}

/**
 * Sets loading state
 * @param {boolean} isLoading - Loading state
 */
export function setLoading(isLoading) {
  stateManager.setLoading(isLoading);
}

/**
 * Sets search results
 * @param {Array} results - Search results
 */
export function setSearchResults(results) {
  stateManager.setSearchResults(results);
}
