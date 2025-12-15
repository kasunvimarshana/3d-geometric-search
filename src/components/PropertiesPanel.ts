/**
 * Properties Panel
 * Displays properties of selected sections
 */

import type { ModelSection, ModelProperty } from "../domain/types";
import { StateManager } from "../core/StateManager";

export class PropertiesPanel {
  private container: HTMLElement;
  private stateManager: StateManager;
  private selectedSections: ModelSection[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.stateManager = StateManager.getInstance();

    this.initializeUI();
    this.subscribeToState();
  }

  private initializeUI(): void {
    this.container.className = "properties-panel";
    this.container.innerHTML = `
      <div class="panel-header">
        <h3>Properties</h3>
      </div>
      <div class="properties-content" id="propertiesContent"></div>
    `;
  }

  private subscribeToState(): void {
    this.stateManager.subscribe((state) => {
      if (!state.model) {
        this.selectedSections = [];
        this.render();
        return;
      }

      // Get selected sections
      this.selectedSections = state.selectionState.selectedSectionIds
        .map((id) => state.model!.sections.get(id))
        .filter(Boolean) as ModelSection[];

      this.render();
    });
  }

  private render(): void {
    const contentElement = this.container.querySelector("#propertiesContent");
    if (!contentElement) return;

    if (this.selectedSections.length === 0) {
      contentElement.innerHTML =
        '<div class="empty-state">No section selected</div>';
      return;
    }

    contentElement.innerHTML = "";

    this.selectedSections.forEach((section, index) => {
      if (index > 0) {
        const divider = document.createElement("div");
        divider.className = "section-divider";
        contentElement.appendChild(divider);
      }

      this.renderSectionProperties(section, contentElement as HTMLElement);
    });
  }

  private renderSectionProperties(
    section: ModelSection,
    parentElement: HTMLElement
  ): void {
    const sectionBlock = document.createElement("div");
    sectionBlock.className = "section-properties";

    // Section header
    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `
      <h4>${section.name}</h4>
      <span class="section-type-badge">${section.type}</span>
    `;
    sectionBlock.appendChild(header);

    // Properties table
    const table = document.createElement("table");
    table.className = "properties-table";

    // Built-in properties
    const builtInProps = [
      { name: "ID", value: section.id },
      { name: "Type", value: section.type },
      { name: "Visible", value: section.visible ? "Yes" : "No" },
      { name: "Children", value: section.children.length.toString() },
    ];

    builtInProps.forEach((prop) => {
      const row = this.createPropertyRow(prop.name, prop.value);
      table.appendChild(row);
    });

    // Custom properties
    if (section.properties && section.properties.length > 0) {
      const separator = document.createElement("tr");
      separator.className = "property-separator";
      separator.innerHTML =
        '<td colspan="2"><div class="separator-line"></div></td>';
      table.appendChild(separator);

      section.properties.forEach((prop) => {
        const row = this.createPropertyRow(
          prop.name,
          this.formatPropertyValue(prop)
        );
        table.appendChild(row);
      });
    }

    sectionBlock.appendChild(table);
    parentElement.appendChild(sectionBlock);
  }

  private createPropertyRow(name: string, value: string): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.className = "property-row";
    row.innerHTML = `
      <td class="property-name">${name}</td>
      <td class="property-value">${value}</td>
    `;

    // Add hover effect for highlighting
    row.addEventListener("mouseenter", () => {
      row.classList.add("highlighted");
    });

    row.addEventListener("mouseleave", () => {
      row.classList.remove("highlighted");
    });

    return row;
  }

  private formatPropertyValue(prop: ModelProperty): string {
    switch (prop.type) {
      case "boolean":
        return prop.value ? "Yes" : "No";
      case "number":
        return typeof prop.value === "number"
          ? prop.value.toLocaleString()
          : String(prop.value);
      default:
        return String(prop.value);
    }
  }
}
