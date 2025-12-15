/**
 * Properties Panel Component
 *
 * Displays properties of selected sections.
 */

export class PropertiesPanelComponent {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
  }

  /**
   * Renders properties for a section
   */
  render(section) {
    this.container.innerHTML = "";

    if (!section) {
      this.renderEmptyState();
      return;
    }

    const content = document.createElement("div");
    content.className = "properties-list";

    // Basic info
    const basicGroup = this.createPropertyGroup("Basic Information", [
      { label: "Name", value: section.name },
      { label: "Type", value: section.type },
      { label: "ID", value: section.id },
      { label: "Path", value: section.getPath() },
    ]);
    content.appendChild(basicGroup);

    // Custom properties
    if (section.properties && Object.keys(section.properties).length > 0) {
      const props = Object.entries(section.properties).map(([key, value]) => ({
        label: this.formatLabel(key),
        value: this.formatValue(value),
      }));

      const propsGroup = this.createPropertyGroup("Properties", props);
      content.appendChild(propsGroup);
    }

    // Hierarchy info
    const hierarchyProps = [
      { label: "Children", value: section.children.length },
      { label: "Is Leaf", value: section.isLeaf() ? "Yes" : "No" },
      { label: "Is Root", value: section.isRoot() ? "Yes" : "No" },
    ];

    const hierarchyGroup = this.createPropertyGroup(
      "Hierarchy",
      hierarchyProps
    );
    content.appendChild(hierarchyGroup);

    this.container.appendChild(content);
  }

  /**
   * Creates a property group
   */
  createPropertyGroup(title, properties) {
    const group = document.createElement("div");
    group.className = "property-group";

    const titleEl = document.createElement("h3");
    titleEl.className = "property-group-title";
    titleEl.textContent = title;
    group.appendChild(titleEl);

    properties.forEach((prop) => {
      const item = document.createElement("div");
      item.className = "property-item";

      const label = document.createElement("span");
      label.className = "property-label";
      label.textContent = prop.label;

      const value = document.createElement("span");
      value.className = "property-value";
      value.textContent = prop.value;
      value.title = prop.value;

      item.appendChild(label);
      item.appendChild(value);
      group.appendChild(item);
    });

    return group;
  }

  /**
   * Renders empty state
   */
  renderEmptyState() {
    this.container.innerHTML = `
            <div class="empty-state">
                <p>No selection</p>
            </div>
        `;
  }

  /**
   * Formats property labels
   */
  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Formats property values
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return "N/A";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return String(value);
  }
}
