/**
 * Model Event Coordinator - Centralized model event handling
 *
 * Purpose: Provides robust, centralized handling of all model-related events,
 * ensuring consistent propagation to UI and related components. Acts as the
 * single source of truth for model lifecycle management.
 *
 * Responsibilities:
 * - Coordinate model lifecycle events (load, update, unload)
 * - Manage section state transitions (select, highlight, isolate)
 * - Synchronize UI components with model state
 * - Validate event data and maintain event integrity
 * - Provide event history and debugging capabilities
 *
 * Following principles:
 * - Single Responsibility: Only handles event coordination
 * - Dependency Inversion: Depends on EventBus abstraction
 * - Open/Closed: Extensible through event handlers
 */

import { EVENTS } from '../domain/constants.js';

export class ModelEventCoordinator {
  constructor(eventBus, stateManager) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;

    // Event tracking for debugging and validation
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.eventValidation = true;
    this.debugMode = false;

    // State tracking
    this.currentModel = null;
    this.currentSections = new Map();
    this.isolatedSection = null;
    this.selectedSection = null;
    this.focusedObject = null;

    // Initialize event handlers
    this.initializeEventHandlers();
  }

  /**
   * Initialize all event handlers
   */
  initializeEventHandlers() {
    // Model lifecycle handlers
    this.eventBus.subscribe(EVENTS.MODEL_LOAD_START, data => this.handleModelLoadStart(data));
    this.eventBus.subscribe(EVENTS.MODEL_LOADED, data => this.handleModelLoaded(data));
    this.eventBus.subscribe(EVENTS.MODEL_LOAD_ERROR, data => this.handleModelLoadError(data));
    this.eventBus.subscribe(EVENTS.MODEL_UNLOAD, () => this.handleModelUnload());

    // Section lifecycle handlers
    this.eventBus.subscribe(EVENTS.SECTIONS_DISCOVERED, data =>
      this.handleSectionsDiscovered(data)
    );
    this.eventBus.subscribe(EVENTS.SECTION_SELECTED, data => this.handleSectionSelected(data));
    this.eventBus.subscribe(EVENTS.SECTION_DESELECTED, () => this.handleSectionDeselected());
    this.eventBus.subscribe(EVENTS.SECTION_ISOLATED, data => this.handleSectionIsolated(data));
    this.eventBus.subscribe(EVENTS.SECTION_HIGHLIGHTED, data =>
      this.handleSectionHighlighted(data)
    );
    this.eventBus.subscribe(EVENTS.ISOLATION_CLEARED, () => this.handleIsolationCleared());

    // Focus mode handlers
    this.eventBus.subscribe(EVENTS.FOCUS_MODE_ENTERED, data => this.handleFocusModeEntered(data));
    this.eventBus.subscribe(EVENTS.FOCUS_MODE_EXITED, () => this.handleFocusModeExited());

    // Model interaction handlers
    this.eventBus.subscribe(EVENTS.MODEL_CLICKED, data => this.handleModelClicked(data));
    this.eventBus.subscribe(EVENTS.OBJECT_SELECTED, data => this.handleObjectSelected(data));
    this.eventBus.subscribe(EVENTS.OBJECT_DESELECTED, () => this.handleObjectDeselected());
  }

  /**
   * Emit a validated and tracked event
   */
  emitEvent(eventType, data = null, options = {}) {
    const { skipValidation = false, metadata = {} } = options;

    // Validate event
    if (this.eventValidation && !skipValidation) {
      if (!this.validateEvent(eventType, data)) {
        console.error(`Event validation failed for ${eventType}`, data);
        this.emitEvent(
          EVENTS.ERROR_OCCURRED,
          {
            type: 'validation',
            event: eventType,
            data,
            message: 'Event validation failed',
          },
          { skipValidation: true }
        );
        return false;
      }
    }

    // Track event in history
    this.trackEvent(eventType, data, metadata);

    // Debug logging
    if (this.debugMode) {
      console.log(`[ModelEventCoordinator] Emitting ${eventType}`, data, metadata);
    }

    // Emit the event
    try {
      this.eventBus.emit(eventType, data);
      return true;
    } catch (error) {
      console.error(`Error emitting event ${eventType}:`, error);
      this.emitEvent(
        EVENTS.ERROR_OCCURRED,
        {
          type: 'emission',
          event: eventType,
          error: error.message,
        },
        { skipValidation: true }
      );
      return false;
    }
  }

  /**
   * Handle model load start
   */
  handleModelLoadStart(data) {
    const { modelId, modelName, source } = data;

    // Clear previous model state
    if (this.currentModel) {
      this.handleModelUnload();
    }

    // Update state
    this.currentModel = { id: modelId, name: modelName, source };

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'loading',
      message: `Loading ${modelName}...`,
      progress: 0,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Model load started:', data);
    }
  }

  /**
   * Handle model loaded successfully
   */
  handleModelLoaded(data) {
    const { model, sections, object3D } = data;

    // Update state
    this.currentModel = { ...this.currentModel, ...model, object3D };

    // Update sections map first
    if (sections && sections.length > 0) {
      this.currentSections.clear();
      sections.forEach(section => {
        this.currentSections.set(section.id, section);
      });

      // Emit sections discovered event for other listeners
      this.emitEvent(EVENTS.SECTIONS_DISCOVERED, { sections, modelId: model.id });
    }

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'loaded',
      message: `Model "${model.name}" loaded successfully`,
      model: this.currentModel,
    });

    // Update navigation
    this.emitEvent(EVENTS.NAVIGATION_UPDATE_REQUIRED, {
      type: 'model-loaded',
      sections: sections || [],
    });

    // Update state manager with populated sections
    this.stateManager.setState({
      currentModel: this.currentModel,
      sections: this.currentSections,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Model loaded:', {
        model: this.currentModel,
        sectionsCount: sections?.length || 0,
      });
    }
  }

  /**
   * Handle model load error
   */
  handleModelLoadError(data) {
    const { error, modelId, modelName } = data;

    // Clear loading state
    this.currentModel = null;

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'error',
      message: `Failed to load ${modelName}: ${error}`,
    });

    console.error('[ModelEventCoordinator] Model load error:', data);
  }

  /**
   * Handle model unload
   */
  handleModelUnload() {
    // Clear all model-related state
    const previousModel = this.currentModel;

    this.currentModel = null;
    this.currentSections.clear();
    this.isolatedSection = null;
    this.selectedSection = null;
    this.focusedObject = null;

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'unloaded',
      message: 'Model unloaded',
    });

    // Update navigation
    this.emitEvent(EVENTS.NAVIGATION_UPDATE_REQUIRED, {
      type: 'model-unloaded',
      sections: [],
    });

    // Update state manager
    this.stateManager.setState({
      currentModel: null,
      sections: new Map(),
      selectedSection: null,
      isolatedSection: null,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Model unloaded:', previousModel);
    }
  }

  /**
   * Handle sections discovered
   */
  handleSectionsDiscovered(data) {
    const { sections, modelId } = data;

    // Update sections map
    this.currentSections.clear();
    sections.forEach(section => {
      this.currentSections.set(section.id, section);
    });

    // Update state
    this.stateManager.setState({
      sections: this.currentSections,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Sections discovered:', {
        count: sections.length,
        modelId,
      });
    }
  }

  /**
   * Handle section selected
   */
  handleSectionSelected(data) {
    const { sectionId } = data;

    // Validate section exists
    if (!this.currentSections.has(sectionId)) {
      console.warn(`[ModelEventCoordinator] Section ${sectionId} not found`);
      return;
    }

    // Deselect previous section
    if (this.selectedSection && this.selectedSection !== sectionId) {
      this.emitEvent(EVENTS.SECTION_DESELECTED, {
        sectionId: this.selectedSection,
      });
    }

    // Update state
    this.selectedSection = sectionId;
    const section = this.currentSections.get(sectionId);

    // Synchronize UI
    this.emitEvent(EVENTS.SELECTION_STATE_CHANGED, {
      selectedSection: sectionId,
      section,
    });

    // Update state manager
    this.stateManager.setState({
      selectedSection: sectionId,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Section selected:', sectionId);
    }
  }

  /**
   * Handle section deselected
   */
  handleSectionDeselected() {
    const previousSelection = this.selectedSection;
    this.selectedSection = null;

    // Synchronize UI
    this.emitEvent(EVENTS.SELECTION_STATE_CHANGED, {
      selectedSection: null,
      previousSelection,
    });

    // Update state manager
    this.stateManager.setState({
      selectedSection: null,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Section deselected:', previousSelection);
    }
  }

  /**
   * Handle section isolated
   */
  handleSectionIsolated(data) {
    const { sectionId } = data;

    // Validate section exists
    if (!this.currentSections.has(sectionId)) {
      console.warn(`[ModelEventCoordinator] Section ${sectionId} not found`);
      return;
    }

    // Update state
    this.isolatedSection = sectionId;
    const section = this.currentSections.get(sectionId);

    // Emit disassembly event
    this.emitEvent(EVENTS.MODEL_DISASSEMBLED, {
      isolatedSection: sectionId,
      section,
    });

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'isolation',
      message: `Section "${section.name}" isolated`,
      sectionId,
    });

    // Update navigation
    this.emitEvent(EVENTS.NAVIGATION_UPDATE_REQUIRED, {
      type: 'section-isolated',
      sectionId,
    });

    // Update state manager
    this.stateManager.setState({
      isolatedSection: sectionId,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Section isolated:', sectionId);
    }
  }

  /**
   * Handle section highlighted
   */
  handleSectionHighlighted(data) {
    const { sectionId, highlighted } = data;

    // Validate section exists
    if (!this.currentSections.has(sectionId)) {
      console.warn(`[ModelEventCoordinator] Section ${sectionId} not found`);
      return;
    }

    // Update section state
    const section = this.currentSections.get(sectionId);
    section.isHighlighted = highlighted;

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'highlight',
      sectionId,
      highlighted,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Section highlighted:', { sectionId, highlighted });
    }
  }

  /**
   * Handle isolation cleared
   */
  handleIsolationCleared() {
    const previousIsolation = this.isolatedSection;
    this.isolatedSection = null;

    // Emit reassembly event
    this.emitEvent(EVENTS.MODEL_REASSEMBLED, {
      previousIsolation,
    });

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'isolation-cleared',
      message: 'All sections visible',
    });

    // Update navigation
    this.emitEvent(EVENTS.NAVIGATION_UPDATE_REQUIRED, {
      type: 'isolation-cleared',
    });

    // Update state manager
    this.stateManager.setState({
      isolatedSection: null,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Isolation cleared:', previousIsolation);
    }
  }

  /**
   * Handle focus mode entered
   */
  handleFocusModeEntered(data) {
    const { object, sectionId } = data;

    this.focusedObject = { object, sectionId };

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'focus-entered',
      message: 'Focus mode active',
      sectionId,
    });

    // Update state manager
    this.stateManager.setState({
      focusMode: true,
      focusedObject: this.focusedObject,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Focus mode entered:', sectionId);
    }
  }

  /**
   * Handle focus mode exited
   */
  handleFocusModeExited() {
    const previousFocus = this.focusedObject;
    this.focusedObject = null;

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'focus-exited',
      message: 'Focus mode exited',
    });

    // Update state manager
    this.stateManager.setState({
      focusMode: false,
      focusedObject: null,
    });

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Focus mode exited:', previousFocus);
    }
  }

  /**
   * Handle model clicked
   */
  handleModelClicked(data) {
    const { mesh, meshName, sectionId, point } = data;

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Model clicked:', {
        meshName,
        sectionId,
        point,
      });
    }

    // If a section was clicked, select it
    if (sectionId) {
      this.emitEvent(EVENTS.SECTION_SELECTED, { sectionId });
    }

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'model-clicked',
      meshName,
      sectionId,
      point,
    });
  }

  /**
   * Handle object selected
   */
  handleObjectSelected(data) {
    const { object, sectionId } = data;

    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Object selected:', {
        objectName: object?.name,
        sectionId,
      });
    }

    // If section exists, trigger section selection
    if (sectionId && this.currentSections.has(sectionId)) {
      this.emitEvent(EVENTS.SECTION_SELECTED, { sectionId });

      // Also highlight the section
      this.emitEvent(EVENTS.SECTION_HIGHLIGHTED, {
        sectionId,
        highlighted: true,
      });
    }

    // Update state
    this.stateManager.setState({
      selectedObject: object,
    });
  }

  /**
   * Handle object deselected
   */
  handleObjectDeselected() {
    if (this.debugMode) {
      console.log('[ModelEventCoordinator] Object deselected');
    }

    // Deselect any selected section
    if (this.selectedSection) {
      this.emitEvent(EVENTS.SECTION_DESELECTED);
    }

    // Update state
    this.stateManager.setState({
      selectedObject: null,
    });

    // Synchronize UI
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'object-deselected',
    });
  }

  /**
   * Validate event data
   */
  validateEvent(eventType, data) {
    // Skip validation for certain events
    const skipValidation = [
      EVENTS.ERROR_OCCURRED,
      EVENTS.WARNING_OCCURRED,
      EVENTS.UI_UPDATE_REQUIRED,
    ];

    if (skipValidation.includes(eventType)) {
      return true;
    }

    // Validate based on event type
    switch (eventType) {
      case EVENTS.MODEL_LOAD_START:
        return data && data.modelId && data.modelName;

      case EVENTS.MODEL_LOADED:
        return data && data.model && data.model.id;

      case EVENTS.SECTION_SELECTED:
      case EVENTS.SECTION_ISOLATED:
        return data && data.sectionId;

      case EVENTS.SECTION_HIGHLIGHTED:
        return data && data.sectionId && typeof data.highlighted === 'boolean';

      case EVENTS.SECTIONS_DISCOVERED:
        return data && Array.isArray(data.sections);

      default:
        return true; // Allow other events by default
    }
  }

  /**
   * Track event in history
   */
  trackEvent(eventType, data, metadata) {
    const event = {
      type: eventType,
      data,
      metadata,
      timestamp: Date.now(),
    };

    this.eventHistory.push(event);

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   */
  getEventHistory(filter = null) {
    if (!filter) {
      return [...this.eventHistory];
    }

    return this.eventHistory.filter(event => {
      if (filter.eventType && event.type !== filter.eventType) {
        return false;
      }
      if (filter.since && event.timestamp < filter.since) {
        return false;
      }
      return true;
    });
  }

  /**
   * Clear event history
   */
  clearEventHistory() {
    this.eventHistory = [];
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    console.log(`[ModelEventCoordinator] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable event validation
   */
  setEventValidation(enabled) {
    this.eventValidation = enabled;
  }

  /**
   * Get current model state
   */
  getCurrentState() {
    return {
      model: this.currentModel,
      sections: Array.from(this.currentSections.values()),
      isolatedSection: this.isolatedSection,
      selectedSection: this.selectedSection,
      focusedObject: this.focusedObject,
    };
  }

  /**
   * Create state snapshot
   */
  createSnapshot() {
    const snapshot = {
      ...this.getCurrentState(),
      timestamp: Date.now(),
    };

    this.emitEvent(EVENTS.STATE_SNAPSHOT, snapshot);

    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  restoreSnapshot(snapshot) {
    // Restore state
    this.currentModel = snapshot.model;
    this.currentSections = new Map(snapshot.sections.map(s => [s.id, s]));
    this.isolatedSection = snapshot.isolatedSection;
    this.selectedSection = snapshot.selectedSection;
    this.focusedObject = snapshot.focusedObject;

    // Emit restoration event
    this.emitEvent(EVENTS.STATE_RESTORED, {
      snapshot,
      restoredAt: Date.now(),
    });

    // Synchronize all components
    this.emitEvent(EVENTS.UI_UPDATE_REQUIRED, {
      type: 'state-restored',
      message: 'State restored from snapshot',
    });

    this.emitEvent(EVENTS.NAVIGATION_UPDATE_REQUIRED, {
      type: 'state-restored',
      sections: snapshot.sections,
    });
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    this.currentModel = null;
    this.currentSections.clear();
    this.isolatedSection = null;
    this.selectedSection = null;
    this.focusedObject = null;
    this.clearEventHistory();

    console.log('[ModelEventCoordinator] Disposed');
  }
}
