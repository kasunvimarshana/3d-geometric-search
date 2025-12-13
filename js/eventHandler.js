/**
 * Event Handler Module - Clean & Modular
 * Manages all event handling with clear separation of concerns
 */

export class EventHandler {
  constructor(app) {
    this.app = app;
    this.eventManager = app.eventManager;
  }

  /**
   * Setup all application event listeners
   */
  setupAll() {
    this.setupUploadEvents();
    this.setupViewerControlEvents();
    this.setupAdvancedControlEvents();
    this.setupLibraryEvents();
    this.setupKeyboardEvents();
    this.setupModalEvents();
  }

  /**
   * Setup upload-related events
   */
  setupUploadEvents() {
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");

    if (uploadBtn && fileInput) {
      this.eventManager.add(uploadBtn, "click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });

      this.eventManager.add(fileInput, "change", (e) => {
        if (e.target.files.length > 0) {
          this.app.handleFiles(e.target.files);
        }
      });
    }

    if (uploadArea) {
      this.eventManager.add(uploadArea, "dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("drag-over");
      });

      this.eventManager.add(uploadArea, "dragleave", () => {
        uploadArea.classList.remove("drag-over");
      });

      this.eventManager.add(uploadArea, "drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          this.app.handleFiles(e.dataTransfer.files);
        }
      });

