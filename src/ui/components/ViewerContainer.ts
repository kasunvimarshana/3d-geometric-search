import { UIComponent } from "./UIComponent";

/**
 * Viewer Container Component
 * Container for the 3D renderer
 */
export class ViewerContainer extends UIComponent {
  constructor() {
    super("div", "viewer-container");
  }

  update(): void {
    // No updates needed for this component
  }

  /**
   * Get container for renderer initialization
   */
  getContainer(): HTMLElement {
    return this.element;
  }
}
