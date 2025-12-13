/**
 * Event Handler Module
 * Manages all event handling logic in a modular, maintainable way
 */

export class EventHandler {
  constructor(app) {
    this.app = app;
    this.eventListeners = new Map();
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
    this.setupViewerInteractionEvents();
  }

  /**
   * Register an event listener and store for cleanup
   */
  registerEvent(element, event, handler, options = {}) {
    const wrappedHandler = options.debounce
      ? this.debounce(handler, options.debounce)
      : handler;

    element.addEventListener(event, wrappedHandler);

    // Store for cleanup
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler: wrappedHandler });

    return wrappedHandler;
  }

  /**
   * Setup upload-related events
   */
  setupUploadEvents() {
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");

    this.registerEvent(uploadBtn, "click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    this.registerEvent(fileInput, "change", (e) => {
      if (e.target.files.length > 0) {
        this.app.handleFiles(e.target.files);
      }
    });

    this.registerEvent(uploadArea, "dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("drag-over");
    });

    this.registerEvent(uploadArea, "dragleave", () => {
      uploadArea.classList.remove("drag-over");
    });

    this.registerEvent(uploadArea, "drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("drag-over");
      if (e.dataTransfer.files.length > 0) {
        this.app.handleFiles(e.dataTransfer.files);
      }
    });

    this.registerEvent(uploadArea, "click", (e) => {
      if (
        e.target === uploadArea ||
        (e.target.closest(".upload-area") && !e.target.closest("#uploadBtn"))
      ) {
        fileInput.click();
      }
    });
  }

  /**
   * Setup viewer control events
   */
  setupViewerControlEvents() {
    const controls = {
      resetViewBtn: () => {
        this.app.viewer.resetView();
        this.app.showToast("View reset", "info");
      },
      zoomInBtn: () => {
        this.app.viewer.zoomIn();
        this.app.updateZoomIndicator();
      },
      zoomOutBtn: () => {
        this.app.viewer.zoomOut();
        this.app.updateZoomIndicator();
      },
      fitViewBtn: () => {
        this.app.viewer.fitToView();
        this.app.updateZoomIndicator();
        this.app.showToast("Fitted to view", "info");
      },
      autoRotateBtn: (e) => {
        const isRotating = this.app.viewer.toggleAutoRotate();
        e.target.classList.toggle("active", isRotating);
        this.app.showToast(
          isRotating ? "Auto-rotate enabled" : "Auto-rotate disabled",
          "info"
        );
      },
      wireframeBtn: () => {
        this.app.viewer.toggleWireframe();
        this.app.showToast("Wireframe toggled", "info");
      },
      gridBtn: () => {
        this.app.viewer.toggleGrid();
        this.app.showToast("Grid toggled", "info");
      },
      axesBtn: () => {
        this.app.viewer.toggleAxes();
        this.app.showToast("Axes toggled", "info");
      },
      shadowsBtn: () => {
        this.app.viewer.toggleShadows();
        this.app.showToast("Shadows toggled", "info");
      },
      screenshotBtn: () => {
        this.app.takeScreenshot();
      },
      fullscreenBtn: async () => {
        const isFullscreen = await this.app.viewer.toggleFullscreen();
        const btn = document.getElementById("fullscreenBtn");
        btn.classList.toggle("fullscreen-active", isFullscreen);
        this.app.showToast(
          isFullscreen ? "Fullscreen enabled" : "Fullscreen disabled",
          "info"
        );
      },
      settingsBtn: () => {
        this.app.toggleAdvancedControls();
      },
      keyboardHelpBtn: () => {
        this.app.showKeyboardHelp();
      },
    };

    Object.entries(controls).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        this.registerEvent(element, "click", handler);
      }
    });

    // Camera preset views
    document.querySelectorAll(".btn-preset").forEach((btn) => {
      this.registerEvent(btn, "click", (e) => {
        const view = e.target.getAttribute("data-view");
        this.app.viewer.setCameraView(view);
        this.app.showToast(
          `${view.charAt(0).toUpperCase() + view.slice(1)} view`,
          "info",
          1000
        );
      });
    });

    // Update zoom indicator on camera movement
    if (this.app.viewer.controls) {
      this.registerEvent(this.app.viewer.controls, "change", () => {
        this.app.updateZoomIndicator();
      });
    }
  }

  /**
   * Setup advanced control events
   */
  setupAdvancedControlEvents() {
    const sliders = {
      ambientSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer.setAmbientIntensity(value);
        document.getElementById("ambientValue").textContent = value.toFixed(1);
      },
      directionalSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer.setDirectionalIntensity(value);
        document.getElementById("directionalValue").textContent =
          value.toFixed(1);
      },
      backgroundColorPicker: (e) => {
        const color = parseInt(e.target.value.replace("#", ""), 16);
        this.app.viewer.setBackgroundColor(color);
      },
      scaleSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer.scaleModel(value);
        document.getElementById("scaleValue").textContent = value.toFixed(1);
      },
      rotateSpeedSlider: (e) => {
        const value = parseFloat(e.target.value);
        this.app.viewer.setAutoRotateSpeed(value);
        document.getElementById("rotateSpeedValue").textContent =
          value.toFixed(1);
      },
    };

    Object.entries(sliders).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        this.registerEvent(element, "input", handler);
      }
    });

    const focusBtn = document.getElementById("focusModelBtn");
    if (focusBtn) {
      this.registerEvent(focusBtn, "click", () => {
        this.app.viewer.focusOnModel();
        this.app.updateZoomIndicator();
        this.app.showToast("Focused on model", "info");
      });
    }
  }

  /**
   * Setup library-related events
   */
  setupLibraryEvents() {
    const libraryControls = {
      exportAllBtn: () => this.app.exportAllData(),
      generateReportBtn: () => this.app.generateReport(),
      clearLibraryBtn: () => this.app.clearLibrary(),
      exportSimilarityBtn: () => this.app.exportSimilarityResults(),
    };

    Object.entries(libraryControls).forEach(([id, handler]) => {
      const element = document.getElementById(id);
      if (element) {
        this.registerEvent(element, "click", handler);
      }
    });
  }

  /**
   * Setup keyboard events
   */
  setupKeyboardEvents() {
    this.registerEvent(document, "keydown", (e) => {
      // Don't handle shortcuts if user is typing
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return;
      }

      // Close modal with Escape
      if (e.code === "Escape") {
        const modal = document.getElementById("keyboardModal");
        if (modal && modal.style.display !== "none") {
          this.app.hideKeyboardHelp();
          return;
        }
      }

      // Handle viewer shortcuts
      this.app.viewer.handleKeyboard(e);

      // Update UI after keyboard actions
      if (
        ["Equal", "Minus", "Digit0", "NumpadAdd", "NumpadSubtract"].includes(
          e.code
        )
      ) {
        this.app.updateZoomIndicator();
      }

      // Update fullscreen button state
      if (e.code === "KeyF") {
        setTimeout(() => {
          const btn = document.getElementById("fullscreenBtn");
          btn.classList.toggle(
            "fullscreen-active",
            this.app.viewer.isFullscreen
          );
        }, 200);
      }

      // Update auto-rotate button state
      if (e.code === "Space") {
        const btn = document.getElementById("autoRotateBtn");
        btn.classList.toggle("active", this.app.viewer.autoRotate);
      }
    });
  }

  /**
   * Setup modal-related events
   */
  setupModalEvents() {
    const closeBtn = document.getElementById("closeModalBtn");
    if (closeBtn) {
      this.registerEvent(closeBtn, "click", () => {
        this.app.hideKeyboardHelp();
      });
    }

    const modal = document.getElementById("keyboardModal");
    if (modal) {
      this.registerEvent(modal, "click", (e) => {
        if (e.target.id === "keyboardModal") {
          this.app.hideKeyboardHelp();
        }
      });
    }
  }

  /**
   * Setup viewer interaction events for model highlighting
   */
  setupViewerInteractionEvents() {
    const viewerElement = document.getElementById("viewer");
    if (viewerElement) {
      this.registerEvent(viewerElement, "modelSectionClick", (e) => {
        const { modelName, object, point } = e.detail;
        console.log("Model section clicked:", modelName, object.name);

        // Highlight the corresponding model card
        if (modelName) {
          this.app.highlightModelCard(modelName, true);
          const highlightDuration = 1500; // ms
          setTimeout(() => {
            this.app.clearHighlight();
            this.app.updateLibrarySelection(this.app.currentModelName);
          }, highlightDuration);
        }
      });
    }
  }

  /**
   * Debounce utility function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Cleanup all event listeners
   */
  cleanup() {
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }
}
