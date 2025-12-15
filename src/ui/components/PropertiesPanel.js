/**
 * PropertiesPanel
 *
 * UI component for displaying section properties and metadata.
 */
export class PropertiesPanel {
  constructor(container) {
    this.container = container;
  }

  /**
   * Display section properties
   */
  displayProperties(section) {
    this.container.innerHTML = '';

    if (!section) {
      this.container.innerHTML = '<div class="empty-state">No selection</div>';
      return;
    }

    const properties = [
      { label: 'Name', value: section.name || 'Unnamed' },
      { label: 'ID', value: section.id },
      { label: 'Type', value: section.isLeaf() ? 'Part' : 'Assembly' },
      { label: 'Visible', value: section.visible ? 'Yes' : 'No' },
      { label: 'Selectable', value: section.selectable ? 'Yes' : 'No' },
    ];

    // Add geometry info
    if (section.geometry) {
      if (section.geometry.vertexCount) {
        properties.push({ label: 'Vertices', value: section.geometry.vertexCount });
      }
      if (section.geometry.faceCount) {
        properties.push({ label: 'Faces', value: section.geometry.faceCount });
      }
    }

    // Add custom properties
    if (section.properties && Object.keys(section.properties).length > 0) {
      Object.entries(section.properties).forEach(([key, value]) => {
        properties.push({ label: key, value: String(value) });
      });
    }

    // Render properties
    const table = document.createElement('div');
    table.className = 'properties-table';

    properties.forEach(({ label, value }) => {
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
      table.appendChild(row);
    });

    this.container.appendChild(table);
  }

  /**
   * Display model properties
   */
  displayModelProperties(model) {
    this.container.innerHTML = '';

    if (!model) {
      this.container.innerHTML = '<div class="empty-state">No model loaded</div>';
      return;
    }

    const stats = model.getStatistics();
    const properties = [
      { label: 'Name', value: model.name },
      { label: 'Format', value: model.format.toUpperCase() },
      { label: 'Objects', value: stats.objects },
      { label: 'Total Vertices', value: stats.vertices },
      { label: 'Total Faces', value: stats.faces },
      { label: 'Sections', value: model.getAllSections().length },
    ];

    // Add metadata
    if (model.metadata && Object.keys(model.metadata).length > 0) {
      Object.entries(model.metadata).forEach(([key, value]) => {
        properties.push({ label: key, value: String(value) });
      });
    }

    // Render properties
    const table = document.createElement('div');
    table.className = 'properties-table';

    properties.forEach(({ label, value }) => {
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
      table.appendChild(row);
    });

    this.container.appendChild(table);
  }

  /**
   * Clear panel
   */
  clear() {
    this.container.innerHTML = '<div class="empty-state">No selection</div>';
  }
}
