/**
 * Main Application Controller
 * Enhanced with lazy-loading sections and on-demand rendering
 */

import * as THREE from "three";
import { Viewer3D } from "./viewer.js";
import { ModelLoader } from "./modelLoader.js";
import { GeometryAnalyzer } from "./geometryAnalyzer.js";
import { ExportManager } from "./exportManager.js";
import { showToast, formatFileSize, validateFileType } from "./utils.js";
import Config from "./config.js";

// Get global classes loaded as non-module scripts
const SectionManager = window.SectionManager;
const EventHandlerManager = window.EventHandlerManager;
const NavigationManager = window.NavigationManager;

class App {
  constructor() {
    this.viewer = null;
    this.modelLoader = null;
    this.geometryAnalyzer = null;
    this.exportManager = null;
    this.modelLibrary = {};
    this.currentModelName = null;
    this.similarityResults = [];

    // Lazy loading state
    this.sectionManager = new SectionManager();
    this.initializedSections = new Set();
    this.analysisCache = new Map();

    // Event handler management for proper cleanup
    this.eventManager = new EventHandlerManager();

    // Navigation manager
    this.navigationManager = null;

    // Model hierarchy panel
    this.hierarchyPanel = null;

    this.init();
  }

  init() {
    // Initialize core components only
    this.viewer = new Viewer3D("viewer");
    this.modelLoader = new ModelLoader();

    // Defer heavy components until needed
    this.geometryAnalyzer = null;
    this.exportManager = null;

    // Setup lazy-loading sections
    this.initializeLazySections();

    // Initialize navigation system
    this.initializeNavigation();

    // Initialize model hierarchy panel
    this.initializeHierarchyPanel();

    // Setup event listeners
    this.setupEventListeners();

    // Show welcome message
    this.showWelcomeMessage();

    // Update empty state
    this.updateEmptyState();
  }

  /**
   * Initialize lazy-loading section system
   */
  initializeLazySections() {
    // Register collapsible sections
    this.sectionManager.registerSection("advanced-controls", {
      trigger: "settingsBtn",
      onLoad: () => this.loadAdvancedControls(),
      persistent: true,
    });

    this.sectionManager.registerSection("library-section", {
      trigger: null, // Always visible but content loads on-demand
      onLoad: () => this.loadLibrarySection(),
      persistent: true,
    });

    this.sectionManager.registerSection("results-section", {
      trigger: null, // Shows when similarity search is triggered
      onLoad: () => this.loadResultsSection(),
      persistent: false,
    });
  }

  /**
   * Initialize navigation system
   */
  initializeNavigation() {
    try {
      // Get EventBus from global scope (loaded as non-module script)
      const eventBus = window.eventBus;

      if (!eventBus) {
        console.warn(
          "EventBus not available, navigation may have limited functionality"
        );
      }

      // Create NavigationManager instance
      this.navigationManager = new NavigationManager(
        this.eventManager,
        this.sectionManager,
        eventBus || { on: () => {}, emit: () => {} } // Fallback
      );

      // Initialize navigation
      const initialized = this.navigationManager.init();

      if (initialized) {
        console.log("Navigation system initialized successfully");
      } else {
        console.warn("Navigation system initialization had warnings");
      }
    } catch (error) {
      console.error("Failed to initialize navigation system:", error);
    }
  }

  /**
   * Initialize model hierarchy panel
   */
  initializeHierarchyPanel() {
    try {
      const eventBus = window.eventBus;
      const ModelHierarchyPanel = window.ModelHierarchyPanel;

      if (!ModelHierarchyPanel) {
        console.warn("ModelHierarchyPanel class not available");
        return;
      }

      // Create hierarchy panel instance
      this.hierarchyPanel = new ModelHierarchyPanel(
        this.viewer,
        this.eventManager,
        eventBus || { on: () => {}, emit: () => {} }
      );

      // Initialize panel
      const initialized = this.hierarchyPanel.init();

      if (initialized) {
        console.log("Model hierarchy panel initialized successfully");
      } else {
        console.warn("Model hierarchy panel initialization had warnings");
      }
    } catch (error) {
      console.error("Failed to initialize hierarchy panel:", error);
    }
  }

  /**
   * Load advanced controls section on-demand
   */
  loadAdvancedControls() {
    // Only initialize once
    if (this.initializedSections.has("advanced-controls")) {
      return;
    }

    console.log("[LazyLoad] Initializing advanced controls...");

    // Advanced controls are already in the DOM and interactive
    // SectionManager handles visibility (display property)
    // Just mark as initialized
    this.initializedSections.add("advanced-controls");
  }

  /**
   * Load library section on-demand
   */
  loadLibrarySection() {
    if (this.initializedSections.has("library-section")) return;

    console.log("[LazyLoad] Initializing library section...");

    // Library grid already exists, just mark as initialized
    this.initializedSections.add("library-section");
  }

  /**
   * Load results section on-demand
   */
  loadResultsSection() {
    if (this.initializedSections.has("results-section")) return;

    console.log("[LazyLoad] Initializing results section...");

    this.initializedSections.add("results-section");
  }

