/**
 * Section Navigation Panel
 * Displays hierarchical model structure with selection support
 */

import type { Model3D, ModelSection } from "../domain/types";
import { StateManager } from "../core/StateManager";
import { EventBus } from "../core/EventBus";

export class NavigationPanel {
  private container: HTMLElement;
  private stateManager: StateManager;
  private eventBus: EventBus;
  private model: Model3D | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();

    this.initializeUI();
    this.subscribeToState();
  }

  private initializeUI(): void {
    this.container.className = "navigation-panel";
    this.container.innerHTML = `
      <div class="panel-header">
        <h3>Model Structure</h3>
      </div>
      <div class="section-tree" id="sectionTree"></div>
    `;
  }

  private subscribeToState(): void {
    this.stateManager.subscribe((state) => {
      if (state.model !== this.model) {
        this.model = state.model;
        this.render();
      }
    });
  }

  private render(): void {
    const treeContainer = this.container.querySelector("#sectionTree");
    if (!treeContainer) return;

    if (!this.model) {
      treeContainer.innerHTML =
        '<div class="empty-state">No model loaded</div>';
      return;
    }

    const rootSection = this.model.sections.get(this.model.rootSectionId);
    if (!rootSection) {
      treeContainer.innerHTML = '<div class="empty-state">Invalid model</div>';
      return;
    }

    treeContainer.innerHTML = "";
    this.renderSection(rootSection, treeContainer as HTMLElement, 0);
  }

  private renderSection(
    section: ModelSection,
    parentElement: HTMLElement,
    depth: number
  ): void {
    const sectionElement = document.createElement("div");
    sectionElement.className = "section-item";
    sectionElement.style.paddingLeft = `${depth * 20}px`;
    sectionElement.dataset.sectionId = section.id;

    // Icon based on type
    const icon = this.getSectionIcon(section.type);

    // Has children indicator
    const hasChildren = section.children.length > 0;
    const expandIcon = hasChildren
      ? '<span class="expand-icon">▼</span>'
      : '<span class="expand-icon empty"></span>';

    sectionElement.innerHTML = `
      ${expandIcon}
      <span class="section-icon">${icon}</span>
      <span class="section-name">${section.name}</span>
      <span class="section-type">${section.type}</span>
    `;

    // Add state classes
    if (section.selected) {
      sectionElement.classList.add("selected");
    }
    if (section.highlighted) {
      sectionElement.classList.add("highlighted");
    }

    // Event listeners
    sectionElement.addEventListener("click", (e) => {
      e.stopPropagation();
      this.handleSectionClick(section.id, e.ctrlKey || e.metaKey);
    });

    sectionElement.addEventListener("mouseenter", () => {
      this.stateManager.highlightSection(section.id);
    });

    sectionElement.addEventListener("mouseleave", () => {
      this.stateManager.dehighlightSection(section.id);
    });

    parentElement.appendChild(sectionElement);

    // Render children
    if (this.model && hasChildren) {
      section.children.forEach((childId) => {
        const childSection = this.model!.sections.get(childId);
        if (childSection) {
          this.renderSection(childSection, parentElement, depth + 1);
        }
      });
    }
  }

  private getSectionIcon(type: string): string {
    switch (type) {
      case "assembly":
        return "📦";
      case "part":
        return "🔧";
      case "mesh":
        return "▲";
      case "group":
        return "📁";
      default:
        return "•";
    }
  }

  private handleSectionClick(sectionId: string, multiSelect: boolean): void {
    const state = this.stateManager.getState();
    const isSelected =
      state.selectionState.selectedSectionIds.includes(sectionId);

    if (isSelected && !multiSelect) {
      this.stateManager.deselectSection(sectionId);
    } else {
      this.stateManager.selectSection(sectionId, multiSelect);
    }
  }
}
