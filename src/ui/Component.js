/**
 * Base UI component class
 * All UI components extend this
 */
export class Component {
  constructor() {
    this.element = null;
    this.mounted = false;
    this.listeners = [];
  }

  /**
   * Create component element
   * Must be implemented by subclasses
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Mount component to DOM
   */
  mount(container) {
    if (!container) {
      throw new Error('Container is required');
    }

    if (this.mounted) {
      console.warn('Component already mounted');
      return;
    }

    this.element = this.render();
    container.appendChild(this.element);
    this.mounted = true;
    this.afterMount();
  }

  /**
   * Lifecycle hook after mount
   */
  afterMount() {
    // Override in subclasses
  }

  /**
   * Update component
   */
  update(data) {
    // Override in subclasses
  }

  /**
   * Unmount component from DOM
   */
  unmount() {
    if (!this.mounted) return;

    this.beforeUnmount();
    this.removeAllListeners();

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
    this.mounted = false;
  }

  /**
   * Lifecycle hook before unmount
   */
  beforeUnmount() {
    // Override in subclasses
  }

  /**
   * Add event listener
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.listeners.push({ element, event, handler });
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.listeners = [];
  }

  /**
   * Create element helper
   */
  createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  }

  /**
   * Query selector helper
   */
  $(selector) {
    return this.element ? this.element.querySelector(selector) : null;
  }

  /**
   * Query all selector helper
   */
  $$(selector) {
    return this.element ? this.element.querySelectorAll(selector) : [];
  }
}
