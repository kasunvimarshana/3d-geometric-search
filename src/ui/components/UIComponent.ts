/**
 * UI Component Base Class
 * Provides common functionality for all UI components
 */
export abstract class UIComponent {
  protected element: HTMLElement;
  protected mounted: boolean;

  constructor(tagName: string = "div", className?: string) {
    this.element = document.createElement(tagName);
    if (className) {
      this.element.className = className;
    }
    this.mounted = false;
  }

  /**
   * Get the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Mount component to parent
   */
  mount(parent: HTMLElement): void {
    parent.appendChild(this.element);
    this.mounted = true;
    this.onMount();
  }

  /**
   * Unmount component
   */
  unmount(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
    this.mounted = false;
    this.onUnmount();
  }

  /**
   * Show component
   */
  show(): void {
    this.element.style.display = "";
  }

  /**
   * Hide component
   */
  hide(): void {
    this.element.style.display = "none";
  }

  /**
   * Lifecycle: Called after mount
   */
  protected onMount(): void {
    // Override in subclasses
  }

  /**
   * Lifecycle: Called before unmount
   */
  protected onUnmount(): void {
    // Override in subclasses
  }

  /**
   * Update component
   */
  abstract update(data: unknown): void;

  /**
   * Destroy component and clean up
   */
  destroy(): void {
    this.unmount();
    this.element.remove();
  }
}
