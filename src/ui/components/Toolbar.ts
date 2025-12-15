import { UIComponent } from "./UIComponent";
import { ModelFormat } from "@domain/types";

interface ToolbarProps {
  onFileUpload: (file: File) => void;
  onReset: () => void;
  onDisassemble: () => void;
  onReassemble: () => void;
  onFullscreen: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onScaleUp?: () => void;
  onScaleDown?: () => void;
  onFitToScreen?: () => void;
  supportedFormats: ModelFormat[];
}

/**
 * Toolbar Component
 * Provides main controls for the application
 */
export class Toolbar extends UIComponent {
  private fileInput: HTMLInputElement;
  private props: ToolbarProps;

  constructor(props: ToolbarProps) {
    super("div", "toolbar");
    this.props = props;
    this.fileInput = document.createElement("input");
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="toolbar-section">
        <button class="btn btn-primary" id="upload-btn">
          <span class="icon">📁</span>
          <span>Upload Model</span>
        </button>
        <button class="btn" id="reset-btn">
          <span class="icon">🔄</span>
          <span>Reset View</span>
        </button>
        <button class="btn" id="fit-screen-btn" title="Fit to Screen (F)">
          <span class="icon">⛶</span>
          <span>Fit</span>
        </button>
      </div>
      
      <div class="toolbar-section">
        <button class="btn" id="zoom-in-btn" title="Zoom In">
          <span class="icon">🔍+</span>
        </button>
        <button class="btn" id="zoom-out-btn" title="Zoom Out">
          <span class="icon">🔍-</span>
        </button>
        <button class="btn" id="scale-up-btn" title="Scale Up (Ctrl++)">
          <span class="icon">⬆️</span>
        </button>
        <button class="btn" id="scale-down-btn" title="Scale Down (Ctrl+-)">
          <span class="icon">⬇️</span>
        </button>
      </div>
      
      <div class="toolbar-section">
        <button class="btn" id="disassemble-btn">
          <span class="icon">💥</span>
          <span>Disassemble</span>
        </button>
        <button class="btn" id="reassemble-btn">
          <span class="icon">🔧</span>
          <span>Reassemble</span>
        </button>
      </div>
      
      <div class="toolbar-section">
        <button class="btn" id="fullscreen-btn">
          <span class="icon">⛶</span>
          <span>Fullscreen</span>
        </button>
      </div>
    `;

    this.setupFileInput();
    this.attachEventListeners();
  }

  private setupFileInput(): void {
    this.fileInput.type = "file";
    this.fileInput.accept = this.getAcceptString();
    this.fileInput.style.display = "none";
    this.element.appendChild(this.fileInput);

    this.fileInput.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        this.props.onFileUpload(file);
        target.value = ""; // Reset input
      }
    });
  }

  private getAcceptString(): string {
    const extensions = this.props.supportedFormats.map((format) => {
      switch (format) {
        case ModelFormat.GLTF:
          return ".gltf";
        case ModelFormat.GLB:
          return ".glb";
        case ModelFormat.STEP:
          return ".step,.stp";
        case ModelFormat.OBJ:
          return ".obj";
        case ModelFormat.STL:
          return ".stl";
        default:
          return "";
      }
    });
    return extensions.join(",");
  }

  private attachEventListeners(): void {
    const uploadBtn = this.element.querySelector("#upload-btn");
    uploadBtn?.addEventListener("click", () => {
      this.fileInput.click();
    });

    const resetBtn = this.element.querySelector("#reset-btn");
    resetBtn?.addEventListener("click", () => {
      this.props.onReset();
    });

    const fitScreenBtn = this.element.querySelector("#fit-screen-btn");
    fitScreenBtn?.addEventListener("click", () => {
      this.props.onFitToScreen?.();
    });

    const zoomInBtn = this.element.querySelector("#zoom-in-btn");
    zoomInBtn?.addEventListener("click", () => {
      this.props.onZoomIn?.();
    });

    const zoomOutBtn = this.element.querySelector("#zoom-out-btn");
    zoomOutBtn?.addEventListener("click", () => {
      this.props.onZoomOut?.();
    });

    const scaleUpBtn = this.element.querySelector("#scale-up-btn");
    scaleUpBtn?.addEventListener("click", () => {
      this.props.onScaleUp?.();
    });

    const scaleDownBtn = this.element.querySelector("#scale-down-btn");
    scaleDownBtn?.addEventListener("click", () => {
      this.props.onScaleDown?.();
    });

    const disassembleBtn = this.element.querySelector("#disassemble-btn");
    disassembleBtn?.addEventListener("click", () => {
      this.props.onDisassemble();
    });

    const reassembleBtn = this.element.querySelector("#reassemble-btn");
    reassembleBtn?.addEventListener("click", () => {
      this.props.onReassemble();
    });

    const fullscreenBtn = this.element.querySelector("#fullscreen-btn");
    fullscreenBtn?.addEventListener("click", () => {
      this.props.onFullscreen();
    });
  }

  update(data: Partial<ToolbarProps>): void {
    if (data.supportedFormats) {
      this.props.supportedFormats = data.supportedFormats;
      this.fileInput.accept = this.getAcceptString();
    }
  }

  setButtonEnabled(buttonId: string, enabled: boolean): void {
    const button = this.element.querySelector(
      `#${buttonId}`
    ) as HTMLButtonElement;
    if (button) {
      button.disabled = !enabled;
    }
  }
}
