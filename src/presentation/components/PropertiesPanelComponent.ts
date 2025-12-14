/**
 * Properties Panel Component
 * 
 * Displays properties of selected model section.
 * Shows metadata, dimensions, and other attributes.
 */

import { ModelSection } from '@domain/models/ModelSection';

export class PropertiesPanelComponent {
  private container: HTMLElement;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    this.container = element;
  }

  showSection(section: ModelSection): void {
    this.clear();

    const properties = document.createElement('div');
    properties.className = 'properties-content';

    // Section name
    this.addProperty(properties, 'Name', section.name);

    // Section ID
    this.addProperty(properties, 'ID', section.id);

    // Parent ID
    if (section.parentId) {
      this.addProperty(properties, 'Parent', section.parentId);
    }

    // Children count
    if (section.children.length > 0) {
      this.addProperty(properties, 'Children', section.children.length.toString());
    }

    // Bounding box
    if (section.boundingBox) {
      const box = section.boundingBox;
      this.addProperty(
        properties,
        'Dimensions',
        `${(box.max.x - box.min.x).toFixed(2)} × ${(box.max.y - box.min.y).toFixed(2)} × ${(box.max.z - box.min.z).toFixed(2)}`
      );
    }

    // Visibility
    this.addProperty(properties, 'Visible', section.isVisible ? 'Yes' : 'No');

    // Custom metadata
    Object.entries(section.metadata).forEach(([key, value]) => {
      this.addProperty(properties, key, String(value));
    });

    this.container.appendChild(properties);
  }

  clear(): void {
    this.container.innerHTML = '<p class="empty-message">No section selected</p>';
  }

  private addProperty(container: HTMLElement, label: string, value: string): void {
    const row = document.createElement('div');
    row.className = 'property-row';

    const labelEl = document.createElement('span');
    labelEl.className = 'property-label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'property-value';
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    container.appendChild(row);
  }
}
