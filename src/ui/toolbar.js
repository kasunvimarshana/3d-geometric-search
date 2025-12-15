/**
 * Toolbar Component
 *
 * Manages viewport toolbar actions and state.
 */

export class ToolbarComponent {
  constructor(elements, eventBus) {
    this.elements = elements;
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for toolbar buttons
   */
  setupEventListeners() {
    if (this.elements.resetViewBtn) {
      this.elements.resetViewBtn.onclick = () => {
        this.eventBus.emit("toolbar:resetView");
      };
    }

    if (this.elements.fitViewBtn) {
      this.elements.fitViewBtn.onclick = () => {
        this.eventBus.emit("toolbar:fitView");
      };
    }

    if (this.elements.isolateBtn) {
      this.elements.isolateBtn.onclick = () => {
        this.eventBus.emit("toolbar:isolate");
      };
    }

    if (this.elements.showAllBtn) {
      this.elements.showAllBtn.onclick = () => {
        this.eventBus.emit("toolbar:showAll");
      };
    }

    if (this.elements.disassembleBtn) {
      this.elements.disassembleBtn.onclick = () => {
        this.eventBus.emit("toolbar:disassemble");
      };
    }

    if (this.elements.assembleBtn) {
      this.elements.assembleBtn.onclick = () => {
        this.eventBus.emit("toolbar:assemble");
      };
    }

    if (this.elements.expandAllBtn) {
      this.elements.expandAllBtn.onclick = () => {
        this.eventBus.emit("toolbar:expandAll");
      };
    }

    if (this.elements.uploadBtn) {
      this.elements.uploadBtn.onclick = () => {
        this.eventBus.emit("toolbar:upload");
      };
    }

    if (this.elements.fullscreenBtn) {
      this.elements.fullscreenBtn.onclick = () => {
        this.eventBus.emit("toolbar:fullscreen");
      };
    }
  }

  /**
   * Updates button states based on application state
   */
  updateButtonStates(state) {
    const hasModel = state.model !== null;
    const hasSelection =
      state.selection.selectedSections &&
      state.selection.selectedSections.length > 0;

    // Enable/disable based on model presence
    if (this.elements.isolateBtn) {
      this.elements.isolateBtn.disabled = !hasSelection;
    }

    if (this.elements.showAllBtn) {
      this.elements.showAllBtn.disabled = !hasModel;
    }

    if (this.elements.disassembleBtn) {
      this.elements.disassembleBtn.disabled =
        !hasModel || state.ui.disassembled;
    }

    if (this.elements.assembleBtn) {
      this.elements.assembleBtn.disabled = !hasModel || !state.ui.disassembled;
    }
  }

  /**
   * Updates info text
   */
  updateInfo(text) {
    if (this.elements.viewportInfo) {
      this.elements.viewportInfo.textContent = text;
    }
  }
}
