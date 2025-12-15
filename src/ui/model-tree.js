/**
 * Model Tree Component
 *
 * Displays hierarchical model structure with interactive navigation.
 * Follows component-based architecture with clean separation of concerns.
 */

export class ModelTreeComponent {
  constructor(container, eventBus) {
    this.container = container;
    this.eventBus = eventBus;
    this.expandedNodes = new Set();
    this.hoverDebounceTimer = null;
    this.lastHoveredSection = null;
  }

  /**
   * Renders the model tree
   */
  render(
    sections,
    selectedIds = [],
    highlightedIds = [],
    expandedIds = new Set()
  ) {
    this.expandedNodes = expandedIds;
    this.container.innerHTML = "";

    if (!sections || sections.length === 0) {
      this.renderEmptyState();
      return;
    }

    const treeContainer = document.createElement("div");
    treeContainer.className = "tree-container";

    sections.forEach((section) => {
      const node = this.createTreeNode(section, selectedIds, highlightedIds);
      treeContainer.appendChild(node);
    });

    this.container.appendChild(treeContainer);
  }

  /**
   * Creates a tree node element
   */
  createTreeNode(section, selectedIds, highlightedIds) {
    const nodeDiv = document.createElement("div");
    nodeDiv.className = "tree-node";
    nodeDiv.dataset.sectionId = section.id;

    // Node content
    const contentDiv = document.createElement("div");
    contentDiv.className = "tree-node-content";

    if (selectedIds.includes(section.id)) {
      contentDiv.classList.add("selected");
    }

    if (highlightedIds.includes(section.id)) {
      contentDiv.classList.add("highlighted");
    }

    // Toggle button (if has children)
    if (section.children.length > 0) {
      const toggle = document.createElement("span");
      toggle.className = "tree-toggle";
      if (this.expandedNodes.has(section.id)) {
        toggle.classList.add("expanded");
      }
      toggle.innerHTML = "▶";
      toggle.onclick = (e) => {
        e.stopPropagation();
        this.eventBus.emit("tree:toggle", { sectionId: section.id });
      };
      contentDiv.appendChild(toggle);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "tree-toggle";
      contentDiv.appendChild(spacer);
    }

    // Icon
    const icon = document.createElement("span");
    icon.className = "tree-icon";
    icon.innerHTML = section.type === "assembly" ? "📦" : "⬡";
    contentDiv.appendChild(icon);

    // Label
    const label = document.createElement("span");
    label.className = "tree-label";
    label.textContent = section.name;
    label.title = section.name;
    contentDiv.appendChild(label);

    contentDiv.onclick = () => {
      this.eventBus.emit("tree:select", { sectionId: section.id });
    };

    contentDiv.onmouseenter = () => {
      // Debounce hover events to reduce frequency for large models
      if (this.hoverDebounceTimer) {
        clearTimeout(this.hoverDebounceTimer);
      }
      this.hoverDebounceTimer = setTimeout(() => {
        if (this.lastHoveredSection !== section.id) {
          this.lastHoveredSection = section.id;
          this.eventBus.emit("tree:hover", {
            sectionId: section.id,
            hover: true,
          });
        }
      }, 50); // 50ms debounce
    };

    contentDiv.onmouseleave = () => {
      if (this.hoverDebounceTimer) {
        clearTimeout(this.hoverDebounceTimer);
      }
      this.hoverDebounceTimer = setTimeout(() => {
        this.lastHoveredSection = null;
        this.eventBus.emit("tree:hover", {
          sectionId: section.id,
          hover: false,
        });
      }, 50); // 50ms debounce
    };

    nodeDiv.appendChild(contentDiv);

    // Children
    if (section.children.length > 0) {
      const childrenDiv = document.createElement("div");
      childrenDiv.className = "tree-children";

      if (!this.expandedNodes.has(section.id)) {
        childrenDiv.classList.add("collapsed");
      }

      section.children.forEach((child) => {
        const childNode = this.createTreeNode(
          child,
          selectedIds,
          highlightedIds
        );
        childrenDiv.appendChild(childNode);
      });

      nodeDiv.appendChild(childrenDiv);
    }

    return nodeDiv;
  }

  /**
   * Renders empty state
   */
  renderEmptyState() {
    this.container.innerHTML = `
            <div class="empty-state">
                <p>No model loaded</p>
                <p class="hint">Upload a 3D model to begin</p>
            </div>
        `;
  }

  /**
   * Updates selection highlight
   */
  updateSelection(selectedIds) {
    this.container.querySelectorAll(".tree-node-content").forEach((node) => {
      node.classList.remove("selected");
    });

    selectedIds.forEach((id) => {
      const node = this.container.querySelector(
        `[data-section-id="${id}"] .tree-node-content`
      );
      if (node) {
        node.classList.add("selected");
      }
    });
  }

  /**
   * Updates highlight state
   */
  updateHighlight(highlightedIds) {
    this.container.querySelectorAll(".tree-node-content").forEach((node) => {
      node.classList.remove("highlighted");
    });

    highlightedIds.forEach((id) => {
      const node = this.container.querySelector(
        `[data-section-id="${id}"] .tree-node-content`
      );
      if (node) {
        node.classList.add("highlighted");
      }
    });
  }
}
