/**
 * Viewer component
 * Container for 3D rendering canvas
 */
import { Component } from './Component.js';

export class Viewer extends Component {
  constructor() {
    super();
  }

  render() {
    const container = this.createElement('div', 'app-viewer');
    container.id = 'viewer-container';
    return container;
  }

  getContainer() {
    return this.element;
  }
}
