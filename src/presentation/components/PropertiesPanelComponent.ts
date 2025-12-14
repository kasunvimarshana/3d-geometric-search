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
    try {
      if (!section) {
        console.error('[PropertiesPanel] Null section provided');
        this.clear();
        return;
      }

      this.clear();

      const properties = document.createElement('div');
      properties.className = 'properties-content';

      // Section name
      this.addProperty(properties, 'Name', section.name || 'Unknown');

      // Section ID
      this.addProperty(properties, 'ID', section.id || 'Unknown');

      // Parent ID
      if (section.parentId) {
        this.addProperty(properties, 'Parent', section.parentId);
      }

      // Children count
      if (section.children && section.children.length > 0) {
        this.addProperty(properties, 'Children', section.children.length.toString());
      }

      // Bounding box
      if (section.boundingBox) {
        try {
          const box = section.boundingBox;
          const dimX = (box.max.x - box.min.x).toFixed(2);
          const dimY = (box.max.y - box.min.y).toFixed(2);
          const dimZ = (box.max.z - box.min.z).toFixed(2);
          this.addProperty(properties, 'Dimensions', `${dimX} × ${dimY} × ${dimZ}`);
        } catch (error) {
          console.error('[PropertiesPanel] Error calculating dimensions:', error);
        }
      }

      // Visibility
      this.addProperty(properties, 'Visible', section.isVisible ? 'Yes' : 'No');

      // Custom metadata
      if (section.metadata && typeof section.metadata === 'object') {
        try {
          Object.entries(section.metadata).forEach(([key, value]) => {
            try {
              this.addProperty(properties, key, String(value));
            } catch (error) {
              console.error('[PropertiesPanel] Error adding metadata property:', error);
            }
          });
        } catch (error) {
          console.error('[PropertiesPanel] Error processing metadata:', error);
        }
      }

      this.container.appendChild(properties);
    } catch (error) {
      console.error('[PropertiesPanel] Error showing section:', error);
      this.container.innerHTML = '<p class="error-message">Error displaying properties</p>';
    }
  }

  clear(): void {
    try {
      this.container.innerHTML = '<p class="empty-message">No section selected</p>';
    } catch (error) {
      console.error('[PropertiesPanel] Error clearing panel:', error);
    }
  }

  private addProperty(container: HTMLElement, label: string, value: string): void {
    try {
      if (!container) {
        console.error('[PropertiesPanel] Invalid container in addProperty');
        return;
      }

      const row = document.createElement('div');
      row.className = 'property-row';

      const labelEl = document.createElement('span');
      labelEl.className = 'property-label';
      labelEl.textContent = label || 'Unknown';

      const valueEl = document.createElement('span');
      valueEl.className = 'property-value';
      valueEl.textContent = value || 'N/A';

      row.appendChild(labelEl);
      row.appendChild(valueEl);
      container.appendChild(row);
    } catch (error) {
      console.error('[PropertiesPanel] Error adding property:', error);
    }
  }
}
