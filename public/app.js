import Viewer3D from "./viewer.js";

/**
 * 3D Geometric Search Engine - Main Application Logic
 *
 * This module handles:
 * - 3D viewer initialization and controls
 * - File upload and processing
 * - Model management and display
 * - Similarity search
 * - UI state management
 */

// ===== Application State =====
const API_BASE = window.location.origin;
let viewer3D = null;
let currentModelId = null;
let allModels = [];

// ===== Application Initialization =====

document.addEventListener("DOMContentLoaded", () => {
  initViewer();
  initUpload();
  initTemplates();
  initControls();
  initEventDelegation();
  loadAllModels();
  setStatus("Ready to upload 3D models");
});

// ===== Event Delegation for Dynamic Elements =====
function initEventDelegation() {
  // Model list click handler
  document.getElementById("modelList").addEventListener("click", (e) => {
    const modelItem = e.target.closest(".model-item");
    if (modelItem) {
      const modelId = modelItem.dataset.id;
      selectModel(modelId);
    }
  });

  // Search results click handler
  document.getElementById("searchResults").addEventListener("click", (e) => {
    const resultItem = e.target.closest(".result-item");
    const compareBtn = e.target.closest(".icon-btn");

    if (compareBtn && resultItem) {
      e.stopPropagation();
      const modelId = resultItem.dataset.id;
      showComparison(e, modelId);
    } else if (resultItem) {
      const modelId = resultItem.dataset.id;
      selectModel(modelId);
    }
  });
}

// Initialize 3D Viewer
function initViewer() {
  viewer3D = new Viewer3D("viewer3D");

  // === Camera Controls ===

  // Zoom in button
  document.getElementById("zoomInBtn").addEventListener("click", () => {
    viewer3D.zoomIn();
  });

  // Zoom out button
  document.getElementById("zoomOutBtn").addEventListener("click", () => {
    viewer3D.zoomOut();
  });

  // Reset view button
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    viewer3D.resetCamera();
  });

  // View presets
  document.getElementById("topViewBtn").addEventListener("click", () => {
    viewer3D.setTopView();
  });

  document.getElementById("frontViewBtn").addEventListener("click", () => {
    viewer3D.setFrontView();
  });

  document.getElementById("sideViewBtn").addEventListener("click", () => {
    viewer3D.setSideView();
  });

  // === Model Scale Controls ===

  // Scale up button
  document.getElementById("scaleUpBtn").addEventListener("click", () => {
    const newScale = viewer3D.changeScale(0.1);
    document.getElementById("scaleValue").textContent = newScale.toFixed(2);
  });

  // Scale down button
  document.getElementById("scaleDownBtn").addEventListener("click", () => {
    const newScale = viewer3D.changeScale(-0.1);
    document.getElementById("scaleValue").textContent = newScale.toFixed(2);
  });

  // Reset scale button
  document.getElementById("scaleResetBtn").addEventListener("click", () => {
    const newScale = viewer3D.resetScale();
    document.getElementById("scaleValue").textContent = newScale.toFixed(2);
  });

  // === Display Controls ===

  // Wireframe toggle
  document.getElementById("wireframeBtn").addEventListener("click", () => {
    viewer3D.toggleWireframe();
  });

  // Grid toggle
  document.getElementById("gridToggleBtn").addEventListener("click", (e) => {
    const visible = viewer3D.toggleGrid();
    e.target.style.opacity = visible ? "1" : "0.5";
  });

  // Axes toggle
  document.getElementById("axesToggleBtn").addEventListener("click", (e) => {
    const visible = viewer3D.toggleAxes();
    e.target.style.opacity = visible ? "1" : "0.5";
  });

  // Background color cycle
  document.getElementById("backgroundBtn").addEventListener("click", () => {
    viewer3D.cycleBackground();
  });

  // Fullscreen toggle
  document.getElementById("fullscreenBtn").addEventListener("click", () => {
    const viewerElement = document.getElementById("viewer3D");
    if (!document.fullscreenElement) {
      viewerElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}

// Initialize file upload
function initUpload() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  // Click to browse
  uploadArea.addEventListener("click", () => {
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFile(file);
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

    const file = e.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  });
}

// Initialize template shapes
function initTemplates() {
  const templateButtons = document.querySelectorAll(".template-btn");

  templateButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const shape = btn.getAttribute("data-shape");
      viewer3D.loadTemplateShape(shape);
      document.getElementById("viewerTitle").textContent = `Template: ${
        shape.charAt(0).toUpperCase() + shape.slice(1)
      }`;
    });
  });
}

