/**
 * Main Application Controller
 * Clean, modular architecture following SOLID principles
 */

import * as THREE from "three";
import { Viewer3D } from "./viewer.js";
import { ModelLoader } from "./modelLoader.js";
import { GeometryAnalyzer } from "./geometryAnalyzer.js";
import { ExportManager } from "./exportManager.js";
import { EventHandler } from "./eventHandler.js";
import { showToast, validateFileType } from "./utils.js";
import Config from "./config.js";

// Get global utilities from non-module scripts
const EventHandlerManager = window.EventHandlerManager;

class App {
  constructor() {
    // Core components
    this.viewer = null;
    this.modelLoader = null;
    this.geometryAnalyzer = null;
    this.exportManager = null;
    this.eventHandler = null;
    
    // Application state
    this.modelLibrary = {};
    this.currentModelName = null;
    this.similarityResults = [];
    
    // Event management for proper cleanup
    this.eventManager = new EventHandlerManager();
    
    this.init();
  }

  init() {
    // Initialize core components
    this.viewer = new Viewer3D("viewer");
    this.modelLoader = new ModelLoader();
    this.geometryAnalyzer = new GeometryAnalyzer();
    this.exportManager = new ExportManager();
    this.eventHandler = new EventHandler(this);

    // Setup all event listeners
    this.eventHandler.setupAll();

    // Show welcome message
    this.showWelcomeMessage();
    this.updateEmptyState();
  }

  /**
   * Handle files uploaded by user
   */
  async handleFiles(files) {
    for (let file of files) {
      await this.loadFile(file);
    }
  }

  /**
   * Load and analyze a 3D model file
   */
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

      // Analyze geometry
      const features = this.geometryAnalyzer.analyzeGeometry(
        result.geometry,
        modelName
      );

