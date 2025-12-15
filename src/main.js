/**
 * Main Application Entry Point
 *
 * Orchestrates all components and initializes the application.
 * Follows clean architecture with dependency injection.
 */

import { StateManager } from "./domain/state-manager.js";
import { RenderEngine } from "./rendering/render-engine.js";
import { LoaderFactory } from "./loaders/loader-factory.js";
import { EventBus } from "./events/event-bus.js";
import { EventHandlers } from "./events/event-handlers.js";
import { ModelTreeComponent } from "./ui/model-tree.js";
import { PropertiesPanelComponent } from "./ui/properties-panel.js";
import { ToolbarComponent } from "./ui/toolbar.js";

class Application {
  constructor() {
    // Core systems
    this.stateManager = null;
    this.renderEngine = null;
    this.loaderFactory = null;
    this.eventBus = null;
    this.eventHandlers = null;

    // UI Components
    this.modelTree = null;
    this.propertiesPanel = null;
    this.toolbar = null;

    // DOM elements
    this.elements = {};
  }

  /**
   * Initializes the application
   */
  async init() {
    try {
      console.log("Initializing Geometric Search Application...");

      // Get DOM elements
      this.collectDOMElements();

      // Initialize core systems
      this.initializeCoreSystems();

      // Initialize UI components
      this.initializeUIComponents();

      // Setup event listeners
      this.setupEventListeners();

      // Subscribe to state changes
      this.subscribeToState();

      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showError(
        "Failed to initialize application. Please refresh the page."
      );
    }
  }

  /**
   * Collects references to DOM elements
   */
  collectDOMElements() {
    this.elements = {
      // Containers
      viewport: document.getElementById("viewport"),
      modelTree: document.getElementById("modelTree"),
      propertiesView: document.getElementById("propertiesView"),
      loadingOverlay: document.getElementById("loadingOverlay"),
      viewportContainer: document.querySelector(".viewport-container"),

      // Toolbar buttons
      uploadBtn: document.getElementById("uploadBtn"),
      fullscreenBtn: document.getElementById("fullscreenBtn"),
      resetViewBtn: document.getElementById("resetViewBtn"),
      fitViewBtn: document.getElementById("fitViewBtn"),
      isolateBtn: document.getElementById("isolateBtn"),
      showAllBtn: document.getElementById("showAllBtn"),
      disassembleBtn: document.getElementById("disassembleBtn"),
      assembleBtn: document.getElementById("assembleBtn"),
      expandAllBtn: document.getElementById("expandAllBtn"),

      // Info
      viewportInfo: document.getElementById("viewportInfo"),

      // File input
      fileInput: document.getElementById("fileInput"),
    };

    // Validate required elements
    const required = ["viewport", "modelTree", "propertiesView"];
    for (const key of required) {
      if (!this.elements[key]) {
        throw new Error(`Required element not found: ${key}`);
      }
    }
  }

  /**
   * Initializes core systems
   */
  initializeCoreSystems() {
    // State management
    this.stateManager = new StateManager();

    // 3D rendering
    this.renderEngine = new RenderEngine(this.elements.viewport);

    // Format loaders
    this.loaderFactory = new LoaderFactory();

    // Event system
    this.eventBus = new EventBus();

    // Event handlers
    this.eventHandlers = new EventHandlers(
      this.stateManager,
      this.renderEngine,
      this.loaderFactory
    );
  }

