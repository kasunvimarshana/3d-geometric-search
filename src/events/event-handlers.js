/**
 * Event Handlers
 *
 * Centralized event handling logic that coordinates between components.
 * Acts as the application controller following MVC pattern.
 */

import { Actions } from "../domain/state-manager.js";

export class EventHandlers {
  constructor(stateManager, renderEngine, loaderFactory) {
    this.stateManager = stateManager;
    this.renderEngine = renderEngine;
    this.loaderFactory = loaderFactory;
  }

  /**
   * Handles model file upload
   */
  async handleFileUpload(file) {
    try {
      // Validate file
      if (!this.loaderFactory.isSupported(file.name)) {
        throw new Error(`Unsupported file format: ${file.name}`);
      }

      // Show loading state
      this.stateManager.dispatch(Actions.setLoading("Loading model..."));

      // Read file
      const data = await this.readFile(file);

      // Load model
      const loader = this.loaderFactory.getLoader(file.name);
      const result = await loader.load(data, file.name);

      // Create model domain object
      const { Model } = await import("../domain/models.js");
      const model = new Model({
        id: this.generateId(),
        name: file.name,
        format: this.loaderFactory.getExtension(file.name),
        data: result.scene,
        metadata: result.metadata,
        sections: result.sections,
      });

      // Load into render engine
      this.renderEngine.loadModel(result.scene, result.sections);

      // Update state
      this.stateManager.dispatch(Actions.loadModel(model));

      return model;
    } catch (error) {
      console.error("Failed to load model:", error);
      this.stateManager.dispatch({
        type: "MODEL_ERROR",
        payload: { error: error.message },
      });
      throw error;
    }
  }

  /**
   * Handles section selection
   */
  handleSectionSelect(sectionId) {
    const state = this.stateManager.getState();
    const currentSelection = state.selection.selectedSections;

    // Toggle selection
    const isSelected = currentSelection.includes(sectionId);
    const newSelection = isSelected
      ? currentSelection.filter((id) => id !== sectionId)
      : [sectionId];

    this.stateManager.dispatch(Actions.selectSection(newSelection));

    // Update rendering
    this.updateSelectionRendering(newSelection);
  }

  /**
   * Handles section hover
   */
  handleSectionHover(sectionId, hover) {
    const state = this.stateManager.getState();
    const currentHighlighted = state.selection.highlightedSections;

    // Skip if already in desired state
    if (hover && currentHighlighted.includes(sectionId)) return;
    if (!hover && currentHighlighted.length === 0) return;

    if (hover) {
      this.renderEngine.highlightSection(sectionId, true);
      this.stateManager.dispatch(Actions.highlightSection([sectionId]));
    } else {
      this.renderEngine.highlightSection(sectionId, false);
      this.stateManager.dispatch(Actions.highlightSection([]));
    }
  }

  /**
   * Handles section isolation
   */
  handleIsolate() {
    const state = this.stateManager.getState();
    const selectedSections = state.selection.selectedSections;

    if (selectedSections.length === 0) return;

    this.renderEngine.isolateSections(selectedSections);
    this.stateManager.dispatch(Actions.isolateSection(selectedSections));
  }

  /**
   * Handles show all
   */
  handleShowAll() {
    this.renderEngine.showAllSections();
    this.stateManager.dispatch(Actions.isolateSection([]));
  }

  /**
   * Handles view reset
   */
  handleResetView() {
    this.renderEngine.resetCamera();
  }

  /**
   * Handles fit to view
   */
  handleFitView() {
    this.renderEngine.fitCameraToModel();
  }

  /**
   * Handles disassembly
   */
  handleDisassemble() {
    this.renderEngine.disassemble();
    this.stateManager.dispatch(Actions.disassemble());
  }

  /**
   * Handles assembly
   */
  handleAssemble() {
    this.renderEngine.assemble();
    this.stateManager.dispatch(Actions.assemble());
  }

  /**
   * Handles fullscreen toggle
   */
  handleFullscreen(container) {
    const state = this.stateManager.getState();

    if (!state.viewport.fullscreen) {
      container.classList.add("fullscreen");
    } else {
      container.classList.remove("fullscreen");
    }

    this.stateManager.dispatch(Actions.toggleFullscreen());

    // Trigger resize
    setTimeout(() => this.renderEngine.onWindowResize(), 100);
  }

  /**
   * Handles tree node toggle
   */
  handleTreeToggle(sectionId) {
    const state = this.stateManager.getState();
    const isExpanded = state.ui.expandedNodes.has(sectionId);

    if (isExpanded) {
      this.stateManager.dispatch(Actions.collapseNode(sectionId));
    } else {
      this.stateManager.dispatch(Actions.expandNode(sectionId));
    }
  }

  /**
   * Handles expand all nodes
   */
  handleExpandAll() {
    this.stateManager.dispatch(Actions.expandAllNodes());
  }

  /**
   * Handles viewport click for object picking
   */
  handleViewportClick(event) {
    const sectionId = this.renderEngine.raycast(event.clientX, event.clientY);

    if (sectionId) {
      this.handleSectionSelect(sectionId);
    } else {
      // Clear selection if clicking empty space
      this.stateManager.dispatch(Actions.clearSelection());
      this.clearSelectionRendering();
    }
  }

  /**
   * Updates selection rendering
   */
  updateSelectionRendering(selectedIds) {
    const state = this.stateManager.getState();

    // Clear previous highlights
    state.model?.getAllSections().forEach((section) => {
      this.renderEngine.highlightSection(section.id, false);
    });

    // Highlight selected
    selectedIds.forEach((id) => {
      this.renderEngine.highlightSection(id, true);
    });
  }

  /**
   * Clears selection rendering
   */
  clearSelectionRendering() {
    const state = this.stateManager.getState();
    state.model?.getAllSections().forEach((section) => {
      this.renderEngine.highlightSection(section.id, false);
    });
  }

  /**
   * Reads file as ArrayBuffer
   */
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generates unique ID
   */
  generateId() {
    return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