  /**
   * Lazy-load geometry analyzer when first needed
   */
  ensureGeometryAnalyzer() {
    if (!this.geometryAnalyzer) {
      console.log("[LazyLoad] Initializing GeometryAnalyzer...");
      this.geometryAnalyzer = new GeometryAnalyzer();
    }
    return this.geometryAnalyzer;
  }

  /**
   * Lazy-load export manager when first needed
   */
  ensureExportManager() {
    if (!this.exportManager) {
      console.log("[LazyLoad] Initializing ExportManager...");
      this.exportManager = new ExportManager();
    }
    return this.exportManager;
  }

  setupEventListeners() {
    // Setup all event handlers with proper tracking and error handling
    this._setupUploadHandlers();
    this._setupViewerControlHandlers();
    this._setupKeyboardHandlers();
    this._setupModelEventHandlers();
    this._setupAdvancedControlHandlers();
    this._setupLibraryHandlers();
    this._setupSectionToggleHandlers();
  }

  /**
   * Create a debounced handler with consistent error handling
   * @param {Function} func - Function to debounce
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} Debounced function
   * @private
   */
  _createDebounceHandler(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          func.apply(this, args);
        } catch (error) {
          console.error("[App] Error in debounced handler:", error);
        }
      }, delay);
    };
  }

  /**
   * Create a throttled handler with consistent error handling
   * @param {Function} func - Function to throttle
   * @param {number} delay - Throttle delay in ms
   * @returns {Function} Throttled function
   * @private
   */
  _createThrottleHandler(func, delay) {
    let throttleTimer = null;
    return function (...args) {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          try {
            func.apply(this, args);
          } catch (error) {
            console.error("[App] Error in throttled handler:", error);
          }
          throttleTimer = null;
        }, delay);
      }
    };
  }

  /**
   * Create a safe handler wrapper with error handling and logging
   * @param {Function} func - Function to wrap
   * @param {string} context - Context for error logging
   * @returns {Function} Wrapped function
   * @private
   */
  _createSafeHandler(func, context) {
    return (...args) => {
      try {
        return func.apply(this, args);
      } catch (error) {
        console.error(`[App] Error in ${context}:`, error);
        showToast(`Error: ${context}`, "error");
      }
    };
  }

  /**
   * Setup section toggle handlers
   * @private
   */
  _setupSectionToggleHandlers() {
    // Model info section toggle
    const modelInfoHeader = document.getElementById("modelInfo");
    if (modelInfoHeader) {
      const header = document.createElement("div");
      header.className = "section-toggle-header";
      header.innerHTML =
        '<span>📊 Model Information</span><span class="toggle-icon">▼</span>';
      modelInfoHeader.insertBefore(header, modelInfoHeader.firstChild);

      this.eventManager.add(header, "click", () => {
        try {
          modelInfoHeader.classList.toggle("collapsed");
          const icon = header.querySelector(".toggle-icon");
          if (icon) {
            icon.textContent = modelInfoHeader.classList.contains("collapsed")
              ? "▶"
              : "▼";
          }
        } catch (error) {
          console.error("[App] Error toggling model info:", error);
        }
      });
    }
  }

  /**
   * Setup upload-related event handlers
   * @private
   */
  _setupUploadHandlers() {
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");

    if (!uploadBtn || !fileInput || !uploadArea) {
      console.warn("[App] Some upload elements not found");
      return;
    }

    // Upload button - prevent bubbling to uploadArea
    this.eventManager.add(uploadBtn, "click", (e) => {
      try {
        e.stopPropagation();
        fileInput.click();
      } catch (error) {
        console.error("[App] Error in upload button handler:", error);
        showToast("Error opening file dialog", "error");
      }
    });

    // File input change
    this.eventManager.add(fileInput, "change", (e) => {
      try {
        if (e.target.files.length > 0) {
          this.handleFiles(e.target.files);
        }
      } catch (error) {
        console.error("[App] Error handling file input:", error);
        showToast("Error processing files", "error");
      }
    });

    // Drag and drop handlers
    this.eventManager.add(uploadArea, "dragover", (e) => {
      try {
        e.preventDefault();
        uploadArea.classList.add("drag-over");
      } catch (error) {
        console.error("[App] Error in dragover handler:", error);
      }
    });

    this.eventManager.add(uploadArea, "dragleave", () => {
      try {
        uploadArea.classList.remove("drag-over");
      } catch (error) {
        console.error("[App] Error in dragleave handler:", error);
      }
    });

    this.eventManager.add(uploadArea, "drop", (e) => {
      try {
        e.preventDefault();
        uploadArea.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          this.handleFiles(e.dataTransfer.files);
        }
      } catch (error) {
        console.error("[App] Error in drop handler:", error);
        showToast("Error processing dropped files", "error");
      }
    });

    // Click upload area (but not the button)
    this.eventManager.add(uploadArea, "click", (e) => {
      try {
        if (
          e.target === uploadArea ||
          (e.target.closest(".upload-area") && !e.target.closest("#uploadBtn"))
        ) {
          fileInput.click();
        }
      } catch (error) {
        console.error("[App] Error in upload area click handler:", error);
      }
    });
  }

  /**
   * Setup viewer control event handlers
   * @private
   */
  _setupViewerControlHandlers() {
    // View reset buttons
    const resetViewBtn = document.getElementById("resetViewBtn");
    if (resetViewBtn) {
      this.eventManager.add(resetViewBtn, "click", () => {
        try {
          this.viewer.resetView();
          this.updateZoomIndicator(); // Update zoom indicator after reset
          showToast("View reset", "info");
        } catch (error) {
          console.error("[App] Error resetting view:", error);
          showToast("Error resetting view", "error");
        }
      });
    }

    const resetAllBtn = document.getElementById("resetAllBtn");
    if (resetAllBtn) {
      this.eventManager.add(resetAllBtn, "click", () => {
        try {
          this.viewer.resetAll();
          this.updateAllButtonStates();
          this.updateScaleIndicator();
          showToast("All settings reset to default", "success");
        } catch (error) {
          console.error("[App] Error resetting all:", error);
          showToast("Error resetting settings", "error");
        }
      });
    }

    // Zoom controls
    const zoomInBtn = document.getElementById("zoomInBtn");
    if (zoomInBtn) {
      this.eventManager.add(zoomInBtn, "click", () => {
        try {
          this.viewer.zoomIn();
          this.updateZoomIndicator();
          showToast("Zoomed in", "info", 1000);
        } catch (error) {
          console.error("[App] Error zooming in:", error);
        }
      });
    }

    const zoomOutBtn = document.getElementById("zoomOutBtn");
    if (zoomOutBtn) {
      this.eventManager.add(zoomOutBtn, "click", () => {
        try {
          this.viewer.zoomOut();
          this.updateZoomIndicator();
          showToast("Zoomed out", "info", 1000);
        } catch (error) {
          console.error("[App] Error zooming out:", error);
        }
      });
    }

    const fitViewBtn = document.getElementById("fitViewBtn");
    if (fitViewBtn) {
      this.eventManager.add(fitViewBtn, "click", () => {
        try {
          this.viewer.fitToView();
          this.updateZoomIndicator();
          showToast("Fitted to view", "info");
        } catch (error) {
          console.error("[App] Error fitting view:", error);
        }
      });
    }

    // Visual toggle buttons
    const autoRotateBtn = document.getElementById("autoRotateBtn");
    if (autoRotateBtn) {
      this.eventManager.add(autoRotateBtn, "click", (e) => {
        try {
          const isRotating = this.viewer.toggleAutoRotate();
          e.target.classList.toggle("active", isRotating);
          showToast(
            isRotating ? "Auto-rotate enabled" : "Auto-rotate disabled",
            "info"
          );
        } catch (error) {
          console.error("[App] Error toggling auto-rotate:", error);
        }
      });
    }

    const wireframeBtn = document.getElementById("wireframeBtn");
    if (wireframeBtn) {
      this.eventManager.add(wireframeBtn, "click", () => {
        try {
          this.viewer.toggleWireframe();
          showToast("Wireframe toggled", "info");
        } catch (error) {
          console.error("[App] Error toggling wireframe:", error);
        }
      });
    }

    const gridBtn = document.getElementById("gridBtn");
    if (gridBtn) {
      this.eventManager.add(gridBtn, "click", () => {
        try {
          this.viewer.toggleGrid();
          showToast("Grid toggled", "info");
        } catch (error) {
          console.error("[App] Error toggling grid:", error);
        }
      });
    }

    const axesBtn = document.getElementById("axesBtn");
    if (axesBtn) {
      this.eventManager.add(axesBtn, "click", () => {
        try {
          this.viewer.toggleAxes();
          showToast("Axes toggled", "info");
        } catch (error) {
          console.error("[App] Error toggling axes:", error);
        }
      });
    }

    const shadowsBtn = document.getElementById("shadowsBtn");
    if (shadowsBtn) {
      this.eventManager.add(shadowsBtn, "click", () => {
        try {
          this.viewer.toggleShadows();
          showToast("Shadows toggled", "info");
        } catch (error) {
          console.error("[App] Error toggling shadows:", error);
        }
      });
    }

    const screenshotBtn = document.getElementById("screenshotBtn");
    if (screenshotBtn) {
      this.eventManager.add(screenshotBtn, "click", () => {
        try {
          this.takeScreenshot();
        } catch (error) {
          console.error("[App] Error taking screenshot:", error);
          showToast("Error taking screenshot", "error");
        }
      });
    }

    const fullscreenBtn = document.getElementById("fullscreenBtn");
    if (fullscreenBtn) {
      this.eventManager.add(fullscreenBtn, "click", async () => {
        try {
          const isFullscreen = await this.viewer.toggleFullscreen();
          fullscreenBtn.classList.toggle("fullscreen-active", isFullscreen);
          showToast(
            isFullscreen ? "Fullscreen enabled" : "Fullscreen disabled",
            "info"
          );
        } catch (error) {
          console.error("[App] Error toggling fullscreen:", error);
          showToast("Error toggling fullscreen", "error");
        }
      });
    }

    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
      this.eventManager.add(settingsBtn, "click", (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          this.sectionManager.toggleSection("advanced-controls");
        } catch (error) {
          console.error("[App] Error toggling settings:", error);
        }
      });
    }

    const keyboardHelpBtn = document.getElementById("keyboardHelpBtn");
    if (keyboardHelpBtn) {
      this.eventManager.add(keyboardHelpBtn, "click", () => {
        try {
          this.showKeyboardHelp();
        } catch (error) {
          console.error("[App] Error showing keyboard help:", error);
        }
      });
    }

    // Camera preset views
    document.querySelectorAll(".btn-preset").forEach((btn) => {
      this.eventManager.add(btn, "click", (e) => {
        try {
          const view = e.target.getAttribute("data-view");
          this.viewer.setCameraView(view);
          showToast(
            `${view.charAt(0).toUpperCase() + view.slice(1)} view`,
            "info",
            1000
          );
        } catch (error) {
          console.error("[App] Error setting camera view:", error);
        }
      });
    });

    // Update zoom indicator on camera movement (throttled for performance)
    if (this.viewer.controls) {
      this.eventManager.add(
        this.viewer.controls,
        "change",
        this._createThrottleHandler(() => {
          this.updateZoomIndicator();
        }, 100) // Throttle to 10fps max
      );
    }
  }

  /**
   * Setup keyboard event handlers
   * @private
   */
  _setupKeyboardHandlers() {
    // Keyboard shortcuts modal handlers
    const closeModalBtn = document.getElementById("closeModalBtn");
    if (closeModalBtn) {
      this.eventManager.add(closeModalBtn, "click", () => {
        try {
          this.hideKeyboardHelp();
        } catch (error) {
          console.error("[App] Error closing modal:", error);
        }
      });
    }

    const keyboardModal = document.getElementById("keyboardModal");
    if (keyboardModal) {
      this.eventManager.add(keyboardModal, "click", (e) => {
        try {
          if (e.target.id === "keyboardModal") {
            this.hideKeyboardHelp();
          }
        } catch (error) {
          console.error("[App] Error in modal click handler:", error);
        }
      });
    }

    // Global keyboard shortcuts
    this.eventManager.add(document, "keydown", (e) => {
      try {
        // Don't handle shortcuts if user is typing in an input
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          return;
        }

        // Close modal with Escape
        if (e.code === "Escape") {
          const modal = document.getElementById("keyboardModal");
          if (modal && modal.style.display !== "none") {
            this.hideKeyboardHelp();
            return;
          }
        }

        // Handle Reset All with Shift+R
        if (e.code === "KeyR" && e.shiftKey) {
          e.preventDefault();
          this.viewer.resetAll();
          this.updateAllButtonStates();
          this.updateScaleIndicator();
          showToast("All settings reset to default", "success");
          return;
        }

        // Handle viewer shortcuts
        this.viewer.handleKeyboard(e);

        // Update UI after keyboard actions
        if (
          ["Equal", "Minus", "Digit0", "NumpadAdd", "NumpadSubtract"].includes(
            e.code
          )
        ) {
          this.updateZoomIndicator();
        }

        // Update fullscreen button state
        if (e.code === "KeyF") {
          setTimeout(() => {
            try {
              const btn = document.getElementById("fullscreenBtn");
              if (btn) {
                btn.classList.toggle(
                  "fullscreen-active",
                  this.viewer.isFullscreen
                );
              }
            } catch (error) {
              console.error("[App] Error updating fullscreen button:", error);
            }
          }, 200);
        }

        // Update auto-rotate button state
        if (e.code === "Space") {
          const btn = document.getElementById("autoRotateBtn");
          if (btn) {
            btn.classList.toggle("active", this.viewer.autoRotate);
          }
        }
      } catch (error) {
        console.error("[App] Error in keyboard handler:", error);
      }
    });
  }

  /**
   * Setup model interaction event handlers
   * @private
   */
  _setupModelEventHandlers() {
    if (!this.viewer || !this.viewer.container) return;

    // Listen for view reset event (R key)
    this.eventManager.add(this.viewer.container, "viewReset", () => {
      try {
        this.updateZoomIndicator();
        console.log("[App] View reset complete");
      } catch (error) {
        console.error("[App] Error handling view reset:", error);
      }
    });

    // Listen for reset all event from viewer (Shift+R)
    this.eventManager.add(this.viewer.container, "resetAll", () => {
      try {
        this.updateAllButtonStates();
        this.updateZoomIndicator();
        this.updateScaleIndicator();
      } catch (error) {
        console.error("[App] Error updating button states:", error);
      }
    });

    // Listen for model interaction events
    this.eventManager.add(this.viewer.container, "modelClick", (event) => {
      try {
        console.log("Model clicked:", event.detail);
      } catch (error) {
        console.error("[App] Error in modelClick handler:", error);
      }
    });

    this.eventManager.add(this.viewer.container, "modelSelect", (event) => {
      try {
        const { objectName } = event.detail;
        this.showNotification(`Selected: ${objectName}`, "info");
        console.log("Model selected:", event.detail);
      } catch (error) {
        console.error("[App] Error in modelSelect handler:", error);
      }
    });

    this.eventManager.add(this.viewer.container, "modelDeselect", (event) => {
      try {
        console.log("Model deselected:", event.detail);
      } catch (error) {
        console.error("[App] Error in modelDeselect handler:", error);
      }
    });

    this.eventManager.add(this.viewer.container, "modelHover", (event) => {
      try {
        // Can be used for tooltip or info display
        // console.log("Model hover:", event.detail);
      } catch (error) {
        console.error("[App] Error in modelHover handler:", error);
      }
    });
  }

  /**
   * Setup advanced control sliders with debouncing
   * @private
   */
  _setupAdvancedControlHandlers() {
    // Use utility debounce method for consistency
    const debounce = this._createDebounceHandler.bind(this);

    // Ambient light slider
    const ambientSlider = document.getElementById("ambientSlider");
    const ambientValue = document.getElementById("ambientValue");
    if (ambientSlider && ambientValue) {
      this.eventManager.add(
        ambientSlider,
        "input",
        debounce((e) => {
          try {
            const value = parseFloat(e.target.value);
            this.viewer.setAmbientIntensity(value);
            ambientValue.textContent = value.toFixed(1);
          } catch (error) {
            console.error("[App] Error setting ambient intensity:", error);
          }
        }, 50)
      ); // Debounce 50ms for smooth slider movement
    }

    // Directional light slider
    const directionalSlider = document.getElementById("directionalSlider");
    const directionalValue = document.getElementById("directionalValue");
    if (directionalSlider && directionalValue) {
      this.eventManager.add(
        directionalSlider,
        "input",
        debounce((e) => {
          try {
            const value = parseFloat(e.target.value);
            this.viewer.setDirectionalIntensity(value);
            directionalValue.textContent = value.toFixed(1);
          } catch (error) {
            console.error("[App] Error setting directional intensity:", error);
          }
        }, 50)
      );
    }

    // Background color picker
    const backgroundColorPicker = document.getElementById(
      "backgroundColorPicker"
    );
    if (backgroundColorPicker) {
      this.eventManager.add(
        backgroundColorPicker,
        "input",
        debounce((e) => {
          try {
            const color = parseInt(e.target.value.replace("#", ""), 16);
            this.viewer.setBackgroundColor(color);
          } catch (error) {
            console.error("[App] Error setting background color:", error);
          }
        }, 100)
      );
    }

    // Model scale slider
    const scaleSlider = document.getElementById("scaleSlider");
    const scaleValue = document.getElementById("scaleValue");
    if (scaleSlider && scaleValue) {
      this.eventManager.add(
        scaleSlider,
        "input",
        debounce((e) => {
          try {
            const value = parseFloat(e.target.value);
            this.viewer.scaleModel(value);
            scaleValue.textContent = value.toFixed(1);
          } catch (error) {
            console.error("[App] Error scaling model:", error);
          }
        }, 50)
      );
    }

    // Auto-rotate speed slider
    const rotateSpeedSlider = document.getElementById("rotateSpeedSlider");
    const rotateSpeedValue = document.getElementById("rotateSpeedValue");
    if (rotateSpeedSlider && rotateSpeedValue) {
      this.eventManager.add(
        rotateSpeedSlider,
        "input",
        debounce((e) => {
          try {
            const value = parseFloat(e.target.value);
            this.viewer.setAutoRotateSpeed(value);
            rotateSpeedValue.textContent = value.toFixed(1);
          } catch (error) {
            console.error("[App] Error setting rotate speed:", error);
          }
        }, 50)
      );
    }

    // Focus model button
    const focusModelBtn = document.getElementById("focusModelBtn");
    if (focusModelBtn) {
      this.eventManager.add(focusModelBtn, "click", () => {
        try {
          this.viewer.focusOnModel();
          this.updateZoomIndicator();
          showToast("Focused on model", "info");
        } catch (error) {
          console.error("[App] Error focusing model:", error);
        }
      });
    }
  }

  /**
   * Setup library action handlers
   * @private
   */
  _setupLibraryHandlers() {
    const exportAllBtn = document.getElementById("exportAllBtn");
    if (exportAllBtn) {
      this.eventManager.add(exportAllBtn, "click", () => {
        try {
          this.exportAllData();
        } catch (error) {
          console.error("[App] Error exporting all data:", error);
          showToast("Error exporting data", "error");
        }
      });
    }

    const generateReportBtn = document.getElementById("generateReportBtn");
    if (generateReportBtn) {
      this.eventManager.add(generateReportBtn, "click", () => {
        try {
          this.generateReport();
        } catch (error) {
          console.error("[App] Error generating report:", error);
          showToast("Error generating report", "error");
        }
      });
    }

    const clearLibraryBtn = document.getElementById("clearLibraryBtn");
    if (clearLibraryBtn) {
      this.eventManager.add(clearLibraryBtn, "click", () => {
        try {
          this.clearLibrary();
        } catch (error) {
          console.error("[App] Error clearing library:", error);
          showToast("Error clearing library", "error");
        }
      });
    }

    const exportSimilarityBtn = document.getElementById("exportSimilarityBtn");
    if (exportSimilarityBtn) {
      this.eventManager.add(exportSimilarityBtn, "click", () => {
        try {
          this.exportSimilarityResults();
        } catch (error) {
          console.error("[App] Error exporting similarity results:", error);
          showToast("Error exporting results", "error");
        }
      });
    }
  }

  async handleFiles(files) {
    for (let file of files) {
      await this.loadFile(file);
    }
  }

  async loadFile(file) {
    this.showLoading(true);

    try {
      // Validate file
      if (!validateFileType(file, Config.modelLoader.supportedFormats)) {
        throw new Error("Unsupported file format");
      }

      showToast(`Loading ${file.name}...`, "info", 2000);

      // Load model
      const result = await this.modelLoader.loadModel(file);

      if (!result || !result.object || !result.geometry) {
        throw new Error("Failed to load model geometry");
      }

      // Generate unique name
      const modelName = this.generateModelName(file.name);

      // Check cache first
      let features = this.analysisCache.get(modelName);

      if (!features) {
        // Analyze geometry on-demand (lazy-load analyzer if needed)
        const analyzer = this.ensureGeometryAnalyzer();
        features = analyzer.analyzeGeometry(result.geometry, modelName);

        if (!features) {
          throw new Error("Failed to analyze model geometry");
        }

        // Cache the analysis result
        this.analysisCache.set(modelName, features);
        console.log(`[Cache] Stored analysis for ${modelName}`);
      } else {
        console.log(`[Cache] Retrieved analysis for ${modelName}`);
      }

      // Create thumbnail
      const thumbnail = this.modelLoader.createThumbnail(result.object);

      // Add to library
      this.modelLibrary[modelName] = {
        object: result.object,
        geometry: result.geometry,
        features: features,
        thumbnail: thumbnail,
        fileName: file.name,
        fileSize: file.size,
      };

      // Display model (auto-focuses via displayModel -> viewer.loadModel)
      this.displayModel(modelName);

      // Update library grid
      this.updateLibraryGrid();

      // Find similar models
      this.findSimilarModels(modelName);

      showToast(`${file.name} loaded successfully!`, "success");
      this.showLoading(false);

      console.log(`[App] Model ${modelName} loaded and focused`);
    } catch (error) {
      console.error("Error loading model:", error);
      showToast(`Error: ${error.message}`, "error");
      this.showLoading(false);
    }
  }

  generateModelName(fileName) {
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    let name = baseName;
    let counter = 1;

    while (this.modelLibrary[name]) {
      name = `${baseName}_${counter}`;
      counter++;
    }

    return name;
  }

  displayModel(modelName) {
    const model = this.modelLibrary[modelName];
    if (!model) {
      console.warn(`[App] Model not found: ${modelName}`);
      return;
    }

    try {
      this.currentModelName = modelName;

      // Load model in viewer (auto-focuses via viewer.loadModel)
      this.viewer.loadModel(model.object.clone());

      // Update model info
      this.updateModelInfo(model.features);

      // Update active state in library
      this.updateLibrarySelection(modelName);

      // Emit event for hierarchy panel to update
      if (window.eventBus) {
        window.eventBus.emit("model:loaded", {
          name: modelName,
          model: this.viewer.currentModel,
          features: model.features,
        });
      }

      console.log(`[App] Displayed model: ${modelName}`);
    } catch (error) {
      console.error(`[App] Error displaying model ${modelName}:`, error);
      showToast(`Error displaying model: ${error.message}`, "error");
    }
  }

  updateModelInfo(features) {
    document.getElementById("vertexCount").textContent =
      features.vertexCount.toLocaleString();
    document.getElementById("faceCount").textContent = Math.round(
      features.faceCount
    ).toLocaleString();

    const bbox = features.boundingBox;
    document.getElementById("boundingBox").textContent = `${bbox.x.toFixed(
      2
    )} × ${bbox.y.toFixed(2)} × ${bbox.z.toFixed(2)}`;

    document.getElementById("volumeDisplay").textContent =
      features.volume.toFixed(4);
  }

  updateLibraryGrid() {
    const grid = document.getElementById("libraryGrid");
    grid.innerHTML = "";

    if (Object.keys(this.modelLibrary).length === 0) {
      this.updateEmptyState();
      return;
    }

    for (const [name, model] of Object.entries(this.modelLibrary)) {
      const card = this.createModelCard(name, model);
      grid.appendChild(card);
    }
  }

  updateEmptyState() {
    const grid = document.getElementById("libraryGrid");
    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
      emptyState.style.display =
        Object.keys(this.modelLibrary).length === 0 ? "block" : "none";
    }
  }

  createModelCard(name, model) {
    const card = document.createElement("div");
    card.className = "model-card";
    if (name === this.currentModelName) {
      card.classList.add("active");
    }

    // Thumbnail
    const thumbnail = document.createElement("div");
    thumbnail.className = "model-thumbnail";
    thumbnail.style.backgroundImage = `url(${model.thumbnail})`;
    thumbnail.style.backgroundSize = "cover";
    thumbnail.style.backgroundPosition = "center";
    card.appendChild(thumbnail);

    // Title
    const title = document.createElement("h4");
    title.textContent = name;
    card.appendChild(title);

    // Info
    const info = document.createElement("div");
    info.style.fontSize = "0.8em";
    info.style.color = "#666";
    info.textContent = `${model.features.vertexCount.toLocaleString()} vertices`;
    card.appendChild(info);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.deleteModel(name);
    };
    card.appendChild(deleteBtn);

    // Click handler
    card.onclick = () => this.displayModel(name);

    return card;
  }

  deleteModel(name) {
    if (confirm(`Delete model "${name}"?`)) {
      delete this.modelLibrary[name];

      // If deleted model was current, show another
      if (this.currentModelName === name) {
        const remainingModels = Object.keys(this.modelLibrary);
        if (remainingModels.length > 0) {
          this.displayModel(remainingModels[0]);
        } else {
          this.currentModelName = null;
          // Clear viewer and info
          this.viewer.loadModel(new THREE.Object3D());
          document.getElementById("vertexCount").textContent = "-";
          document.getElementById("faceCount").textContent = "-";
          document.getElementById("boundingBox").textContent = "-";
          document.getElementById("volumeDisplay").textContent = "-";
        }
      }

      this.updateLibraryGrid();

      // Update search results
      if (this.currentModelName) {
        this.findSimilarModels(this.currentModelName);
      } else {
        document.getElementById("resultsSection").style.display = "none";
      }

      showToast(`Model "${name}" deleted`, "success");
    }
  }

  updateLibrarySelection(selectedName) {
    const cards = document.querySelectorAll(".model-card");
    cards.forEach((card) => {
      card.classList.remove("active");
    });

    // Find and activate the selected card
    const allCards = Array.from(cards);
    const selectedCard = allCards.find(
      (card) => card.querySelector("h4").textContent === selectedName
    );
    if (selectedCard) {
      selectedCard.classList.add("active");
    }
  }

  findSimilarModels(targetModelName) {
    const targetModel = this.modelLibrary[targetModelName];
    if (!targetModel) return;

    // Get all features from library
    const libraryFeatures = {};
    for (const [name, model] of Object.entries(this.modelLibrary)) {
      libraryFeatures[name] = model.features;
    }

    // Find similar models (lazy-load analyzer if needed)
    const analyzer = this.ensureGeometryAnalyzer();
    const similar = analyzer.findSimilar(
      targetModel.features,
      libraryFeatures,
      Config.geometryAnalysis.maxSimilarResults
    );

    this.similarityResults = similar;

    // Display results
    this.displaySearchResults(similar);
  }

  displaySearchResults(results) {
    const resultsSection = document.getElementById("resultsSection");
    const resultsGrid = document.getElementById("resultsGrid");

    if (results.length === 0) {
      resultsSection.style.display = "none";
      return;
    }

    resultsSection.style.display = "block";
    resultsGrid.innerHTML = "";

    for (const result of results) {
      const model = this.modelLibrary[result.name];
      if (!model) continue;

      const card = this.createModelCard(result.name, model);

      // Add similarity score
      const scoreTag = document.createElement("span");
      scoreTag.className = "similarity-score";
      scoreTag.textContent = `${result.similarity}% similar`;
      card.appendChild(scoreTag);

      resultsGrid.appendChild(card);
    }
  }

  // New methods for enhanced functionality

  /**
   * Update the zoom level indicator in the UI
   */
  updateZoomIndicator() {
    const zoomLevel = this.viewer.getZoomLevel();
    const indicator = document.getElementById("zoomLevel");
    if (indicator) {
      indicator.textContent = zoomLevel;
    }
  }

  /**
   * Update scale indicator and slider to reflect current model scale
   */
  updateScaleIndicator() {
    const scaleValue = document.getElementById("scaleValue");
    const scaleSlider = document.getElementById("scaleSlider");
    if (scaleValue && this.viewer.settings) {
      scaleValue.textContent = this.viewer.settings.modelScale.toFixed(1);
    }
    if (scaleSlider && this.viewer.settings) {
      scaleSlider.value = this.viewer.settings.modelScale;
    }
  }

  /**
   * Update all button states to reflect current viewer settings
   */
  updateAllButtonStates() {
    // Update auto-rotate button
    const autoRotateBtn = document.getElementById("autoRotateBtn");
    if (autoRotateBtn) {
      if (this.viewer.autoRotate) {
        autoRotateBtn.classList.add("active");
      } else {
        autoRotateBtn.classList.remove("active");
      }
    }

    // Update wireframe button
    const wireframeBtn = document.getElementById("wireframeBtn");
    if (wireframeBtn) {
      if (this.viewer.wireframeMode) {
        wireframeBtn.classList.add("active");
      } else {
        wireframeBtn.classList.remove("active");
      }
    }

    // Update grid button
    const gridBtn = document.getElementById("gridBtn");
    if (gridBtn) {
      if (this.viewer.settings.showGrid) {
        gridBtn.classList.add("active");
      } else {
        gridBtn.classList.remove("active");
      }
    }

    // Update axes button
    const axesBtn = document.getElementById("axesBtn");
    if (axesBtn) {
      if (this.viewer.settings.showAxes) {
        axesBtn.classList.add("active");
      } else {
        axesBtn.classList.remove("active");
      }
    }

    // Update shadows button
    const shadowsBtn = document.getElementById("shadowsBtn");
    if (shadowsBtn) {
      if (this.viewer.settings.enableShadows) {
        shadowsBtn.classList.add("active");
      } else {
        shadowsBtn.classList.remove("active");
      }
    }

    // Update fullscreen button
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    if (fullscreenBtn) {
      if (this.viewer.isFullscreen) {
        fullscreenBtn.classList.add("fullscreen-active");
      } else {
        fullscreenBtn.classList.remove("fullscreen-active");
      }
    }

    // Update zoom indicator
    this.updateZoomIndicator();
  }

  takeScreenshot() {
    try {
      const dataUrl = this.viewer.takeScreenshot();
      const link = document.createElement("a");
      link.download = `screenshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast("Screenshot saved!", "success");
    } catch (error) {
      showToast("Failed to take screenshot", "error");
      console.error(error);
    }
  }

  exportAllData() {
    if (Object.keys(this.modelLibrary).length === 0) {
      showToast("No models to export", "warning");
      return;
    }

    try {
      // Lazy-load export manager
      const exporter = this.ensureExportManager();
      exporter.exportBatchAnalysis(this.modelLibrary);
      showToast("Analysis data exported!", "success");
    } catch (error) {
      showToast("Failed to export data", "error");
      console.error(error);
    }
  }

  generateReport() {
    if (Object.keys(this.modelLibrary).length === 0) {
      showToast("No models to report", "warning");
      return;
    }

    try {
      // Lazy-load export manager
      const exporter = this.ensureExportManager();
      exporter.exportHTMLReport(this.modelLibrary);
      showToast("Report generated!", "success");
    } catch (error) {
      showToast("Failed to generate report", "error");
      console.error(error);
    }
  }

  clearLibrary() {
    if (Object.keys(this.modelLibrary).length === 0) {
      showToast("Library is already empty", "info");
      return;
    }

    if (
      confirm("Are you sure you want to clear all models from the library?")
    ) {
      this.modelLibrary = {};
      this.currentModelName = null;
      this.similarityResults = [];

      // Clear viewer
      this.viewer.loadModel(new THREE.Object3D());

      // Reset info display
      document.getElementById("vertexCount").textContent = "-";
      document.getElementById("faceCount").textContent = "-";
      document.getElementById("boundingBox").textContent = "-";
      document.getElementById("volumeDisplay").textContent = "-";

      // Update UI
      this.updateLibraryGrid();
      document.getElementById("resultsSection").style.display = "none";

      showToast("Library cleared", "success");
    }
  }

  exportSimilarityResults() {
    if (this.similarityResults.length === 0) {
      showToast("No similarity results to export", "warning");
      return;
    }

    try {
      // Lazy-load export manager
      const exporter = this.ensureExportManager();
      exporter.exportSimilarityResults(this.similarityResults);
      showToast("Similarity results exported!", "success");
    } catch (error) {
      showToast("Failed to export results", "error");
      console.error(error);
    }
  }

  /**
   * Show keyboard shortcuts modal
   */
  showKeyboardHelp() {
    const modal = document.getElementById("keyboardModal");
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  }

  /**
   * Hide keyboard shortcuts modal
   */
  hideKeyboardHelp() {
    const modal = document.getElementById("keyboardModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  }

  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    overlay.style.display = show ? "flex" : "none";
  }

  /**
   * Show notification message to user
   * @param {string} message - Message to display
   * @param {string} type - Notification type: 'info', 'success', 'warning', 'error'
   */
  showNotification(message, type = "info") {
    // Create notification element if it doesn't exist
    let notification = document.getElementById("notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.id = "notification";
      notification.className = "notification";
      document.body.appendChild(notification);
    }

    // Set message and type
    notification.textContent = message;
    notification.className = `notification notification-${type} notification-show`;

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove("notification-show");
    }, 3000);
  }

  showWelcomeMessage() {
    // Display welcome info in viewer
    console.log("3D Geometric Search Application initialized");
    console.log("Supported formats: glTF/GLB, OBJ/MTL, STL");
    console.log(
      "[LazyLoad] Sections will load on-demand for optimal performance"
    );

    // Log initial section status
    setTimeout(() => {
      const stats = this.sectionManager.getStats();
      console.log("[LazyLoad] Section Status:", stats);
    }, 100);
  }

  /**
   * Get performance stats for lazy-loading system
   */
  getPerformanceStats() {
    return {
      sections: this.sectionManager.getStats(),
      cache: {
        analysisCache: this.analysisCache.size,
        models: Object.keys(this.modelLibrary).length,
      },
      initialized: {
        geometryAnalyzer: this.geometryAnalyzer !== null,
        exportManager: this.exportManager !== null,
      },
    };
  }

  /**
   * Clean up all event listeners and resources
   * Call this when the app is being destroyed
   */
  cleanup() {
    console.log("[App] Cleaning up application resources...");

    try {
      // Clean up all event listeners
      if (this.eventManager) {
        this.eventManager.clear();
        console.log("[App] Event listeners cleaned up");
      }

      // Clean up section manager
      if (this.sectionManager) {
        this.sectionManager.cleanup();
        console.log("[App] Section manager cleaned up");
      }

      // Clean up viewer
      if (this.viewer) {
        if (typeof this.viewer.cleanup === "function") {
          this.viewer.cleanup();
        }
        console.log("[App] Viewer cleaned up");
      }

      // Clear caches
      if (this.analysisCache) {
        this.analysisCache.clear();
      }
      if (this.modelLibrary) {
        this.modelLibrary = {};
      }

      console.log("[App] Application cleanup complete");
    } catch (error) {
      console.error("[App] Error during cleanup:", error);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();

  // Expose performance stats to console
  window.getPerformanceStats = () => {
    const stats = window.app.getPerformanceStats();
    console.table(stats.sections.sections);
    console.log("Cache:", stats.cache);
    console.log("Initialized:", stats.initialized);
    return stats;
  };

  console.log(
    "💡 Tip: Run getPerformanceStats() in console to see lazy-loading stats"
  );
});