      if (!features) {
        throw new Error("Failed to analyze model geometry");
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

      console.log("[App] Model loaded:", modelName);
    } catch (error) {
      console.error("Error loading model:", error);
      showToast(`Error: ${error.message}`, "error");
      this.showLoading(false);
    }
  }

  /**
   * Generate unique model name
   */
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

  /**
   * Display a model in the viewer
   */
  displayModel(modelName) {
    const model = this.modelLibrary[modelName];
    if (!model) {
      console.warn(`Model not found: ${modelName}`);
      return;
    }

    if (!this.viewer) {
      console.error("Viewer not initialized");
      showToast("Error: Viewer not initialized", "error");
      return;
    }

    this.currentModelName = modelName;

    // Clone the model and set metadata
    const modelClone = model.object.clone();
    modelClone.userData.modelName = modelName;

    // Load model in viewer
    this.viewer.loadModel(modelClone);

    // Update model info
    this.updateModelInfo(model.features);

    // Update active state in library
    this.updateLibrarySelection(modelName);

    console.log("[App] Displayed model:", modelName);
  }

  /**
   * Update model information display
   */
  updateModelInfo(features) {
    if (!features) return;

    const vertexCountEl = document.getElementById("vertexCount");
    const faceCountEl = document.getElementById("faceCount");
    const boundingBoxEl = document.getElementById("boundingBox");
    const volumeDisplayEl = document.getElementById("volumeDisplay");

    if (vertexCountEl && features.vertexCount !== undefined) {
      vertexCountEl.textContent = features.vertexCount.toLocaleString();
    }

    if (faceCountEl && features.faceCount !== undefined) {
      faceCountEl.textContent = Math.round(features.faceCount).toLocaleString();
    }

    if (boundingBoxEl && features.boundingBox) {
      const bbox = features.boundingBox;
      boundingBoxEl.textContent = `${bbox.x.toFixed(2)} × ${bbox.y.toFixed(
        2
      )} × ${bbox.z.toFixed(2)}`;
    }

    if (volumeDisplayEl && features.volume !== undefined) {
      volumeDisplayEl.textContent = features.volume.toFixed(4);
    }
  }

  /**
   * Update library grid with all models
   */
  updateLibraryGrid() {
    const grid = document.getElementById("libraryGrid");
    if (!grid) {
      console.warn("Library grid element not found");
      return;
    }

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

  /**
   * Update empty state visibility
   */
  updateEmptyState() {
    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
      const hasModels = Object.keys(this.modelLibrary).length > 0;
      emptyState.style.display = hasModels ? "none" : "block";
    }
  }

  /**
   * Create a model card element
   */
  createModelCard(name, model) {
    if (!name || !model) {
      return document.createElement("div");
    }

    const card = document.createElement("div");
    card.className = "model-card";
    card.dataset.modelName = name;
    if (name === this.currentModelName) {
      card.classList.add("active");
    }

    // Thumbnail
    const thumbnail = document.createElement("div");
    thumbnail.className = "model-thumbnail";
    if (model.thumbnail) {
      thumbnail.style.backgroundImage = `url(${model.thumbnail})`;
    }
    card.appendChild(thumbnail);

    // Title
    const title = document.createElement("h4");
    title.textContent = name;
    card.appendChild(title);

    // Info
    const info = document.createElement("div");
    info.className = "model-card-info";
    if (model.features && model.features.vertexCount !== undefined) {
      info.textContent = `${model.features.vertexCount.toLocaleString()} vertices`;
    } else {
      info.textContent = "No data";
    }
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

    // Click handler - display model
    card.onclick = () => {
      this.displayModel(name);
    };

    return card;
  }

  /**
   * Delete a model from library
   */
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
        const resultsSection = document.getElementById("resultsSection");
        if (resultsSection) {
          resultsSection.classList.add("hidden");
          resultsSection.style.display = "none";
        }
      }

      showToast(`Model "${name}" deleted`, "success");
    }
  }

  /**
   * Update the active state of model cards
   */
  updateLibrarySelection(selectedName) {
    const cards = document.querySelectorAll(".model-card");
    cards.forEach((card) => {
      const cardName = card.dataset.modelName;
      if (cardName === selectedName) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  }

  /**
   * Find similar models based on geometric features
   */
  findSimilarModels(targetModelName) {
    const targetModel = this.modelLibrary[targetModelName];
    if (!targetModel) return;

    // Get all features from library
    const libraryFeatures = {};
    for (const [name, model] of Object.entries(this.modelLibrary)) {
      libraryFeatures[name] = model.features;
    }

    // Find similar models
    const similar = this.geometryAnalyzer.findSimilar(
      targetModel.features,
      libraryFeatures,
      Config.geometryAnalysis.maxSimilarResults
    );

    this.similarityResults = similar;

    // Display results
    this.displaySearchResults(similar);
  }

  /**
   * Display search results
   */
  displaySearchResults(results) {
    const resultsSection = document.getElementById("resultsSection");
    const resultsGrid = document.getElementById("resultsGrid");

    if (results.length === 0) {
      resultsSection.classList.add("hidden");
      resultsSection.style.display = "none";
      return;
    }

    resultsSection.classList.remove("hidden");
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

  /**
   * Toggle advanced controls panel
   */
  toggleAdvancedControls() {
    const controls = document.getElementById("advanced-controls");
    if (!controls) return;

    const isHidden = controls.classList.contains("hidden");
    controls.style.display = isHidden ? "block" : "none";
    controls.classList.toggle("hidden");
  }

  /**
   * Take screenshot of current view
   */
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

  /**
   * Export all analysis data
   */
  exportAllData() {
    if (Object.keys(this.modelLibrary).length === 0) {
      showToast("No models to export", "warning");
      return;
    }

    try {
      this.exportManager.exportBatchAnalysis(this.modelLibrary);
      showToast("Analysis data exported!", "success");
    } catch (error) {
      showToast("Failed to export data", "error");
      console.error(error);
    }
  }

  /**
   * Generate HTML report
   */
  generateReport() {
    if (Object.keys(this.modelLibrary).length === 0) {
      showToast("No models to report", "warning");
      return;
    }

    try {
      this.exportManager.exportHTMLReport(this.modelLibrary);
      showToast("Report generated!", "success");
    } catch (error) {
      showToast("Failed to generate report", "error");
      console.error(error);
    }
  }

  /**
   * Clear all models from library
   */
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
      const resultsSection = document.getElementById("resultsSection");
      if (resultsSection) {
        resultsSection.classList.add("hidden");
        resultsSection.style.display = "none";
      }

      showToast("Library cleared", "success");
    }
  }

  /**
   * Export similarity results
   */
  exportSimilarityResults() {
    if (this.similarityResults.length === 0) {
      showToast("No similarity results to export", "warning");
      return;
    }

    try {
      this.exportManager.exportSimilarityResults(this.similarityResults);
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
      modal.classList.remove("hidden");
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
      modal.classList.add("hidden");
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  /**
   * Show/hide loading overlay
   */
  showLoading(show) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) {
      overlay.style.display = show ? "flex" : "none";
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type, duration) {
    showToast(message, type, duration);
  }

  /**
   * Get current model name
   */
  getCurrentModelName() {
    return this.currentModelName;
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    console.log("[App] 3D Geometric Search Application initialized");
    console.log("[App] Supported formats: glTF/GLB, OBJ/MTL, STL");
  }

  /**
   * Clean up all event listeners and resources
   */
  cleanup() {
    console.log("[App] Cleaning up application resources...");

    try {
      if (this.eventManager) {
        this.eventManager.clear();
      }

      if (this.viewer && typeof this.viewer.dispose === "function") {
        this.viewer.dispose();
      }

      this.modelLibrary = {};
      console.log("[App] Application cleanup complete");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
