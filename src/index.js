/**
 * Main Application Entry Point
 * Orchestrates all components and handles application lifecycle
 */

import { SceneRenderer } from "./renderer/SceneRenderer.js";
import { loaderFactory } from "./loaders/LoaderFactory.js";
import { stateManager } from "./state/StateManager.js";
import * as actions from "./state/actions.js";
import { EventType, on } from "./events/EventDispatcher.js";
import { SectionTree } from "./ui/SectionTree.js";
import { PropertiesPanel } from "./ui/PropertiesPanel.js";
import { InteractionManager } from "./utils/InteractionManager.js";
import { SearchEngine } from "./utils/SearchEngine.js";
import { findNodeById, getModelStats } from "./core/modelUtils.js";

class Application {
  constructor() {
    // Core components
    this.renderer = null;
    this.interactionManager = null;
    this.searchEngine = null;

    // UI components
    this.sectionTree = null;
    this.propertiesPanel = null;

    // DOM elements
    this.elements = {};

    // State
    this.currentModel = null;

    this.init();
  }

  /**
   * Initializes the application
   */
  init() {
    this.initDOMElements();
    this.initComponents();
    this.setupEventListeners();
    this.setupStateSubscription();
    this.updateUI();

    console.log("3D Geometric Search Application initialized");
  }

  /**
   * Initializes DOM element references
   */
  initDOMElements() {
    this.elements = {
      viewer: document.getElementById("viewer"),
      uploadBtn: document.getElementById("upload-btn"),
      fileInput: document.getElementById("file-input"),
      fullscreenBtn: document.getElementById("fullscreen-btn"),
      resetBtn: document.getElementById("reset-btn"),
      disassembleBtn: document.getElementById("disassemble-btn"),
      reassembleBtn: document.getElementById("reassemble-btn"),
      isolateBtn: document.getElementById("isolate-btn"),
      showAllBtn: document.getElementById("show-all-btn"),
      sectionTree: document.getElementById("section-tree"),
      propertiesPanel: document.getElementById("properties-panel"),
      loadingOverlay: document.getElementById("loading-overlay"),
      errorOverlay: document.getElementById("error-overlay"),
      errorMessage: document.getElementById("error-message"),
      dismissErrorBtn: document.getElementById("dismiss-error-btn"),
      statusText: document.getElementById("status-text"),
      statsText: document.getElementById("stats-text"),
    };
  }