// Initialize controls
function initControls() {
  const thresholdSlider = document.getElementById("thresholdSlider");
  const thresholdValue = document.getElementById("thresholdValue");
  const limitSlider = document.getElementById("limitSlider");
  const limitValue = document.getElementById("limitValue");
  const searchBtn = document.getElementById("searchBtn");

  thresholdSlider.addEventListener("input", (e) => {
    thresholdValue.textContent = parseFloat(e.target.value).toFixed(2);
  });

  limitSlider.addEventListener("input", (e) => {
    limitValue.textContent = e.target.value;
  });

  searchBtn.addEventListener("click", () => {
    if (currentModelId) {
      searchSimilar(currentModelId);
    }
  });
}

// Upload file
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  setStatus(`Uploading ${file.name}...`);
  showProgress(0);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      setStatus(`✓ Uploaded: ${file.name}`);
      showProgress(100);
      setTimeout(() => hideProgress(), 1000);

      // Add to model list
      allModels.unshift(data);
      updateModelList();

      // Select and display the uploaded model
      selectModel(data.modelId);

      // Show search controls
      document.getElementById("searchControls").style.display = "block";
    } else {
      throw new Error(data.error || "Upload failed");
    }
  } catch (error) {
    setStatus(`✗ Error: ${error.message}`, "error");
    hideProgress();
    console.error("Upload error:", error);
  }
}

// Load all models
async function loadAllModels() {
  try {
    const response = await fetch(`${API_BASE}/api/models`);
    const data = await response.json();

    if (data.success) {
      allModels = data.models;
      updateModelList();
      document.getElementById("modelCount").textContent = allModels.length;
    }
  } catch (error) {
    console.error("Error loading models:", error);
  }
}

// Update model list display
function updateModelList() {
  const modelList = document.getElementById("modelList");
  document.getElementById("modelCount").textContent = allModels.length;

  if (allModels.length === 0) {
    modelList.innerHTML =
      '<p style="color: #cbd5e1; text-align: center; padding: 2rem;">No models uploaded yet</p>';
    return;
  }

  modelList.innerHTML = allModels
    .map(
      (model) => `
        <div class="model-item" data-id="${model.id}">
            <div class="model-name">${model.filename}</div>
            <div class="model-meta">
                <span>${
                  model.format ? model.format.toUpperCase() : "UNKNOWN"
                }</span>
                <span>${formatDate(model.uploadDate)}</span>
            </div>
        </div>
    `
    )
    .join("");
}

// Select and display a model
async function selectModel(modelId) {
  currentModelId = modelId;

  // Highlight selected model
  document.querySelectorAll(".model-item").forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("data-id") === modelId) {
      item.classList.add("active");
    }
  });

  try {
    const response = await fetch(`${API_BASE}/api/models/${modelId}`);
    const data = await response.json();

    if (data.success) {
      const model = data.model;

      // Update viewer title
      document.getElementById("viewerTitle").textContent = model.filename;

      // Load model in viewer
      if (
        model.format === "gltf" ||
        model.format === "glb" ||
        model.format === "obj" ||
        model.format === "stl"
      ) {
        viewer3D.loadModel(model.previewUrl, model.format);
      } else {
        viewer3D.loadDefaultModel();
      }

      // Show model info
      displayModelInfo(model);

      setStatus(`Loaded: ${model.filename}`);
    }
  } catch (error) {
    console.error("Error loading model:", error);
    setStatus(`Error loading model: ${error.message}`, "error");
  }
}