      this.eventManager.add(uploadArea, "click", (e) => {
        if (
          e.target === uploadArea ||
          (e.target.closest(".upload-area") && !e.target.closest("#uploadBtn"))
        ) {
          fileInput.click();
        }
      });
    }
  }

  /**
   * Setup viewer control events
   */
  setupViewerControlEvents() {
    const controlHandlers = {
      resetViewBtn: () => this.handleResetView(),
      zoomInBtn: () => this.handleZoomIn(),
      zoomOutBtn: () => this.handleZoomOut(),
      fitViewBtn: () => this.handleFitView(),
      autoRotateBtn: (e) => this.handleAutoRotate(e),
      wireframeBtn: () => this.handleWireframe(),
      gridBtn: () => this.handleGrid(),
      axesBtn: () => this.handleAxes(),
      shadowsBtn: () => this.handleShadows(),
      screenshotBtn: () => this.handleScreenshot(),
      fullscreenBtn: () => this.handleFullscreen(),
      settingsBtn: () => this.handleSettings(),
      keyboardHelpBtn: () => this.handleKeyboardHelp(),
    };

    // Register control handlers
    Object.entries(controlHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        this.eventManager.add(element, "click", handler);
      }
    });

    // Camera preset views
    document.querySelectorAll(".btn-preset").forEach((btn) => {
      this.eventManager.add(btn, "click", (e) => {
        const view = e.target.getAttribute("data-view");
        if (view && this.app.viewer) {
          this.app.viewer.setCameraView(view);
          this.showToast(`${this.capitalize(view)} view`, "info", 1000);
        }
      });
    });

    // Update zoom indicator on camera movement
    if (this.app.viewer?.controls) {
      this.eventManager.add(this.app.viewer.controls, "change", () => {
        this.updateZoomIndicator();
      });
    }
  }

  /**
   * Setup advanced control events (sliders, color pickers)
   */
  setupAdvancedControlEvents() {
    const sliderHandlers = {
      ambientSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer?.setAmbientIntensity(value);
        const display = document.getElementById("ambientValue");
        if (display) display.textContent = value.toFixed(1);
      },
      directionalSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer?.setDirectionalIntensity(value);
        const display = document.getElementById("directionalValue");
        if (display) display.textContent = value.toFixed(1);
      },
      backgroundColorPicker: (e) => {
        this.app.viewer?.setBackgroundColor(e.target.value);
      },
      scaleSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer?.scaleModel(value);
        const display = document.getElementById("scaleValue");
        if (display) display.textContent = value.toFixed(1);
      },
      rotateSpeedSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer?.setAutoRotateSpeed(value);
        const display = document.getElementById("rotateSpeedValue");
        if (display) display.textContent = value.toFixed(1);
      },
    };

    Object.entries(sliderHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        this.eventManager.add(element, "input", handler);
      }
    });

    // Focus model button
    const focusBtn = document.getElementById("focusModelBtn");
    if (focusBtn) {
      this.eventManager.add(focusBtn, "click", () => {
        this.app.viewer?.focusOnModel();
        this.showToast("Focused on model", "info");
      });
    }
  }

  /**
   * Setup library events (export, clear, model selection)
   */
  setupLibraryEvents() {
    const libraryHandlers = {
      exportAllBtn: () => this.app.exportAllData(),
      generateReportBtn: () => this.app.generateReport(),
      clearLibraryBtn: () => this.app.clearLibrary(),
      exportSimilarityBtn: () => this.app.exportSimilarityResults(),
    };

    Object.entries(libraryHandlers).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element && handler) {
        this.eventManager.add(element, "click", handler);
      }
    });

    // Model card interactions - use event delegation
    const libraryGrid = document.getElementById("libraryGrid");
    if (libraryGrid) {
      this.eventManager.add(libraryGrid, "click", (e) => {
        const card = e.target.closest(".model-card");
        const deleteBtn = e.target.closest(".delete-btn");

        if (deleteBtn && card) {
          e.stopPropagation();
          const modelName = card.dataset.modelName;
          if (modelName) this.app.deleteModel(modelName);
        } else if (card) {
          const modelName = card.dataset.modelName;
          if (modelName) this.app.displayModel(modelName);
        }
      });
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardEvents() {
    this.eventManager.add(document, "keydown", (e) => {
      // Don't trigger if user is typing
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      const key = e.key.toLowerCase();

      switch (key) {
        case "f":
          this.handleFullscreen();
          break;
        case "r":
          if (e.shiftKey) {
            this.handleResetAll();
          } else {
            this.handleResetView();
          }
          break;
        case "0":
          this.handleFitView();
          break;
        case " ":
          e.preventDefault();
          document.getElementById("autoRotateBtn")?.click();
          break;
        case "g":
          this.handleGrid();
          break;
        case "a":
          this.handleAxes();
          break;
        case "w":
          this.handleWireframe();
          break;
        case "s":
          this.handleShadows();
          break;
        case "+":
        case "=":
          this.handleZoomIn();
          break;
        case "-":
          this.handleZoomOut();
          break;
      }
    });
  }

  /**
   * Setup modal events
   */
  setupModalEvents() {
    const keyboardModal = document.getElementById("keyboardModal");
    const closeModalBtn = document.getElementById("closeModalBtn");

    if (closeModalBtn) {
      this.eventManager.add(closeModalBtn, "click", () => {
        if (keyboardModal) {
          keyboardModal.classList.add("hidden");
          keyboardModal.style.display = "none";
        }
      });
    }

    if (keyboardModal) {
      this.eventManager.add(keyboardModal, "click", (e) => {
        if (e.target === keyboardModal) {
          keyboardModal.classList.add("hidden");
          keyboardModal.style.display = "none";
        }
      });
    }

    // Close modal on Escape
    this.eventManager.add(document, "keydown", (e) => {
      if (
        e.key === "Escape" &&
        keyboardModal &&
        !keyboardModal.classList.contains("hidden")
      ) {
        keyboardModal.classList.add("hidden");
        keyboardModal.style.display = "none";
      }
    });
  }

  // ===================================
  // Handler Methods
  // ===================================

  handleResetView() {
    this.app.viewer?.resetView();
    this.showToast("View reset", "info");
  }

  handleZoomIn() {
    this.app.viewer?.zoomIn();
    this.updateZoomIndicator();
  }

  handleZoomOut() {
    this.app.viewer?.zoomOut();
    this.updateZoomIndicator();
  }

  handleFitView() {
    this.app.viewer?.fitToView();
    this.updateZoomIndicator();
    this.showToast("Fitted to view", "info");
  }

  handleAutoRotate(e) {
    const isRotating = this.app.viewer?.toggleAutoRotate();
    e.target.classList.toggle("active", isRotating);
    this.showToast(
      isRotating ? "Auto-rotate enabled" : "Auto-rotate disabled",
      "info"
    );
  }

  handleWireframe() {
    this.app.viewer?.toggleWireframe();
    this.showToast("Wireframe toggled", "info");
  }

  handleGrid() {
    this.app.viewer?.toggleGrid();
    this.showToast("Grid toggled", "info");
  }

  handleAxes() {
    this.app.viewer?.toggleAxes();
    this.showToast("Axes toggled", "info");
  }

  handleShadows() {
    this.app.viewer?.toggleShadows();
    this.showToast("Shadows toggled", "info");
  }

  handleScreenshot() {
    this.app.takeScreenshot();
  }

  async handleFullscreen() {
    const isFullscreen = await this.app.viewer?.toggleFullscreen();
    const btn = document.getElementById("fullscreenBtn");
    if (btn) {
      btn.classList.toggle("fullscreen-active", isFullscreen);
    }
    this.showToast(
      isFullscreen ? "Fullscreen enabled" : "Fullscreen disabled",
      "info"
    );
  }

  handleSettings() {
    this.app.toggleAdvancedControls();
  }

  handleKeyboardHelp() {
    this.app.showKeyboardHelp();
  }

  handleResetAll() {
    if (confirm("Reset all settings to default?")) {
      this.app.viewer?.resetAll();
      this.showToast("All settings reset", "success");
    }
  }

  // ===================================
  // Utility Methods
  // ===================================

  updateZoomIndicator() {
    const zoomLevel = document.getElementById("zoomLevel");
    if (zoomLevel && this.app.viewer) {
      const level = this.app.viewer.getZoomLevel();
      zoomLevel.textContent = level;
    }
  }

  showToast(message, type = "info", duration = 2000) {
    if (this.app.showToast) {
      this.app.showToast(message, type, duration);
    }
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    this.eventManager?.clear();
  }
}
