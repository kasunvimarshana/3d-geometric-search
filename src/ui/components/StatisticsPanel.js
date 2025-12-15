/**
 * StatisticsPanel
 *
 * UI component for displaying model statistics.
 */
export class StatisticsPanel {
  constructor(container) {
    this.elements = {
      vertices: container.querySelector('#stat-vertices'),
      faces: container.querySelector('#stat-faces'),
      objects: container.querySelector('#stat-objects'),
    };
  }

  /**
   * Update statistics display
   */
  update(statistics) {
    if (!statistics) {
      return;
    }
    if (this.elements.vertices) {
      this.elements.vertices.textContent = this.formatNumber(statistics.vertices || 0);
    }
    if (this.elements.faces) {
      this.elements.faces.textContent = this.formatNumber(statistics.faces || 0);
    }
    if (this.elements.objects) {
      this.elements.objects.textContent = this.formatNumber(statistics.objects || 0);
    }
  }

  /**
   * Format number with separators
   */
  formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Clear statistics
   */
  clear() {
    this.update({ vertices: 0, faces: 0, objects: 0 });
  }
}
