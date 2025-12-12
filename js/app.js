/**
 * Main Application Controller
 * Enhanced with lazy-loading sections and on-demand rendering
 */

import * as THREE from "three";
import { Viewer3D } from "./viewer.js";
import { ModelLoader } from "./modelLoader.js";
import { GeometryAnalyzer } from "./geometryAnalyzer.js";
import { ExportManager } from "./exportManager.js";
import { SectionManager } from "./sectionManager.js";
import { showToast, formatFileSize, validateFileType } from "./utils.js";
import Config from "./config.js";

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
      persistent: false,
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

    // Setup section toggle handlers
    this.setupSectionToggles();
  }

  /**
   * Setup section toggle event handlers
   */
  setupSectionToggles() {
    // Settings button toggles advanced controls
    document.getElementById("settingsBtn")?.addEventListener("click", () => {
      this.sectionManager.toggleSection("advanced-controls");
    });

    // Model info can be collapsed/expanded
    const modelInfoHeader = document.getElementById("modelInfo");
    if (modelInfoHeader) {
      const header = document.createElement("div");
      header.className = "section-toggle-header";
      header.innerHTML =
        '<span>📊 Model Information</span><span class="toggle-icon">▼</span>';
      modelInfoHeader.insertBefore(header, modelInfoHeader.firstChild);

      header.addEventListener("click", () => {
        modelInfoHeader.classList.toggle("collapsed");
        header.querySelector(".toggle-icon").textContent =
          modelInfoHeader.classList.contains("collapsed") ? "▶" : "▼";
      });
    }
  }

  /**
   * Load advanced controls section on-demand
   */
  loadAdvancedControls() {
    if (this.initializedSections.has("advanced-controls")) return;

    console.log("[LazyLoad] Initializing advanced controls...");

    // Advanced controls are already in the DOM, just make them interactive
    const advancedControls = document.getElementById("advancedControls");
    if (advancedControls) {
      advancedControls.style.display = "block";
    }

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
    // Upload button
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadArea = document.getElementById("uploadArea");

    uploadBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event from bubbling to uploadArea
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.handleFiles(e.target.files);
      }
    });

    // Drag and drop
    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadArea.classList.add("drag-over");
    });

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("drag-over");
    });

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadArea.classList.remove("drag-over");
      if (e.dataTransfer.files.length > 0) {
        this.handleFiles(e.dataTransfer.files);
      }
    });

    // Click upload area (but not the button)
    uploadArea.addEventListener("click", (e) => {
      // Only trigger if clicking the area itself, not the button
      if (
        e.target === uploadArea ||
        (e.target.closest(".upload-area") && !e.target.closest("#uploadBtn"))
      ) {
        fileInput.click();
      }
    });

    // Viewer controls
    document.getElementById("resetViewBtn").addEventListener("click", () => {
      this.viewer.resetView();
      showToast("View reset", "info");
    });

    document.getElementById("resetAllBtn").addEventListener("click", () => {
      this.viewer.resetAll();
      this.updateAllButtonStates();
      showToast("All settings reset to default", "success");
    });

    // Zoom controls
    document.getElementById("zoomInBtn").addEventListener("click", () => {
      this.viewer.zoomIn();
      this.updateZoomIndicator();
      showToast("Zoomed in", "info", 1000);
    });

    document.getElementById("zoomOutBtn").addEventListener("click", () => {
      this.viewer.zoomOut();
      this.updateZoomIndicator();
      showToast("Zoomed out", "info", 1000);
    });

    document.getElementById("fitViewBtn").addEventListener("click", () => {
      this.viewer.fitToView();
      this.updateZoomIndicator();
      showToast("Fitted to view", "info");
    });

    // Auto-rotate
    document.getElementById("autoRotateBtn").addEventListener("click", (e) => {
      const isRotating = this.viewer.toggleAutoRotate();
      e.target.classList.toggle("active", isRotating);
      showToast(
        isRotating ? "Auto-rotate enabled" : "Auto-rotate disabled",
        "info"
      );
    });

    document.getElementById("wireframeBtn").addEventListener("click", () => {
      this.viewer.toggleWireframe();
      showToast("Wireframe toggled", "info");
    });

    document.getElementById("gridBtn").addEventListener("click", () => {
      this.viewer.toggleGrid();
      showToast("Grid toggled", "info");
    });

    document.getElementById("axesBtn").addEventListener("click", () => {
      this.viewer.toggleAxes();
      showToast("Axes toggled", "info");
    });

    document.getElementById("shadowsBtn").addEventListener("click", () => {
      this.viewer.toggleShadows();
      showToast("Shadows toggled", "info");
    });

    document.getElementById("screenshotBtn").addEventListener("click", () => {
      this.takeScreenshot();
    });

    document
      .getElementById("fullscreenBtn")
      .addEventListener("click", async () => {
        const isFullscreen = await this.viewer.toggleFullscreen();
        const btn = document.getElementById("fullscreenBtn");
        btn.classList.toggle("fullscreen-active", isFullscreen);
        showToast(
          isFullscreen ? "Fullscreen enabled" : "Fullscreen disabled",
          "info"
        );
      });

    document.getElementById("settingsBtn").addEventListener("click", () => {
      this.toggleAdvancedControls();
    });

    document.getElementById("keyboardHelpBtn").addEventListener("click", () => {
      this.showKeyboardHelp();
    });

    // Keyboard shortcuts modal
    document.getElementById("closeModalBtn")?.addEventListener("click", () => {
      this.hideKeyboardHelp();
    });

    // Close modal on outside click
    document.getElementById("keyboardModal")?.addEventListener("click", (e) => {
      if (e.target.id === "keyboardModal") {
        this.hideKeyboardHelp();
      }
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
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
          const btn = document.getElementById("fullscreenBtn");
          btn.classList.toggle("fullscreen-active", this.viewer.isFullscreen);
        }, 200);
      }

      // Update auto-rotate button state
      if (e.code === "Space") {
        const btn = document.getElementById("autoRotateBtn");
        btn.classList.toggle("active", this.viewer.autoRotate);
      }
    });

    // Listen for reset all event from viewer
    this.viewer.container.addEventListener("resetAll", () => {
      this.updateAllButtonStates();
    });

    // Listen for model interaction events
    this.viewer.container.addEventListener("modelClick", (event) => {
      console.log("Model clicked:", event.detail);
    });

    this.viewer.container.addEventListener("modelSelect", (event) => {
      const { objectName, modelName } = event.detail;
      this.showNotification(`Selected: ${objectName}`, "info");
      console.log("Model selected:", event.detail);
    });

    this.viewer.container.addEventListener("modelDeselect", (event) => {
      console.log("Model deselected:", event.detail);
    });

    this.viewer.container.addEventListener("modelHover", (event) => {
      // Can be used for tooltip or info display
      // console.log("Model hover:", event.detail);
    });

    // Advanced controls
    document.getElementById("ambientSlider")?.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      this.viewer.setAmbientIntensity(value);
      document.getElementById("ambientValue").textContent = value.toFixed(1);
    });

    document
      .getElementById("directionalSlider")
      ?.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        this.viewer.setDirectionalIntensity(value);
        document.getElementById("directionalValue").textContent =
          value.toFixed(1);
      });

    document
      .getElementById("backgroundColorPicker")
      ?.addEventListener("input", (e) => {
        const color = parseInt(e.target.value.replace("#", ""), 16);
        this.viewer.setBackgroundColor(color);
      });

    // Model controls
    document.getElementById("scaleSlider")?.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      this.viewer.scaleModel(value);
      document.getElementById("scaleValue").textContent = value.toFixed(1);
    });

    document
      .getElementById("rotateSpeedSlider")
      ?.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        this.viewer.setAutoRotateSpeed(value);
        document.getElementById("rotateSpeedValue").textContent =
          value.toFixed(1);
      });

    document.getElementById("focusModelBtn")?.addEventListener("click", () => {
      this.viewer.focusOnModel();
      this.updateZoomIndicator();
      showToast("Focused on model", "info");
    });

    // Camera preset views
    document.querySelectorAll(".btn-preset").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const view = e.target.getAttribute("data-view");
        this.viewer.setCameraView(view);
        showToast(
          `${view.charAt(0).toUpperCase() + view.slice(1)} view`,
          "info",
          1000
        );
      });
    });

    // Update zoom indicator on camera movement
    if (this.viewer.controls) {
      this.viewer.controls.addEventListener("change", () => {
        this.updateZoomIndicator();
      });
    }

    // Library actions
    document.getElementById("exportAllBtn")?.addEventListener("click", () => {
      this.exportAllData();
    });

    document
      .getElementById("generateReportBtn")
      ?.addEventListener("click", () => {
        this.generateReport();
      });

    document
      .getElementById("clearLibraryBtn")
      ?.addEventListener("click", () => {
        this.clearLibrary();
      });

    // Export similarity results
    document
      .getElementById("exportSimilarityBtn")
      ?.addEventListener("click", () => {
        this.exportSimilarityResults();
      });
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

      // Display model
      this.displayModel(modelName);

      // Update library grid
      this.updateLibraryGrid();

      // Find similar models
      this.findSimilarModels(modelName);

      showToast(`${file.name} loaded successfully!`, "success");
      this.showLoading(false);
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
    if (!model) return;

    this.currentModelName = modelName;

    // Load model in viewer
    this.viewer.loadModel(model.object.clone());

    // Update model info
    this.updateModelInfo(model.features);

    // Update active state in library
    this.updateLibrarySelection(modelName);
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

  toggleAdvancedControls() {
    const controls = document.getElementById("advancedControls");
    const isVisible = controls.style.display !== "none";
    controls.style.display = isVisible ? "none" : "block";
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
