/**
 * Loading overlay component
 */
import { Component } from './Component.js';
import { stateManager } from '../state/StateManager.js';

export class LoadingOverlay extends Component {
  constructor() {
    super();
    this.unsubscribe = null;
  }

  render() {
    const overlay = this.createElement('div', 'loading-overlay hidden');
    overlay.innerHTML = `
      <div class="spinner"></div>
    `;
    return overlay;
  }

  afterMount() {
    this.unsubscribe = stateManager.subscribe(this.handleStateChange.bind(this), ['isLoading']);
  }

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleStateChange(state) {
    if (state.isLoading) {
      this.element.classList.remove('hidden');
    } else {
      this.element.classList.add('hidden');
    }
  }
}
