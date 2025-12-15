/**
 * State action creators
 * Encapsulate all state mutation logic with validation
 */
import { stateManager } from './StateManager.js';

export const StateActions = {
  // Model actions
  setModel(model) {
    if (!model) {
      throw new Error('Model cannot be null');
    }
    stateManager.setState({ model });
  },

  clearModel() {
    stateManager.setState({
      model: null,
      selection: null,
      highlightedSectionId: null,
      hoveredSectionId: null,
      isDisassembled: false,
    });
  },

  // Camera actions
  setCamera(camera) {
    stateManager.setState({ camera });
  },

  // Selection actions
  setSelection(selection) {
    stateManager.setState({ selection });
  },

  selectSection(sectionId) {
    const state = stateManager.getState();
    if (state.selection) {
      state.selection.add(sectionId);
      stateManager.setState({ selection: state.selection });
    }
  },

  deselectSection(sectionId) {
    const state = stateManager.getState();
    if (state.selection) {
      state.selection.remove(sectionId);
      stateManager.setState({ selection: state.selection });
    }
  },

  clearSelection() {
    const state = stateManager.getState();
    if (state.selection) {
      state.selection.clear();
      stateManager.setState({ selection: state.selection });
    }
  },

  // Highlight actions
  setHighlightedSection(sectionId) {
    stateManager.setState({ highlightedSectionId: sectionId });
  },

  clearHighlight() {
    stateManager.setState({ highlightedSectionId: null });
  },

  // Hover actions
  setHoveredSection(sectionId) {
    stateManager.setState({ hoveredSectionId: sectionId });
  },

  clearHover() {
    stateManager.setState({ hoveredSectionId: null });
  },

  // View mode actions
  setViewMode(mode) {
    const validModes = ['default', 'fullscreen', 'isolated'];
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid view mode: ${mode}`);
    }
    stateManager.setState({ viewMode: mode });
  },

  // Loading state
  setLoading(isLoading) {
    stateManager.setState({ isLoading });
  },

  // Disassembly state
  setDisassembled(isDisassembled) {
    stateManager.setState({ isDisassembled });
  },

  // Error handling
  setError(error) {
    stateManager.setState({ error });
  },

  clearError() {
    stateManager.setState({ error: null });
  },

  // UI actions
  toggleSidebar() {
    const state = stateManager.getState();
    stateManager.setState({
      ui: {
        ...state.ui,
        sidebarVisible: !state.ui.sidebarVisible,
      },
    });
  },

  togglePropertiesPanel() {
    const state = stateManager.getState();
    stateManager.setState({
      ui: {
        ...state.ui,
        propertiesPanelVisible: !state.ui.propertiesPanelVisible,
      },
    });
  },

  setUIVisibility(component, visible) {
    const state = stateManager.getState();
    stateManager.setState({
      ui: {
        ...state.ui,
        [`${component}Visible`]: visible,
      },
    });
  },

  // Batch updates
  batchUpdate(updates) {
    stateManager.setState(updates);
  },
};
