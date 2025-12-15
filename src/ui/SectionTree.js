/**
 * Section Tree UI Component
 * Displays hierarchical model structure
 */

import { traverseNodes } from "../core/modelUtils.js";
import { selectNodes, focusNode } from "../state/actions.js";

export class SectionTree {
  constructor(container) {
    this.container = container;
    this.currentModel = null;
    this.expandedNodes = new Set();
  }

  /**
   * Renders the tree for a model
   * @param {Model3D} model - Model to render
   */
  render(model) {
    this.currentModel = model;
    this.container.innerHTML = "";

    if (!model || !model.root) {
      this.container.innerHTML = '<p class="empty-message">No model loaded</p>';
      return;
    }

    const treeElement = this.createTreeNode(model.root, 0);
    this.container.appendChild(treeElement);
  }

  /**
   * Creates a tree node element
   * @param {ModelNode} node - Node to create element for
   * @param {number} depth - Tree depth
   * @returns {HTMLElement}
   */
  createTreeNode(node, depth) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = this.expandedNodes.has(node.id);

    const nodeElement = document.createElement("div");
    nodeElement.className = "tree-node";
    nodeElement.dataset.nodeId = node.id;
    nodeElement.style.paddingLeft = `${depth * 16}px`;

    // Node header
    const header = document.createElement("div");
    header.className = "tree-node-header";

    // Expand/collapse toggle
    if (hasChildren) {
      const toggle = document.createElement("span");
      toggle.className = `tree-toggle ${isExpanded ? "expanded" : ""}`;
      toggle.textContent = isExpanded ? "▼" : "▶";
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        this.toggleNode(node.id);
      });
      header.appendChild(toggle);
    } else {
      const spacer = document.createElement("span");
      spacer.className = "tree-toggle-spacer";
      header.appendChild(spacer);
    }

    // Node icon
    const icon = document.createElement("span");
    icon.className = "tree-icon";
    icon.textContent = this.getNodeIcon(node.type);
    header.appendChild(icon);

    // Node label
    const label = document.createElement("span");
    label.className = "tree-label";
    label.textContent = node.name;
    header.appendChild(label);

    // Click handler
    header.addEventListener("click", () => {
      this.onNodeClick(node);
    });

    nodeElement.appendChild(header);

    // Children container
    if (hasChildren && isExpanded) {
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-children";

      node.children.forEach((child) => {
        const childElement = this.createTreeNode(child, depth + 1);
        childrenContainer.appendChild(childElement);
      });

      nodeElement.appendChild(childrenContainer);
    }

    return nodeElement;
  }

  /**
   * Gets icon for node type
   * @param {string} type - Node type
   * @returns {string}
   */
  getNodeIcon(type) {
    const icons = {
      root: "📦",
      group: "📁",
      mesh: "▣",
      part: "⬚",
      assembly: "⬡",
    };
    return icons[type] || "○";
  }

  /**
   * Toggles node expansion
   * @param {string} nodeId - Node ID to toggle
   */
  toggleNode(nodeId) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }

    // Re-render tree
    this.render(this.currentModel);
  }

  /**
   * Handles node click
   * @param {ModelNode} node - Clicked node
   */
  onNodeClick(node) {
    selectNodes([node.id]);
    focusNode(node.id);
  }

  /**
   * Highlights nodes in the tree with smooth transitions
   * @param {string[]} nodeIds - Node IDs to highlight
   */
  highlightNodes(nodeIds) {
    // Get all headers for dehighlight animation
    const allHeaders = this.container.querySelectorAll(
      ".tree-node-header.selected, .tree-node-header.focused"
    );

    // Apply dehighlight animation to previously selected nodes
    allHeaders.forEach((el) => {
      if (
        !nodeIds.some(
          (id) => el.closest("[data-node-id]")?.dataset.nodeId === id
        )
      ) {
        el.classList.add("dehighlight");

        // Remove dehighlight class after animation completes
        setTimeout(() => {
          el.classList.remove("selected", "focused", "dehighlight");
        }, 400);
      }
    });

    // Remove immediate highlights from non-selected nodes
    this.container.querySelectorAll(".tree-node-header").forEach((el) => {
      const nodeId = el.closest("[data-node-id]")?.dataset.nodeId;
      if (!nodeIds.includes(nodeId)) {
        // Don't remove classes immediately if dehighlight is active
        if (!el.classList.contains("dehighlight")) {
          el.classList.remove("selected", "focused");
        }
      }
    });

    // Apply new highlights with smooth animation
    nodeIds.forEach((nodeId) => {
      const nodeElement = this.container.querySelector(
        `[data-node-id="${nodeId}"]`
      );
      if (nodeElement) {
        const header = nodeElement.querySelector(".tree-node-header");
        if (header) {
          // Remove dehighlight if present
          header.classList.remove("dehighlight");

          // Add selected class - CSS animation will handle the visual effect
          requestAnimationFrame(() => {
            header.classList.add("selected");
          });
        }
      }
    });
  }

  /**
   * Expands all nodes
   */
  expandAll() {
    if (!this.currentModel) return;

    traverseNodes(this.currentModel.root, (node) => {
      this.expandedNodes.add(node.id);
    });

    this.render(this.currentModel);
  }

  /**
   * Collapses all nodes
   */
  collapseAll() {
    this.expandedNodes.clear();
    this.render(this.currentModel);
  }

  /**
   * Clears the tree
   */
  clear() {
    this.container.innerHTML = "";
    this.currentModel = null;
    this.expandedNodes.clear();
  }
}