  /**
   * Initializes core components
   */
  initComponents() {
    // Initialize renderer
    this.renderer = new SceneRenderer(this.elements.viewer);

    // Initialize interaction manager
    this.interactionManager = new InteractionManager(this.renderer);

    // Initialize search engine
    this.searchEngine = new SearchEngine();

    // Initialize UI components
    this.sectionTree = new SectionTree(this.elements.sectionTree);
    this.propertiesPanel = new PropertiesPanel(this.elements.propertiesPanel);
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Upload button
    this.elements.uploadBtn.addEventListener("click", () => {
      this.elements.fileInput.click();
    });

    // File input
    this.elements.fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        this.loadModelFile(file);
      }
    });

    // Drag and drop
    this.setupDragAndDrop();

    // Control buttons
    this.elements.fullscreenBtn.addEventListener("click", () =>
      this.toggleFullscreen()
    );
    this.elements.resetBtn.addEventListener("click", () => this.resetView());
    this.elements.disassembleBtn.addEventListener("click", () =>
      this.disassemble()
    );
    this.elements.reassembleBtn.addEventListener("click", () =>
      this.reassemble()
    );
    this.elements.isolateBtn.addEventListener("click", () =>
      this.isolateSelection()
    );
    this.elements.showAllBtn.addEventListener("click", () => this.showAll());

    // Error dismiss
    this.elements.dismissErrorBtn.addEventListener("click", () => {
      actions.clearError();
    });

    // Application events
    on(EventType.MODEL_LOAD_SUCCESS, (event) => this.onModelLoaded(event));
    on(EventType.SELECTION_CHANGE, (event) => this.onSelectionChange(event));
    on(EventType.FOCUS_NODE, (event) => this.onFocusNode(event));
    on(EventType.NODE_HIGHLIGHT, (event) => this.onNodeHighlight(event));
    on(EventType.NODE_UNHIGHLIGHT, (event) => this.onNodeUnhighlight(event));
    on(EventType.NODE_ISOLATE, (event) => this.onNodeIsolate(event));
    on(EventType.SHOW_ALL, (event) => this.onShowAll(event));
    on(EventType.DISASSEMBLE, (event) => this.onDisassemble(event));
    on(EventType.REASSEMBLE, (event) => this.onReassemble(event));
    on(EventType.CAMERA_RESET, (event) => this.onCameraReset(event));
    on(EventType.ERROR, (event) => this.onError(event));
  }

  /**
   * Sets up drag and drop for file upload
   */
  setupDragAndDrop() {
    const viewer = this.elements.viewer;

    viewer.addEventListener("dragover", (e) => {
      e.preventDefault();
      viewer.style.opacity = "0.5";
    });

    viewer.addEventListener("dragleave", (e) => {
      e.preventDefault();
      viewer.style.opacity = "1";
    });

    viewer.addEventListener("drop", (e) => {
      e.preventDefault();
      viewer.style.opacity = "1";

      const file = e.dataTransfer.files[0];
      if (file) {
        this.loadModelFile(file);
      }
    });
  }

  /**
   * Sets up state subscription
   */
  setupStateSubscription() {
    stateManager.subscribe((state) => {
      this.updateUI(state);
    });
  }

  /**
   * Loads a model file
   * @param {File} file - File to load
   */
  async loadModelFile(file) {
    try {
      // Validate file format
      if (!loaderFactory.isSupported(file.name)) {
        throw new Error(
          `Unsupported file format. Supported formats: ${loaderFactory
            .getSupportedExtensions()
            .join(", ")}`
        );
      }

      // Show loading state
      actions.setLoading(true);
      this.updateStatus("Loading model...");

      // Load model
      const model = await loaderFactory.loadModel(file);

      // Store model
      this.currentModel = model;

      // Load into renderer
      this.renderer.loadModel(model);

      // Index for search
      this.searchEngine.indexModel(model);

      // Update state
      actions.loadModel(model);

      // Update UI
      this.sectionTree.render(model);

      // Hide loading
      actions.setLoading(false);
      this.updateStatus("Model loaded successfully");

      // Clear file input
      this.elements.fileInput.value = "";
    } catch (error) {
      console.error("Error loading model:", error);
      actions.setError(error);
      actions.setLoading(false);
      this.updateStatus("Error loading model");
    }
  }

  /**
   * Toggles fullscreen mode
   */
  toggleFullscreen() {
    const state = stateManager.getState();

    if (!state.isFullscreen) {
      if (this.elements.viewer.requestFullscreen) {
        this.elements.viewer.requestFullscreen();
      }
      actions.enterFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      actions.exitFullscreen();
    }
  }

  /**
   * Resets the view
   */
  resetView() {
    this.renderer.resetCamera();
    if (this.currentModel) {
      this.interactionManager.reset(this.currentModel);
    }
    actions.clearSelection();
    actions.clearFocus();
    actions.clearHighlights();
    this.updateStatus("View reset");
  }

  /**
   * Disassembles the model
   */
  disassemble() {
    if (this.currentModel) {
      this.interactionManager.disassemble(this.currentModel);
      actions.disassemble();
      this.updateStatus("Model disassembled");
    }
  }

  /**
   * Reassembles the model
   */
  reassemble() {
    if (this.currentModel) {
      this.interactionManager.reassemble(this.currentModel);
      actions.reassemble();
      this.updateStatus("Model reassembled");
    }
  }

  /**
   * Isolates selected nodes
   */
  isolateSelection() {
    const state = stateManager.getState();
    if (state.selectedNodeIds.length > 0 && this.currentModel) {
      const nodeId = state.selectedNodeIds[0];
      actions.isolateNode(nodeId);
      this.updateStatus("Node isolated");
    }
  }

  /**
   * Shows all nodes
   */
  showAll() {
    if (this.currentModel) {
      actions.showAll();
      this.updateStatus("All nodes visible");
    }
  }

  /**
   * Handles model loaded event
   * @param {AppEvent} event - Event
   */
  onModelLoaded(event) {
    console.log("Model loaded:", event.payload.model.name);
  }

  /**
   * Handles selection change event
   * @param {AppEvent} event - Event
   */
  onSelectionChange(event) {
    const nodeIds = event.payload.nodeIds;

    // Highlight in tree
    this.sectionTree.highlightNodes(nodeIds);

    // Show properties
    if (this.currentModel && nodeIds.length > 0) {
      const nodes = nodeIds
        .map((id) => findNodeById(this.currentModel.root, id))
        .filter(Boolean);
      this.propertiesPanel.render(nodes);
    } else {
      this.propertiesPanel.clear();
    }
  }

  /**
   * Handles focus node event
   * @param {AppEvent} event - Event
   */
  onFocusNode(event) {
    const nodeId = event.payload.nodeId;

    if (this.currentModel) {
      const node = findNodeById(this.currentModel.root, nodeId);
      if (node) {
        this.renderer.focusOnNode(node);
        this.updateStatus(`Focused on: ${node.name}`);
      }
    }
  }

  /**
   * Handles node highlight event
   * @param {AppEvent} event - Event
   */
  onNodeHighlight(event) {
    const nodeId = event.payload.nodeId;

    if (this.currentModel) {
      const node = findNodeById(this.currentModel.root, nodeId);
      if (node) {
        this.renderer.highlightNode(node);
      }
    }
  }

  /**
   * Handles node unhighlight event
   * @param {AppEvent} event - Event
   */
  onNodeUnhighlight(event) {
    const nodeId = event.payload.nodeId;

    if (this.currentModel) {
      const node = findNodeById(this.currentModel.root, nodeId);
      if (node) {
        this.renderer.unhighlightNode(node);
      }
    }
  }

  /**
   * Handles node isolate event
   * @param {AppEvent} event - Event
   */
  onNodeIsolate(event) {
    const nodeId = event.payload.nodeId;

    if (this.currentModel) {
      this.interactionManager.isolateNode(this.currentModel, nodeId);
    }
  }

  /**
   * Handles show all event
   * @param {AppEvent} event - Event
   */
  onShowAll(event) {
    if (this.currentModel) {
      this.interactionManager.showAll(this.currentModel);
    }
  }

  /**
   * Handles disassemble event
   * @param {AppEvent} event - Event
   */
  onDisassemble(event) {
    // Already handled in disassemble() method
  }

  /**
   * Handles reassemble event
   * @param {AppEvent} event - Event
   */
  onReassemble(event) {
    // Already handled in reassemble() method
  }

  /**
   * Handles camera reset event
   * @param {AppEvent} event - Event
   */
  onCameraReset(event) {
    // Camera reset handled in renderer
  }

  /**
   * Handles error event
   * @param {AppEvent} event - Event
   */
  onError(event) {
    console.error("Application error:", event.payload);
  }

  /**
   * Updates the UI based on state
   * @param {Object} state - Application state
   */
  updateUI(state = null) {
    const currentState = state || stateManager.getState();

    // Update loading overlay
    if (currentState.isLoading) {
      this.elements.loadingOverlay.classList.remove("hidden");
    } else {
      this.elements.loadingOverlay.classList.add("hidden");
    }

    // Update error overlay
    if (currentState.error) {
      this.elements.errorMessage.textContent = currentState.error;
      this.elements.errorOverlay.classList.remove("hidden");
    } else {
      this.elements.errorOverlay.classList.add("hidden");
    }

    // Update button states
    const hasModel = currentState.model !== null;
    const hasSelection = currentState.selectedNodeIds.length > 0;
    const isDisassembled = currentState.isDisassembled;

    this.elements.disassembleBtn.disabled = !hasModel || isDisassembled;
    this.elements.reassembleBtn.disabled = !hasModel || !isDisassembled;
    this.elements.isolateBtn.disabled = !hasSelection;
    this.elements.showAllBtn.disabled = !hasModel;
    this.elements.resetBtn.disabled = !hasModel;

    // Update stats
    if (currentState.model) {
      const stats = getModelStats(currentState.model);
      this.elements.statsText.textContent = `Nodes: ${stats.totalNodes} | Meshes: ${stats.meshNodes} | Depth: ${stats.depth}`;
    } else {
      this.elements.statsText.textContent = "";
    }
  }

  /**
   * Updates status text
   * @param {string} message - Status message
   */
  updateStatus(message) {
    this.elements.statusText.textContent = message;
  }
}

// Initialize application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new Application();

  // Expose to window for debugging
  window.app = app;
});
