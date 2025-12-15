/**
 * Properties Panel UI Component
 * Displays properties of selected nodes
 */

export class PropertiesPanel {
  constructor(container) {
    this.container = container;
    this.highlightTimeout = null;
  }

  /**
   * Displays properties for selected nodes
   * @param {ModelNode[]} nodes - Selected nodes
   */
  render(nodes) {
    this.container.innerHTML = "";

    if (!nodes || nodes.length === 0) {
      this.container.innerHTML = '<p class="empty-message">No selection</p>';
      return;
    }

    if (nodes.length === 1) {
      this.renderSingleNode(nodes[0]);
    } else {
      this.renderMultipleNodes(nodes);
    }
  }

  /**
   * Renders properties for a single node
   * @param {ModelNode} node - Node to display
   */
  renderSingleNode(node) {
    const properties = [
      { label: "Name", value: node.name },
      { label: "Type", value: node.type },
      { label: "ID", value: node.id },
      { label: "State", value: node.state },
    ];

    // Add geometry info if available
    if (node.geometry) {
      properties.push(
        {
          label: "Vertices",
          value: node.geometry.vertexCount?.toLocaleString() || "N/A",
        },
        {
          label: "Faces",
          value: node.geometry.faceCount?.toLocaleString() || "N/A",
        }
      );
    }

    // Add material info if available
    if (node.material) {
      properties.push(
        { label: "Material", value: node.material.name || "Default" },
        { label: "Color", value: this.formatColor(node.material.color) }
      );
    }

    // Add transform info
    if (node.transform) {
      properties.push(
        {
          label: "Position",
          value: this.formatVector(node.transform.position),
        },
        {
          label: "Rotation",
          value: this.formatVector(node.transform.rotation),
        },
        { label: "Scale", value: this.formatVector(node.transform.scale) }
      );
    }

    // Add bounds info
    if (node.bounds) {
      const size = {
        x: node.bounds.max.x - node.bounds.min.x,
        y: node.bounds.max.y - node.bounds.min.y,
        z: node.bounds.max.z - node.bounds.min.z,
      };
      properties.push({ label: "Size", value: this.formatVector(size) });
    }

    // Add children count
    if (node.children) {
      properties.push({ label: "Children", value: node.children.length });
    }

    this.renderPropertyTable(properties);
  }

  /**
   * Renders properties for multiple nodes
   * @param {ModelNode[]} nodes - Nodes to display
   */
  renderMultipleNodes(nodes) {
    const properties = [
      { label: "Selection", value: `${nodes.length} nodes` },
      { label: "Types", value: this.getUniqueTypes(nodes).join(", ") },
    ];

    this.renderPropertyTable(properties);
  }

  /**
   * Renders a property table with interactive highlighting
   * @param {Array} properties - Properties to display
   */
  renderPropertyTable(properties) {
    const table = document.createElement("table");
    table.className = "properties-table";

    properties.forEach((prop, index) => {
      const row = document.createElement("tr");
      row.dataset.propertyIndex = index;

      const labelCell = document.createElement("td");
      labelCell.className = "property-label";
      labelCell.textContent = prop.label;

      const valueCell = document.createElement("td");
      valueCell.className = "property-value";
      valueCell.textContent = prop.value;

      // Add click-to-highlight functionality
      row.addEventListener("click", () => {
        this.highlightProperty(row);
      });

      // Add smooth hover effects (handled by CSS)
      row.addEventListener("mouseenter", () => {
        row.style.cursor = "pointer";
      });

      row.appendChild(labelCell);
      row.appendChild(valueCell);
      table.appendChild(row);
    });

    this.container.appendChild(table);
  }

  /**
   * Highlights a property row with smooth animation
   * @param {HTMLElement} row - Row to highlight
   */
  highlightProperty(row) {
    // Remove previous highlights with dehighlight animation
    const previousHighlight = this.container.querySelector(
      ".properties-table tr.highlight"
    );
    if (previousHighlight && previousHighlight !== row) {
      previousHighlight.classList.add("dehighlight");

      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          previousHighlight.classList.remove("highlight", "dehighlight");
        }, 400);
      });
    }

    // Add highlight to current row with smooth transition
    row.classList.remove("dehighlight");

    // Trigger reflow to ensure animation plays
    void row.offsetWidth;

    row.classList.add("highlight");

    // Auto-remove highlight after 2.5 seconds with smooth fade
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
    }

    this.highlightTimeout = setTimeout(() => {
      row.classList.add("dehighlight");

      requestAnimationFrame(() => {
        setTimeout(() => {
          row.classList.remove("highlight", "dehighlight");
          this.highlightTimeout = null;
        }, 400);
      });
    }, 2500);
  }

  /**
   * Formats a color value
   * @param {number} color - Color value
   * @returns {string}
   */
  formatColor(color) {
    if (color === undefined || color === null) return "N/A";
    return `#${color.toString(16).padStart(6, "0")}`;
  }

  /**
   * Formats a vector
   * @param {Object} vec - Vector {x, y, z}
   * @returns {string}
   */
  formatVector(vec) {
    if (!vec) return "N/A";
    return `${vec.x.toFixed(2)}, ${vec.y.toFixed(2)}, ${vec.z.toFixed(2)}`;
  }

  /**
   * Gets unique node types
   * @param {ModelNode[]} nodes - Nodes
   * @returns {string[]}
   */
  getUniqueTypes(nodes) {
    const types = new Set(nodes.map((n) => n.type));
    return Array.from(types);
  }

  /**
   * Clears the panel and any active timeouts
   */
  clear() {
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }
    this.container.innerHTML = '<p class="empty-message">No selection</p>';
  }
}
