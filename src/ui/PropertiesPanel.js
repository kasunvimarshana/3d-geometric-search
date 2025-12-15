/**
 * Properties panel component
 * Displays selected section properties
 */
import { Component } from './Component.js';
import { stateManager } from '../state/StateManager.js';

export class PropertiesPanel extends Component {
  constructor() {
    super();
    this.selectedSection = null;
    this.unsubscribe = null;
  }

  render() {
    const container = this.createElement('div', 'app-properties');

    container.innerHTML = `
      <div class="properties-panel">
        <h2 class="properties-title">Properties</h2>
        <div class="properties-content"></div>
      </div>
    `;

    return container;
  }

  afterMount() {
    // Subscribe to state changes
    this.unsubscribe = stateManager.subscribe(
      this.handleStateChange.bind(this),
      ['model', 'selection']
    );

    // Initial render
    this.updateProperties();
  }

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleStateChange(state) {
    const model = state.model;
    const selection = state.selection;

    if (!model || !selection || selection.isEmpty()) {
      this.selectedSection = null;
    } else {
      const selectedIds = selection.getAll();
      const sectionId = selectedIds[0]; // Show first selected
      this.selectedSection = model.getSectionById(sectionId);
    }

    this.updateProperties();
  }

  updateProperties() {
    const container = this.$('.properties-content');
    if (!container) return;

    if (!this.selectedSection) {
      container.innerHTML = '<p class="text-muted text-small">No section selected</p>';
      return;
    }

    container.innerHTML = '';

    // Render properties
    this.addProperty(container, 'Name', this.selectedSection.name);
    this.addProperty(container, 'Type', this.selectedSection.type);
    this.addProperty(container, 'ID', this.selectedSection.id);
    this.addProperty(container, 'Visible', this.selectedSection.visible ? 'Yes' : 'No');
    this.addProperty(container, 'Children', this.selectedSection.children.length.toString());

    // Custom properties
    if (Object.keys(this.selectedSection.properties).length > 0) {
      const divider = this.createElement('div', 'mt-lg mb-md');
      divider.innerHTML = '<strong>Custom Properties</strong>';
      container.appendChild(divider);

      for (const [key, value] of Object.entries(this.selectedSection.properties)) {
        if (typeof value !== 'object') {
          this.addProperty(container, key, value.toString());
        }
      }
    }

    // Transform
    if (this.selectedSection.position) {
      const divider = this.createElement('div', 'mt-lg mb-md');
      divider.innerHTML = '<strong>Transform</strong>';
      container.appendChild(divider);

      const pos = this.selectedSection.position;
      this.addProperty(
        container,
        'Position',
        `X: ${pos.x.toFixed(2)}, Y: ${pos.y.toFixed(2)}, Z: ${pos.z.toFixed(2)}`
      );

      if (this.selectedSection.rotation) {
        const rot = this.selectedSection.rotation;
        this.addProperty(
          container,
          'Rotation',
          `X: ${rot.x.toFixed(2)}, Y: ${rot.y.toFixed(2)}, Z: ${rot.z.toFixed(2)}`
        );
      }

      if (this.selectedSection.scale) {
        const scale = this.selectedSection.scale;
        this.addProperty(
          container,
          'Scale',
          `X: ${scale.x.toFixed(2)}, Y: ${scale.y.toFixed(2)}, Z: ${scale.z.toFixed(2)}`
        );
      }
    }
  }

  addProperty(container, label, value) {
    const propertyItem = this.createElement('div', 'property-item');

    const labelEl = this.createElement('div', 'property-label', label);
    const valueEl = this.createElement('div', 'property-value', value);

    propertyItem.appendChild(labelEl);
    propertyItem.appendChild(valueEl);
    container.appendChild(propertyItem);
  }
}