// Display model information
function displayModelInfo(model) {
  const infoPanel = document.getElementById("modelInfo");
  const infoDetails = document.getElementById("modelDetails");

  const features = model.features;

  infoDetails.innerHTML = `
        <div class="info-row">
            <span class="info-label">Format:</span>
            <span class="info-value">${model.format.toUpperCase()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Vertices:</span>
            <span class="info-value">${features.vertexCount || 0}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Faces:</span>
            <span class="info-value">${features.faceCount || 0}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Surface Area:</span>
            <span class="info-value">${(features.surfaceArea || 0).toFixed(
              2
            )}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Volume:</span>
            <span class="info-value">${(features.volume || 0).toFixed(2)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Sphericity:</span>
            <span class="info-value">${(features.sphericity || 0).toFixed(
              3
            )}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Dimensions:</span>
            <span class="info-value">${(features.width || 0).toFixed(2)} × ${(
    features.height || 0
  ).toFixed(2)} × ${(features.depth || 0).toFixed(2)}</span>
        </div>
    `;

  infoPanel.style.display = "block";
}

// Search for similar models
async function searchSimilar(modelId) {
  const threshold = parseFloat(
    document.getElementById("thresholdSlider").value
  );
  const limit = parseInt(document.getElementById("limitSlider").value);

  setStatus("Searching for similar models...");
  showProgress(0);

  try {
    const response = await fetch(`${API_BASE}/api/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ modelId, threshold, limit }),
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      displaySearchResults(data.results);
      setStatus(`✓ Found ${data.results.length} similar model(s)`);
      showProgress(100);
      setTimeout(() => hideProgress(), 1000);
    } else {
      throw new Error(data.error || "Search failed");
    }
  } catch (error) {
    setStatus(`✗ Search error: ${error.message}`, "error");
    hideProgress();
    console.error("Search error:", error);
  }
}

// Display search results
function displaySearchResults(results) {
  const resultsPanel = document.getElementById("searchResultsPanel");
  const resultsContainer = document.getElementById("searchResults");

  if (results.length === 0) {
    resultsContainer.innerHTML =
      '<p style="color: #cbd5e1; text-align: center; padding: 2rem;">No similar models found</p>';
  } else {
    resultsContainer.innerHTML = results
      .map(
        (result) => `
            <div class="result-item" data-id="${result.modelId}">
                <div class="model-name">${result.filename}</div>
                <div class="similarity-badge">${(
                  result.similarity * 100
                ).toFixed(1)}% match</div>
                <div class="model-meta">
                    <span>${result.format.toUpperCase()}</span>
                    <button class="icon-btn">📊</button>
                </div>
            </div>
        `
      )
      .join("");
  }

  resultsPanel.style.display = "block";
}

// Show feature comparison modal
function showComparison(event, resultModelId) {
  event.stopPropagation();

  // This would show detailed feature comparison
  // Implementation left for enhancement
  alert("Feature comparison view - to be implemented");
}

// Utility functions
function setStatus(message, type = "normal") {
  const statusElement = document.getElementById("statusMessage");
  statusElement.textContent = message;

  if (type === "error") {
    statusElement.style.color = "#ef4444";
  } else {
    statusElement.style.color = "#cbd5e1";
  }
}

function showProgress(percent) {
  const progressBar = document.getElementById("progressBar");
  const progressFill = document.getElementById("progressFill");

  progressBar.style.display = "block";
  progressFill.style.width = `${percent}%`;
}

function hideProgress() {
  const progressBar = document.getElementById("progressBar");
  progressBar.style.display = "none";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Global function for onclick handlers
window.selectModel = selectModel;
window.showComparison = showComparison;