  /**
   * Initializes UI components
   */
  initializeUIComponents() {
    this.modelTree = new ModelTreeComponent(
      this.elements.modelTree,
      this.eventBus
    );

    this.propertiesPanel = new PropertiesPanelComponent(
      this.elements.propertiesView,
      this.eventBus
    );

    this.toolbar = new ToolbarComponent(this.elements, this.eventBus);
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // File upload
    this.eventBus.on("toolbar:upload", () => {
      this.elements.fileInput.click();
    });

    this.elements.fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.handleFileUpload(file);
      }
      // Reset input
      e.target.value = "";
    });

    // Tree interactions
    this.eventBus.on("tree:select", async ({ sectionId }) => {
      this.eventHandlers.handleSectionSelect(sectionId);
    });

    this.eventBus.on("tree:hover", async ({ sectionId, hover }) => {
      this.eventHandlers.handleSectionHover(sectionId, hover);
    });

    this.eventBus.on("tree:toggle", async ({ sectionId }) => {
      this.eventHandlers.handleTreeToggle(sectionId);
    });

    // Toolbar actions
    this.eventBus.on("toolbar:resetView", async () => {
      this.eventHandlers.handleResetView();
    });

    this.eventBus.on("toolbar:fitView", async () => {
      this.eventHandlers.handleFitView();
    });

    this.eventBus.on("toolbar:isolate", async () => {
      this.eventHandlers.handleIsolate();
    });

    this.eventBus.on("toolbar:showAll", async () => {
      this.eventHandlers.handleShowAll();
    });

    this.eventBus.on("toolbar:disassemble", async () => {
      this.eventHandlers.handleDisassemble();
    });

    this.eventBus.on("toolbar:assemble", async () => {
      this.eventHandlers.handleAssemble();
    });

    this.eventBus.on("toolbar:expandAll", async () => {
      this.eventHandlers.handleExpandAll();
    });

    this.eventBus.on("toolbar:fullscreen", async () => {
      this.eventHandlers.handleFullscreen(this.elements.viewportContainer);
    });

    // Viewport click for picking
    this.elements.viewport.addEventListener("click", (e) => {
      this.eventHandlers.handleViewportClick(e);
    });

    // Drag and drop
    this.setupDragAndDrop();
  }

  /**
   * Sets up drag and drop functionality
   */
  setupDragAndDrop() {
    const viewport = this.elements.viewport;

    viewport.addEventListener("dragover", (e) => {
      e.preventDefault();
      viewport.style.opacity = "0.5";
    });

    viewport.addEventListener("dragleave", () => {
      viewport.style.opacity = "1";
    });

    viewport.addEventListener("drop", async (e) => {
      e.preventDefault();
      viewport.style.opacity = "1";

      const file = e.dataTransfer.files[0];
      if (file) {
        await this.handleFileUpload(file);
      }
    });
  }

  /**
   * Subscribes to state changes
   */
  subscribeToState() {
    // Model changes
    this.stateManager.subscribe("model", (state) => {
      this.onModelChanged(state);
    });

    // Selection changes
    this.stateManager.subscribe("selection", (state) => {
      this.onSelectionChanged(state);
    });

    // UI changes
    this.stateManager.subscribe("ui", (state) => {
      this.onUIChanged(state);
    });
  }

  /**
   * Handles model state changes
   */
  onModelChanged(state) {
    if (state.model) {
      // Update tree
      this.modelTree.render(
        state.model.sections,
        state.selection.selectedSections,
        state.selection.highlightedSections,
        state.ui.expandedNodes
      );

      // Update toolbar
      this.toolbar.updateButtonStates(state);
      this.toolbar.updateInfo(
        `${state.model.name} - ${state.model.getAllSections().length} parts`
      );
    } else {
      this.modelTree.render([], [], [], new Set());
      this.propertiesPanel.render(null);
    }
  }

  /**
   * Handles selection state changes
   */
  onSelectionChanged(state) {
    // Update tree selection
    if (state.selection.selectedSections.length > 0) {
      this.modelTree.updateSelection(state.selection.selectedSections);

      // Update properties panel
      const sectionId = state.selection.selectedSections[0];
      const section = state.model?.findSectionById(sectionId);
      this.propertiesPanel.render(section);
    } else {
      this.modelTree.updateSelection([]);
      this.propertiesPanel.render(null);
    }

    // Update highlight
    this.modelTree.updateHighlight(state.selection.highlightedSections);

    // Update toolbar
    this.toolbar.updateButtonStates(state);
  }

  /**
   * Handles UI state changes
   */
  onUIChanged(state) {
    // Loading state
    if (state.ui.loading) {
      this.elements.loadingOverlay?.classList.remove("hidden");
    } else {
      this.elements.loadingOverlay?.classList.add("hidden");
    }

    // Expanded nodes
    if (state.model) {
      this.modelTree.render(
        state.model.sections,
        state.selection.selectedSections,
        state.selection.highlightedSections,
        state.ui.expandedNodes
      );
    }

    // Toolbar states
    this.toolbar.updateButtonStates(state);
  }

  /**
   * Handles file upload
   */
  async handleFileUpload(file) {
    try {
      await this.eventHandlers.handleFileUpload(file);
      this.showSuccess(`Loaded: ${file.name}`);
    } catch (error) {
      this.showError(`Failed to load ${file.name}: ${error.message}`);
    }
  }

  /**
   * Shows success message
   */
  showSuccess(message) {
    console.log("✓", message);
    this.toolbar.updateInfo(message);
  }

  /**
   * Shows error message
   */
  showError(message) {
    console.error("✗", message);
    this.toolbar.updateInfo(message);
    alert(message);
  }

  /**
   * Cleanup
   */
  dispose() {
    this.renderEngine?.dispose();
    this.eventBus?.clear();
    this.stateManager = null;
  }
}

// Initialize application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = new Application();
    app.init();
    window.app = app; // For debugging
  });
} else {
  const app = new Application();
  app.init();
  window.app = app;
}

export default Application;
