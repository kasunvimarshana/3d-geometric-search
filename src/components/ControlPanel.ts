/**
 * Control Panel
 * Provides controls for model manipulation and view settings
 */

import { StateManager } from "../core/StateManager";
import { ModelLoaderFactory } from "../loaders/ModelLoaderFactory";

export class ControlPanel {
  private container: HTMLElement;
  private stateManager: StateManager;

  constructor(container: HTMLElement) {
    this.container = container;
    this.stateManager = StateManager.getInstance();

    this.initializeUI();
    this.attachEventListeners();
  }

  private initializeUI(): void {
    this.container.className = "control-panel";
    this.container.innerHTML = `
      <div class="control-group">
        <h4>File</h4>
        <button id="btnLoadModel" class="btn btn-primary">
          <span class="icon">📂</span>
          Load Model
        </button>
        <input type="file" id="fileInput" style="display: none;" 
               accept=".gltf,.glb,.obj,.stl,.stp,.step" />
      </div>
      
      <div class="control-group">
        <h4>View</h4>
        <button id="btnZoomIn" class="btn">
          <span class="icon">🔍+</span>
          Zoom In
        </button>
        <button id="btnZoomOut" class="btn">
          <span class="icon">🔍-</span>
          Zoom Out
        </button>
        <button id="btnResetView" class="btn">
          <span class="icon">🔄</span>
          Reset View
        </button>
        <button id="btnFullscreen" class="btn">
          <span class="icon">⛶</span>
          Fullscreen
        </button>
      </div>
      
      <div class="control-group">
        <h4>Model</h4>
        <button id="btnDisassemble" class="btn">
          <span class="icon">💥</span>
          <span id="disassembleText">Disassemble</span>
        </button>
        <button id="btnClearSelection" class="btn">
          <span class="icon">✕</span>
          Clear Selection
        </button>
      </div>
      
      <div class="control-group info-group">
        <h4>Info</h4>
        <div id="modelInfo" class="model-info">
          <div class="info-item">
            <span class="info-label">Model:</span>
            <span class="info-value" id="modelName">None</span>
          </div>
          <div class="info-item">
            <span class="info-label">Format:</span>
            <span class="info-value" id="modelFormat">-</span>
          </div>
          <div class="info-item">
            <span class="info-label">Sections:</span>
            <span class="info-value" id="sectionCount">0</span>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Load model
    const btnLoadModel = this.container.querySelector("#btnLoadModel");
    const fileInput = this.container.querySelector(
      "#fileInput"
    ) as HTMLInputElement;

    btnLoadModel?.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput?.addEventListener("change", (e) => {
      this.handleFileSelection(e);
    });

    // View controls
    this.container
      .querySelector("#btnZoomIn")
      ?.addEventListener("click", () => {
        const state = this.stateManager.getState();
        this.stateManager.updateViewState({ zoom: state.viewState.zoom * 1.2 });
      });

    this.container
      .querySelector("#btnZoomOut")
      ?.addEventListener("click", () => {
        const state = this.stateManager.getState();
        this.stateManager.updateViewState({ zoom: state.viewState.zoom / 1.2 });
      });

    this.container
      .querySelector("#btnResetView")
      ?.addEventListener("click", () => {
        this.stateManager.resetViewState();
      });

    this.container
      .querySelector("#btnFullscreen")
      ?.addEventListener("click", () => {
        const state = this.stateManager.getState();
        this.stateManager.updateViewState({
          fullscreen: !state.viewState.fullscreen,
        });
      });

    // Model controls
    this.container
      .querySelector("#btnDisassemble")
      ?.addEventListener("click", () => {
        this.stateManager.toggleDisassembly();
      });

    this.container
      .querySelector("#btnClearSelection")
      ?.addEventListener("click", () => {
        this.stateManager.clearSelection();
      });

    // Subscribe to state changes
    this.stateManager.subscribe((state) => {
      this.updateInfo(state);
      this.updateDisassembleButton(state.disassembled);
    });
  }

  private async handleFileSelection(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    try {
      // Check if format is supported
      if (!ModelLoaderFactory.isFormatSupported(file.name)) {
        alert(
          `Unsupported file format. Supported formats: ${ModelLoaderFactory.getSupportedFormats().join(
            ", "
          )}`
        );
        return;
      }

      this.stateManager.loadModel(file.name);

      // Read file
      const arrayBuffer = await file.arrayBuffer();

      // Get appropriate loader
      const loader = ModelLoaderFactory.getLoader(file.name);
      if (!loader) {
        throw new Error("No loader found for this file type");
      }

      // Load model
      const model = await loader.load(file.name, arrayBuffer);

      // Set model in state
      this.stateManager.setModel(model);
    } catch (error) {
      console.error("Error loading model:", error);
      this.stateManager.setError(
        error instanceof Error ? error.message : "Failed to load model"
      );
      alert(`Error loading model: ${error}`);
    } finally {
      // Reset file input
      input.value = "";
    }
  }

  private updateInfo(state: any): void {
    const modelNameEl = this.container.querySelector("#modelName");
    const modelFormatEl = this.container.querySelector("#modelFormat");
    const sectionCountEl = this.container.querySelector("#sectionCount");

    if (state.model) {
      if (modelNameEl) modelNameEl.textContent = state.model.name;
      if (modelFormatEl)
        modelFormatEl.textContent = state.model.format.toUpperCase();
      if (sectionCountEl)
        sectionCountEl.textContent = state.model.sections.size.toString();
    } else {
      if (modelNameEl) modelNameEl.textContent = "None";
      if (modelFormatEl) modelFormatEl.textContent = "-";
      if (sectionCountEl) sectionCountEl.textContent = "0";
    }
  }

  private updateDisassembleButton(disassembled: boolean): void {
    const textEl = this.container.querySelector("#disassembleText");
    if (textEl) {
      textEl.textContent = disassembled ? "Reassemble" : "Disassemble";
    }
  }
}
