/**
 * Main Application Controller
 * Enhanced with export functionality and advanced controls
 */

import * as THREE from "three";
import { Viewer3D } from "./viewer.js";
import { ModelLoader } from "./modelLoader.js";
import { GeometryAnalyzer } from "./geometryAnalyzer.js";
import { ExportManager } from "./exportManager.js";
import { EventHandler } from "./eventHandler.js";
import { showToast, formatFileSize, validateFileType } from "./utils.js";
import Config from "./config.js";

class App {
  constructor() {
    this.viewer = null;
    this.modelLoader = null;
    this.geometryAnalyzer = null;
    this.exportManager = null;
    this.eventHandler = null;
    this.modelLibrary = {};
    this.currentModelName = null;
    this.similarityResults = [];

    this.init();
  }

  init() {
    // Initialize components
    this.viewer = new Viewer3D("viewer");
    this.modelLoader = new ModelLoader();
    this.geometryAnalyzer = new GeometryAnalyzer();
    this.exportManager = new ExportManager();
    this.eventHandler = new EventHandler(this);

    // Setup all event listeners through the event handler
    this.eventHandler.setupAll();

    // Show welcome message
    this.showWelcomeMessage();

    // Update empty state
    this.updateEmptyState();
  }

  // Expose showToast as instance method for event handler
  showToast(message, type, duration) {
    showToast(message, type, duration);
  }

  /**
   * Get current model name
   * @returns {string|null} Current model name
   */
  getCurrentModelName() {
    return this.currentModelName;
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

    // Clone the model and set metadata
    const modelClone = model.object.clone();
    modelClone.userData.modelName = modelName;

    // Load model in viewer
    this.viewer.loadModel(modelClone);

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
    card.dataset.modelName = name; // Store model name for easy lookup
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

    // Click handler - display model and highlight
    card.onclick = () => {
      this.displayModel(name);
      this.highlightModelCard(name);
    };

    // Hover handlers for model highlighting in viewer
    card.onmouseenter = () => {
      if (name !== this.currentModelName) {
        this.highlightModelCard(name, true);
      }
    };

    card.onmouseleave = () => {
      if (name !== this.currentModelName) {
        this.clearHighlight();
      }
    };

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

  /**
   * Update the active state of model cards in the library
   * @param {string} selectedName - Name of the selected model
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
   * Highlight a model card in the library
   * @param {string} modelName - Name of the model to highlight
   * @param {boolean} isHover - Whether this is a hover highlight (temporary)
   */
  highlightModelCard(modelName, isHover = false) {
    const cards = document.querySelectorAll(".model-card");
    cards.forEach((card) => {
      const cardName = card.dataset.modelName;
      if (cardName === modelName) {
        if (isHover) {
          card.classList.add("highlighted");
        } else {
          card.classList.add("active");
          card.classList.remove("highlighted");
        }
      } else {
        if (isHover) {
          // Don't remove active state during hover
          card.classList.remove("highlighted");
        }
      }
    });
  }

  /**
   * Clear temporary highlights from model cards
   */
  clearHighlight() {
    const cards = document.querySelectorAll(".model-card");
    cards.forEach((card) => {
      card.classList.remove("highlighted");
    });
  }

  /**
   * Highlight model in viewer when card is hovered
   * @param {string} modelName - Name of the model to highlight in viewer
   */
  highlightModelInViewer(modelName) {
    if (this.viewer && this.viewer.highlightModel) {
      this.viewer.highlightModel(modelName);
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

  toggleAdvancedControls() {
    const controls = document.getElementById("advancedControls");
    const isVisible = controls.style.display !== "none";
    
    if (isVisible) {
      controls.style.display = "none";
    } else {
      controls.style.display = "block";
      // Add animation class when showing
      controls.classList.add("advanced-controls--animate");
      setTimeout(() => {
        controls.classList.remove("advanced-controls--animate");
      }, 200);
    }
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
      this.exportManager.exportBatchAnalysis(this.modelLibrary);
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
      this.exportManager.exportHTMLReport(this.modelLibrary);
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

  showWelcomeMessage() {
    // Display welcome info in viewer
    console.log("3D Geometric Search Application initialized");
    console.log("Supported formats: glTF/GLB, OBJ/MTL, STL");
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
