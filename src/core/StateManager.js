/**
 * State Manager - Centralized application state management
 * Following Single Responsibility Principle and Observer Pattern
 */

import { ViewerState } from '../domain/models.js';
import { EVENTS } from '../domain/constants.js';

export class StateManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = new ViewerState();
    this.history = [];
    this.maxHistorySize = 50;
  }

  /**
   * Get current state (read-only)
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state and emit change event
   */
  setState(updates) {
    // Save to history
    this.saveToHistory();

    // Apply updates
    Object.assign(this.state, updates);

    // Emit state changed event
    this.eventBus.emit(EVENTS.STATE_CHANGED, this.getState());
  }

  /**
   * Set current model
   */
  setCurrentModel(model) {
    this.setState({ currentModel: model });
  }

  /**
   * Get current model
   */
  getCurrentModel() {
    return this.state.currentModel;
  }

  /**
   * Set sections
   */
  setSections(sections) {
    const sectionsMap = new Map();
    sections.forEach(section => {
      sectionsMap.set(section.id, section);
    });
    this.setState({ sections: sectionsMap });
  }

  /**
   * Get all sections
   */
  getSections() {
    return Array.from(this.state.sections.values());
  }

  /**
   * Get a section by ID
   */
  getSection(id) {
    return this.state.sections.get(id);
  }

  /**
   * Set selected section
   */
  setSelectedSection(sectionId) {
    this.setState({ selectedSection: sectionId });
    this.eventBus.emit(EVENTS.SECTION_SELECTED, { sectionId });
  }

  /**
   * Get selected section
   */
  getSelectedSection() {
    return this.state.selectedSection;
  }

  /**
   * Set isolated section
   */
  setIsolatedSection(sectionId) {
    this.setState({ isolatedSection: sectionId });
    this.eventBus.emit(EVENTS.SECTION_ISOLATED, { sectionId });
  }

  /**
   * Get isolated section
   */
  getIsolatedSection() {
    return this.state.isolatedSection;
  }

  /**
   * Clear isolated section
   */
  clearIsolatedSection() {
    this.setState({ isolatedSection: null });
    this.eventBus.emit(EVENTS.ISOLATION_CLEARED);
  }

  /**
   * Set zoom level
   */
  setZoom(zoom) {
    this.setState({ zoom });
    this.eventBus.emit(EVENTS.ZOOM_CHANGED, zoom);
  }

  /**
   * Get zoom level
   */
  getZoom() {
    return this.state.zoom;
  }

  /**
   * Set fullscreen state
   */
  setFullscreen(isFullscreen) {
    this.setState({ isFullscreen });
    this.eventBus.emit(EVENTS.FULLSCREEN_TOGGLED, isFullscreen);
  }

  /**
   * Get fullscreen state
   */
  isFullscreen() {
    return this.state.isFullscreen;
  }

  /**
   * Set camera position
   */
  setCameraPosition(position) {
    this.setState({ cameraPosition: { ...position } });
  }

  /**
   * Get camera position
   */
  getCameraPosition() {
    return { ...this.state.cameraPosition };
  }

  /**
   * Set camera target
   */
  setCameraTarget(target) {
    this.setState({ cameraTarget: { ...target } });
  }

  /**
   * Get camera target
   */
  getCameraTarget() {
    return { ...this.state.cameraTarget };
  }

  /**
   * Reset state to defaults
   */
  reset() {
    this.state.reset();
    this.eventBus.emit(EVENTS.VIEW_RESET);
    this.eventBus.emit(EVENTS.STATE_CHANGED, this.getState());
  }

  /**
   * Save current state to history
   */
  saveToHistory() {
    const snapshot = JSON.parse(
      JSON.stringify({
        currentModel: this.state.currentModel,
        selectedSection: this.state.selectedSection,
        isolatedSection: this.state.isolatedSection,
        zoom: this.state.zoom,
        cameraPosition: this.state.cameraPosition,
        cameraTarget: this.state.cameraTarget,
      })
    );

    this.history.push(snapshot);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Clear state
   */
  clear() {
    this.state = new ViewerState();
    this.history = [];
    this.eventBus.emit(EVENTS.STATE_CHANGED, this.getState());
  }
}
