/**
 * Event orchestrator
 * Centralized event handling with validation and error handling
 * Coordinates between UI, state, and engine layers
 */
import { stateManager } from '../state/StateManager.js';
import { StateActions } from '../state/StateActions.js';

export class EventOrchestrator {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.eventHandlers = new Map();
    this.setupEventHandlers();
  }

  /**
   * Setup all event handlers
   */
  setupEventHandlers() {
    // Model events
    this.registerHandler('model:load', this.handleModelLoad.bind(this));
    this.registerHandler('model:clear', this.handleModelClear.bind(this));

    // Section events
    this.registerHandler('section:select', this.handleSectionSelect.bind(this));
    this.registerHandler('section:deselect', this.handleSectionDeselect.bind(this));
    this.registerHandler('section:highlight', this.handleSectionHighlight.bind(this));
    this.registerHandler('section:dehighlight', this.handleSectionDehighlight.bind(this));
    this.registerHandler('section:hover', this.handleSectionHover.bind(this));
    this.registerHandler('section:unhover', this.handleSectionUnhover.bind(this));
    this.registerHandler('section:focus', this.handleSectionFocus.bind(this));
    this.registerHandler('section:isolate', this.handleSectionIsolate.bind(this));
    this.registerHandler('section:show-all', this.handleShowAllSections.bind(this));

    // Camera events
    this.registerHandler('camera:reset', this.handleCameraReset.bind(this));
    this.registerHandler('camera:fit', this.handleCameraFit.bind(this));

    // View events
    this.registerHandler('view:fullscreen', this.handleFullscreen.bind(this));
    this.registerHandler('view:mode', this.handleViewModeChange.bind(this));

    // Model manipulation events
    this.registerHandler('model:disassemble', this.handleDisassemble.bind(this));
    this.registerHandler('model:reassemble', this.handleReassemble.bind(this));

    // UI events
    this.registerHandler('ui:toggle-sidebar', this.handleToggleSidebar.bind(this));
    this.registerHandler('ui:toggle-properties', this.handleToggleProperties.bind(this));
  }

  /**
   * Register an event handler
   */
  registerHandler(eventName, handler) {
    if (!eventName || typeof handler !== 'function') {
      throw new Error('Invalid event handler registration');
    }
    this.eventHandlers.set(eventName, handler);
  }

  /**
   * Emit an event
   */
  async emit(eventName, payload = {}) {
    const handler = this.eventHandlers.get(eventName);

    if (!handler) {
      console.warn(`No handler registered for event: ${eventName}`);
      return;
    }

    try {
      // Validate payload
      this.validatePayload(eventName, payload);

      // Execute handler
      await handler(payload);
    } catch (error) {
      console.error(`Error handling event ${eventName}:`, error);
      StateActions.setError({ message: error.message, event: eventName });
    }
  }

  /**
   * Validate event payload
   */
  validatePayload(eventName, payload) {
    // Add specific validation rules as needed
    if (eventName.startsWith('section:') && !payload.sectionId && eventName !== 'section:show-all') {
      throw new Error('Section events require sectionId in payload');
    }
  }

  /**
   * Event handlers
   */
  async handleModelLoad({ model }) {
    if (!model) throw new Error('Model is required');

    StateActions.setLoading(true);
    try {
      this.sceneManager.loadModel(model);
      StateActions.setModel(model);
    } finally {
      StateActions.setLoading(false);
    }
  }

  async handleModelClear() {
    this.sceneManager.clearScene();
    StateActions.clearModel();
  }

  async handleSectionSelect({ sectionId }) {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    const section = model.getSectionById(sectionId);
    if (section) {
      section.setSelected(true);
      StateActions.selectSection(sectionId);
      this.sceneManager.selectSection(sectionId, true);
    }
  }

  async handleSectionDeselect({ sectionId }) {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    const section = model.getSectionById(sectionId);
    if (section) {
      section.setSelected(false);
      StateActions.deselectSection(sectionId);
      this.sceneManager.selectSection(sectionId, false);
    }
  }

  async handleSectionHighlight({ sectionId }) {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    // Clear previous highlight
    if (state.highlightedSectionId) {
      this.sceneManager.highlightSection(state.highlightedSectionId, false);
    }

    const section = model.getSectionById(sectionId);
    if (section) {
      section.setHighlighted(true);
      StateActions.setHighlightedSection(sectionId);
      this.sceneManager.highlightSection(sectionId, true);
    }
  }

  async handleSectionDehighlight({ sectionId }) {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    const section = model.getSectionById(sectionId);
    if (section) {
      section.setHighlighted(false);
      StateActions.clearHighlight();
      this.sceneManager.highlightSection(sectionId, false);
    }
  }

  async handleSectionHover({ sectionId }) {
    StateActions.setHoveredSection(sectionId);
  }

  async handleSectionUnhover() {
    StateActions.clearHover();
  }

  async handleSectionFocus({ sectionId }) {
    this.sceneManager.focusOnSection(sectionId);
  }

  async handleSectionIsolate({ sectionId }) {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    const section = model.getSectionById(sectionId);
    if (section) {
      section.setIsolated(true);
      this.sceneManager.isolateSection(sectionId);
      StateActions.setViewMode('isolated');
    }
  }

  async handleShowAllSections() {
    this.sceneManager.showAllSections();
    StateActions.setViewMode('default');
  }

  async handleCameraReset() {
    this.sceneManager.engine.resetCamera();
  }

  async handleCameraFit() {
    this.sceneManager.engine.fitToScene();
  }

  async handleFullscreen() {
    this.sceneManager.engine.toggleFullscreen();
  }

  async handleViewModeChange({ mode }) {
    StateActions.setViewMode(mode);
  }

  async handleDisassemble() {
    const state = stateManager.getState();
    const model = state.model;

    if (!model) return;

    this.sceneManager.disassemble(model);
    StateActions.setDisassembled(true);
  }

  async handleReassemble() {
    this.sceneManager.reassemble();
    StateActions.setDisassembled(false);
  }

  async handleToggleSidebar() {
    StateActions.toggleSidebar();
  }

  async handleToggleProperties() {
    StateActions.togglePropertiesPanel();
  }

  /**
   * Cleanup
   */
  dispose() {
    this.eventHandlers.clear();
  }
}
