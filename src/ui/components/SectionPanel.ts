import { UIComponent } from "./UIComponent";
import { ModelSection } from "@domain/types";

interface SectionPanelProps {
  sections: ModelSection[];
  onSectionSelect: (sectionId: string, multi: boolean) => void;
  onSectionFocus: (sectionId: string) => void;
}

/**
 * Section Panel Component
 * Displays model hierarchy and allows section selection
 */
export class SectionPanel extends UIComponent {
  private props: SectionPanelProps;

  constructor(props: SectionPanelProps) {
    super("div", "section-panel");
    this.props = props;
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="section-panel-header">
        <h3>Model Structure</h3>
        <button class="btn-close" id="toggle-panel">−</button>
      </div>
      <div class="section-panel-content">
        <div class="section-tree" id="section-tree"></div>
      </div>
    `;

    this.renderSectionTree();
    this.attachEventListeners();
  }

  private renderSectionTree(): void {
    const treeContainer = this.element.querySelector("#section-tree");
    if (!treeContainer) return;

    treeContainer.innerHTML = "";

    const rootSections = this.props.sections.filter((s) => !s.parentId);

    if (rootSections.length === 0) {
      treeContainer.innerHTML =
        '<div class="no-sections">No sections available</div>';
      return;
    }

    const ul = document.createElement("ul");
    ul.className = "section-list";

    rootSections.forEach((section) => {
      const li = this.createSectionNode(section);
      ul.appendChild(li);
    });

    treeContainer.appendChild(ul);
  }

  private createSectionNode(section: ModelSection): HTMLLIElement {
    const li = document.createElement("li");
    li.className = "section-item";
    li.dataset.sectionId = section.id;

    const content = document.createElement("div");
    content.className = "section-content";

    if (section.selected) {
      content.classList.add("selected");
    }

    if (section.highlighted) {
      content.classList.add("highlighted");
    }

    const hasChildren = section.childIds.length > 0;

    content.innerHTML = `
      <span class="section-expand">${hasChildren ? "▶" : ""}</span>
      <span class="section-icon">${this.getSectionIcon(section)}</span>
      <span class="section-name">${section.name}</span>
      <button class="btn-focus" data-section-id="${section.id}">🎯</button>
    `;

    li.appendChild(content);

    // Add children
    if (hasChildren) {
      const childUl = document.createElement("ul");
      childUl.className = "section-list nested";
      childUl.style.display = "none";

      section.childIds.forEach((childId) => {
        const childSection = this.props.sections.find((s) => s.id === childId);
        if (childSection) {
          const childLi = this.createSectionNode(childSection);
          childUl.appendChild(childLi);
        }
      });

      li.appendChild(childUl);
    }

    return li;
  }

  private getSectionIcon(section: ModelSection): string {
    if (section.childIds.length > 0) {
      return "📦";
    }
    return "🔹";
  }

  private attachEventListeners(): void {
    // Toggle panel
    const toggleBtn = this.element.querySelector("#toggle-panel");
    toggleBtn?.addEventListener("click", () => {
      this.togglePanel();
    });

    // Section click
    this.element.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      // Focus button
      if (target.classList.contains("btn-focus")) {
        const sectionId = target.dataset.sectionId;
        if (sectionId) {
          this.props.onSectionFocus(sectionId);
        }
        return;
      }

      // Section content click
      const sectionContent = target.closest(".section-content") as HTMLElement;
      if (sectionContent) {
        const li = sectionContent.parentElement as HTMLLIElement;
        const sectionId = li.dataset.sectionId;

        if (sectionId) {
          const multi = e.ctrlKey || e.metaKey;
          this.props.onSectionSelect(sectionId, multi);
        }
        return;
      }

      // Expand/collapse
      if (target.classList.contains("section-expand")) {
        const li = target.closest(".section-item") as HTMLLIElement;
        const nestedList = li?.querySelector(".nested") as HTMLElement;

        if (nestedList) {
          const isVisible = nestedList.style.display !== "none";
          nestedList.style.display = isVisible ? "none" : "block";
          target.textContent = isVisible ? "▶" : "▼";
        }
      }
    });
  }

  private togglePanel(): void {
    const content = this.element.querySelector(
      ".section-panel-content"
    ) as HTMLElement;
    const toggleBtn = this.element.querySelector("#toggle-panel");

    if (content && toggleBtn) {
      const isVisible = content.style.display !== "none";
      content.style.display = isVisible ? "none" : "";
      toggleBtn.textContent = isVisible ? "+" : "−";
    }
  }

  update(data: Partial<SectionPanelProps>): void {
    if (data.sections) {
      this.props.sections = data.sections;
      this.renderSectionTree();
    }
  }

  updateSectionState(
    sectionId: string,
    state: Partial<{ selected: boolean; highlighted: boolean }>
  ): void {
    const section = this.props.sections.find((s) => s.id === sectionId);
    if (!section) return;

    if (state.selected !== undefined) {
      section.selected = state.selected;
    }
    if (state.highlighted !== undefined) {
      section.highlighted = state.highlighted;
    }

    this.renderSectionTree();
  }
}
