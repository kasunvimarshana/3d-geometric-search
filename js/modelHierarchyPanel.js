/**
 * ModelHierarchyPanel - Displays model structure in hierarchical tree
 *
 * Features:
 * - Hierarchical display of all model parts (meshes, groups)
 * - Interactive selection with focus and highlight
 * - Nested structure visualization
 * - Click to focus on specific model sections
 * - Integration with existing viewer interaction
 * - Expandable/collapsible tree nodes
 *
 * @version 1.8.0
 */

class ModelHierarchyPanel {
  constructor(viewer, eventManager, eventBus) {
    this.viewer = viewer;
    this.eventManager = eventManager;
    this.eventBus = eventBus;

    // UI references
    this.panel = null;
    this.treeContainer = null;
    this.toggleButton = null;

    // State
    this.isOpen = false;
    this.currentModel = null;
    this.selectedNode = null;
    this.expandedNodes = new Set();

    // Model analysis cache
    this.modelHierarchy = null;
    this.nodeMap = new Map(); // Maps node IDs to Three.js objects
    this.objectToNode = new Map(); // Maps Three.js objects to node IDs
  }

  /**
   * Initialize the hierarchy panel
   */
  init() {
    try {
      this.createUI();
      this.setupEventHandlers();
      this.subscribeToEvents();

      console.log("ModelHierarchyPanel initialized successfully");
      return true;
    } catch (error) {
      console.error("ModelHierarchyPanel initialization error:", error);
      return false;
    }
  }

  /**
   * Create the UI structure
   */
  createUI() {
    // Create panel container
    this.panel = document.createElement("div");
    this.panel.className = "model-hierarchy-panel";
    this.panel.id = "modelHierarchyPanel";

    // Create toggle button
    this.toggleButton = document.createElement("button");
    this.toggleButton.className = "hierarchy-toggle";
    this.toggleButton.id = "hierarchyToggle";
    this.toggleButton.innerHTML = "&#x1F4CB;"; // 📋 clipboard icon
    this.toggleButton.title = "Model Hierarchy";

    // Create panel content
    const content = document.createElement("div");
    content.className = "hierarchy-content";

    const header = document.createElement("div");
    header.className = "hierarchy-header";

    const title = document.createElement("h3");
    title.textContent = "Model Structure";
    header.appendChild(title);

    // Add controls container (search + refresh)
    const controls = document.createElement("div");
    controls.className = "hierarchy-controls";

    // Add search box
    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.className = "hierarchy-search";
    searchBox.placeholder = "Search nodes...";
    searchBox.id = "hierarchySearch";

    this.eventManager.add(
      searchBox,
      "input",
      (e) => {
        this.filterNodes(e.target.value);
      },
      { id: "hierarchy-search" }
    );

    controls.appendChild(searchBox);

    // Add refresh button
    const refreshBtn = document.createElement("button");
    refreshBtn.className = "hierarchy-refresh-btn";
    refreshBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.65 2.35A7.5 7.5 0 0 0 2.07 6.5h1.5A6 6 0 1 1 2.5 8.5v-2h-1v3.5h3.5v-1H3.03a6.5 6.5 0 1 0-.5-2.5H1.07a7.5 7.5 0 0 1 12.58-4.15l1.06-1.06.35.35v3h-3l.35-.35 1.24-1.24z"/>
      </svg>
      Refresh
    `;
    refreshBtn.title = "Reload and sync hierarchy with model";

    this.eventManager.add(
      refreshBtn,
      "click",
      () => {
        this.refreshHierarchy();
      },
      { id: "hierarchy-refresh" }
    );

    controls.appendChild(refreshBtn);
    header.appendChild(controls);

    // Add statistics bar
    const statsBar = document.createElement("div");
    statsBar.className = "hierarchy-stats";
    statsBar.id = "hierarchyStats";
    statsBar.innerHTML = '<span class="stats-item">Ready</span>';
    header.appendChild(statsBar);

    // Add focus mode indicator
    const focusIndicator = document.createElement("div");
    focusIndicator.className = "hierarchy-focus-indicator";
    focusIndicator.id = "hierarchyFocusIndicator";
    focusIndicator.innerHTML =
      '<span class="focus-icon">📷</span> Auto-Focus Active';
    focusIndicator.style.display = "none";
    header.appendChild(focusIndicator);

    this.treeContainer = document.createElement("div");
    this.treeContainer.className = "hierarchy-tree";
    this.treeContainer.innerHTML =
      '<p class="hierarchy-empty">No model loaded</p>';

    content.appendChild(header);
    content.appendChild(this.treeContainer);

    this.panel.appendChild(this.toggleButton);
    this.panel.appendChild(content);

    // Add to viewer container
    const viewerSection = document.querySelector(".viewer-section");
    if (viewerSection) {
      viewerSection.appendChild(this.panel);
    } else {
      console.warn("Viewer section not found, appending to body");
      document.body.appendChild(this.panel);
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Toggle button
    this.eventManager.add(
      this.toggleButton,
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.togglePanel();
      },
      { id: "hierarchy-toggle" }
    );

    // ESC to close
    this.eventManager.add(
      document,
      "keydown",
      (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.closePanel();
        }

        // Arrow key navigation when panel is open
        if (this.isOpen && this.selectedNode) {
          if (e.key === "Enter") {
            // Enter key focuses on selected node
            e.preventDefault();
            this.focusOnNode(this.selectedNode);
          } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            // Arrow keys for navigation
            e.preventDefault();
            this.navigateWithArrowKeys(e.key);
          }
        }
      },
      { id: "hierarchy-escape" }
    );
  }

  /**
   * Subscribe to viewer events
   */
  subscribeToEvents() {
    // Listen for model loading
    this.eventBus.on("model:loaded", (data) => {
      if (this.viewer.currentModel) {
        this.analyzeModel(this.viewer.currentModel, data.name);
        this.updateStats("synced");
      } else {
        this.clearHierarchy();
      }
    });

    // Listen for model removal/clear
    this.eventBus.on("model:removed", () => {
      this.clearHierarchy();
      this.updateStats("cleared");
    });

    // Listen for model clicks to sync selection with automatic focus
    if (this.viewer.container) {
      this.eventManager.add(
        this.viewer.container,
        "modelClick",
        (e) => {
          if (e.detail && e.detail.object) {
            // Seamless sync from viewer to hierarchy
            this.selectObjectInTree(e.detail.object);

            // Emit for external listeners
            this.eventBus.emit("viewer:object-selected", {
              object: e.detail.object,
              timestamp: Date.now(),
            });
          }
        },
        { id: "hierarchy-model-click" }
      );
    }

    // Listen for external focus requests
    this.eventBus.on("hierarchy:focus-request", (data) => {
      if (data.nodeId) {
        this.focusOnNode(data.nodeId);
      } else if (data.object) {
        const nodeId = this.objectToNode.get(data.object);
        if (nodeId) {
          this.focusOnNode(nodeId);
        }
      }
    });

    // Listen for viewer focus events (integration with default model focus)
    this.eventBus.on("viewer:focus-on-model", () => {
      // When entire model is focused, select root node without camera movement
      const rootNodeId = Array.from(this.nodeMap.keys()).find(
        (id) => !id.includes("/")
      );
      if (rootNodeId && !this.isOpen) {
        this.openPanel();
      }
      if (rootNodeId) {
        this.selectNode(rootNodeId, {
          fromViewer: true,
          autoFocus: false,
          scrollIntoView: true,
          openPanel: false,
        });
      }
    });

    // Listen for zoom changes to maintain highlight state
    this.eventBus.on("viewer:zoom-changed", (data) => {
      // Re-highlight selected node to maintain visibility during zoom
      if (this.selectedNode && data.selectedObject) {
        const nodeElement = this.treeContainer.querySelector(
          `[data-node-id="${this.selectedNode}"] > .node-content`
        );
        if (nodeElement && nodeElement.classList.contains("selected")) {
          // Add a subtle pulse to indicate zoom is maintaining focus
          nodeElement.style.transition = "box-shadow 0.3s ease";
          nodeElement.style.boxShadow = "0 0 20px rgba(102, 126, 234, 0.8)";

          setTimeout(() => {
            nodeElement.style.boxShadow = "";
          }, 500);
        }
      }
    });

    // Listen for fullscreen changes to persist highlights
    this.eventBus.on("viewer:fullscreen-changed", (data) => {
      // Maintain selected node highlight during fullscreen transitions
      if (this.selectedNode) {
        setTimeout(() => {
          const nodeElement = this.treeContainer.querySelector(
            `[data-node-id="${this.selectedNode}"] > .node-content`
          );
          if (nodeElement) {
            // Re-apply selected class to ensure visibility
            nodeElement.classList.add("selected");

            // Show temporary focus indicator
            this.showFocusIndicator();
            setTimeout(() => {
              this.hideFocusIndicator();
            }, 1000);
          }
        }, 200);
      }
    });

    // Listen for view reset to clear selections
    this.eventBus.on("viewer:view-reset", () => {
      // Clear any active selections and visual feedback
      this.clearSelection();

      console.log("[ModelHierarchy] Responded to view reset");
    });

    // Start state monitoring if model is loaded
    this.startStateMonitoring();
  }

  /**
   * Start monitoring model state changes
   */
  startStateMonitoring() {
    // Monitor visibility and structural changes
    if (this.stateMonitorInterval) {
      clearInterval(this.stateMonitorInterval);
    }

    this.stateMonitorInterval = setInterval(() => {
      if (this.currentModel && this.modelHierarchy) {
        this.checkStateChanges();
      }
    }, 1000); // Check every second
  }

  /**
   * Check for state changes in model objects
   */
  checkStateChanges() {
    let changesDetected = false;

    this.nodeMap.forEach((object, nodeId) => {
      const nodeElement = this.treeContainer.querySelector(
        `[data-node-id="${nodeId}"]`
      );

      if (nodeElement && object) {
        const wasVisible = !nodeElement.classList.contains("object-hidden");
        const isVisible = object.visible;

        // Update visibility state if changed
        if (wasVisible !== isVisible) {
          if (isVisible) {
            nodeElement.classList.remove("object-hidden");
          } else {
            nodeElement.classList.add("object-hidden");
          }
          changesDetected = true;
        }
      }
    });

    if (changesDetected) {
      this.updateStats("updated");
    }
  }

  /**
   * Clear current selection and visual feedback
   */
  clearSelection() {
    // Clear visual selection in UI
    const prevSelected = this.treeContainer.querySelector(
      ".node-content.selected"
    );
    if (prevSelected) {
      prevSelected.classList.remove("selected");
      prevSelected.classList.remove("focused");
      prevSelected.classList.remove("focus-active");
      prevSelected.classList.remove("highlight-pulse");
    }

    // Clear all focused states
    this.treeContainer
      .querySelectorAll(".node-content.focused")
      .forEach((node) => {
        node.classList.remove("focused");
      });

    // Hide focus indicator
    this.hideFocusIndicator();

    // Clear selection state
    this.selectedNode = null;

    // Emit event
    this.eventBus.emit("hierarchy:selection-cleared", {
      timestamp: Date.now(),
    });

    console.log("[ModelHierarchy] Selection cleared");
  }

  /**
   * Clear hierarchy display
   */
  clearHierarchy() {
    this.currentModel = null;
    this.modelHierarchy = null;
    this.nodeMap.clear();
    this.objectToNode.clear();
    this.expandedNodes.clear();
    this.selectedNode = null;

    this.treeContainer.innerHTML =
      '<p class="hierarchy-empty">No model loaded</p>';

    console.log("[ModelHierarchy] Hierarchy cleared");
  }

  /**
   * Update statistics display
   */
  updateStats(status = "ready") {
    const statsBar = document.getElementById("hierarchyStats");
    if (!statsBar) return;

    const nodeCount = this.nodeMap.size;
    const visibleCount = Array.from(this.nodeMap.values()).filter(
      (obj) => obj.visible
    ).length;
    const hiddenCount = nodeCount - visibleCount;

    const statusMessages = {
      synced: "✓ Synced",
      updated: "↻ Updated",
      cleared: "○ Cleared",
      refreshing: "⟳ Refreshing...",
      ready: "● Ready",
    };

    const statusText = statusMessages[status] || statusMessages["ready"];

    if (nodeCount > 0) {
      statsBar.innerHTML = `
        <span class="stats-status ${status}">${statusText}</span>
        <span class="stats-item">Nodes: ${nodeCount}</span>
        <span class="stats-item">Visible: ${visibleCount}</span>
        ${
          hiddenCount > 0
            ? `<span class="stats-item stats-warning">Hidden: ${hiddenCount}</span>`
            : ""
        }
      `;
    } else {
      statsBar.innerHTML = `<span class="stats-status ${status}">${statusText}</span>`;
    }
  }

  /**
   * Refresh hierarchy - reload and re-sync with model
   */
  refreshHierarchy() {
    if (!this.currentModel) {
      console.log("[ModelHierarchy] No model to refresh");
      return;
    }

    this.updateStats("refreshing");
    console.log("[ModelHierarchy] Refreshing hierarchy...");

    // Store current expanded state
    const expandedNodeIds = Array.from(this.expandedNodes);
    const selectedNodeId = this.selectedNode;

    // Re-analyze model
    const modelName = this.currentModel.userData?.name || "model";
    this.analyzeModel(this.currentModel, modelName);

    // Restore expanded state
    setTimeout(() => {
      expandedNodeIds.forEach((nodeId) => {
        const listItem = this.treeContainer.querySelector(
          `[data-node-id="${nodeId}"]`
        );
        if (listItem) {
          this.expandedNodes.add(nodeId);
          listItem.classList.add("expanded");
        }
      });

      // Restore selection
      if (selectedNodeId) {
        this.selectNode(selectedNodeId);
      }

      this.updateStats("synced");
      console.log("[ModelHierarchy] Refresh complete");
    }, 100);
  }

  /**
   * Expand all parent nodes for a given node ID
   */
  expandParentNodes(nodeId) {
    const parts = nodeId.split("/");
    let currentPath = "";

    // Build and expand each parent level
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath = parts.slice(0, i + 1).join("/");

      const listItem = this.treeContainer.querySelector(
        `[data-node-id="${currentPath}"]`
      );

      if (listItem && !this.expandedNodes.has(currentPath)) {
        this.expandedNodes.add(currentPath);
        listItem.classList.add("expanded");
      }
    }
  }

  /**
   * Highlight object in hierarchy with enhanced visual feedback
   */
  highlightInHierarchy(object) {
    const nodeId = this.objectToNode.get(object);
    if (!nodeId) return;

    // Expand all parent nodes
    let currentNodeId = nodeId;
    const nodesToExpand = [];

    // Find all parent nodes by traversing up
    while (currentNodeId) {
      const parts = currentNodeId.split("/");
      if (parts.length > 1) {
        parts.pop();
        currentNodeId = parts.join("/");
        nodesToExpand.unshift(currentNodeId);
      } else {
        break;
      }
    }

    // Expand parent nodes
    nodesToExpand.forEach((parentId) => {
      const listItem = this.treeContainer.querySelector(
        `[data-node-id="${parentId}"]`
      );
      if (listItem) {
        this.expandedNodes.add(parentId);
        listItem.classList.add("expanded");
      }
    });

    // Scroll to node
    const nodeElement = this.treeContainer.querySelector(
      `[data-node-id="${nodeId}"]`
    );
    if (nodeElement) {
      nodeElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add enhanced highlight effect with multiple visual states
      const nodeContent = nodeElement.querySelector(".node-content");
      if (nodeContent) {
        // Add both highlight-pulse and focus-active for stronger effect
        nodeContent.classList.add("highlight-pulse", "focused");

        // Show focus indicator in header
        this.showFocusIndicator();

        setTimeout(() => {
          nodeContent.classList.remove("highlight-pulse");
          this.hideFocusIndicator();
        }, 2000); // Extended duration for better visibility

        // Keep focused state slightly longer
        setTimeout(() => {
          nodeContent.classList.remove("focused");
        }, 3000);
      }
    }
  }

  /**
   * Analyze model structure
   */
  analyzeModel(model, modelName = "Model") {
    this.currentModel = model;
    this.currentModel.userData = this.currentModel.userData || {};
    this.currentModel.userData.name = modelName;

    this.nodeMap.clear();
    this.objectToNode.clear();

    // Build hierarchy
    const hierarchy = this.buildHierarchy(model, modelName);
    this.modelHierarchy = hierarchy;

    // Render tree
    this.renderTree(hierarchy);

    // Calculate statistics
    const stats = this.calculateStats(hierarchy);
    console.log("[ModelHierarchy] Analysis complete:", stats);

    // Auto-expand root node on first load
    if (hierarchy && hierarchy.id) {
      requestAnimationFrame(() => {
        const rootElement = this.treeContainer.querySelector(
          `[data-node-id="${hierarchy.id}"]`
        );
        if (rootElement && !this.expandedNodes.has(hierarchy.id)) {
          this.expandedNodes.add(hierarchy.id);
          rootElement.classList.add("expanded");
        }

        // Update statistics
        this.updateStats("synced");
      });
    }

    // Emit event
    this.eventBus.emit("hierarchy:analyzed", {
      hierarchy,
      stats,
    });
  }

  /**
   * Build hierarchy from Three.js object
   */
  buildHierarchy(object, name = null, depth = 0) {
    const nodeId = this.generateNodeId();
    const nodeName = name || object.name || this.getDefaultName(object);

    const node = {
      id: nodeId,
      name: nodeName,
      type: this.getObjectType(object),
      object: object,
      depth: depth,
      children: [],
      hasGeometry: object.geometry !== undefined,
      visible: object.visible,
      meshCount: 0,
      vertexCount: 0,
    };

    // Store mappings
    this.nodeMap.set(nodeId, object);
    this.objectToNode.set(object, nodeId);

    // Get geometry info
    if (object.geometry) {
      node.vertexCount = object.geometry.attributes.position?.count || 0;
      node.meshCount = 1;
    }

    // Process children recursively
    if (object.children && object.children.length > 0) {
      object.children.forEach((child, index) => {
        const childNode = this.buildHierarchy(
          child,
          child.name || `${nodeName}_${index}`,
          depth + 1
        );
        node.children.push(childNode);

        // Accumulate counts
        node.meshCount += childNode.meshCount;
        node.vertexCount += childNode.vertexCount;
      });
    }

    return node;
  }

  /**
   * Render tree in UI
   */
  renderTree(hierarchy) {
    this.treeContainer.innerHTML = "";

    if (!hierarchy) {
      this.treeContainer.innerHTML =
        '<p class="hierarchy-empty">No model loaded</p>';
      return;
    }

    const tree = document.createElement("ul");
    tree.className = "hierarchy-list";

    this.renderNode(hierarchy, tree);

    this.treeContainer.appendChild(tree);
  }

  /**
   * Render individual node
   */
  renderNode(node, parentElement) {
    const listItem = document.createElement("li");
    listItem.className = "hierarchy-node";
    listItem.setAttribute("data-node-id", node.id);
    listItem.setAttribute("data-depth", node.depth);

    // Add visibility state class
    if (!node.visible) {
      listItem.classList.add("object-hidden");
    }

    // Node content wrapper
    const nodeContent = document.createElement("div");
    nodeContent.className = "node-content";
    nodeContent.setAttribute("tabindex", "0"); // Make focusable for keyboard navigation
    nodeContent.setAttribute("role", "button");
    nodeContent.setAttribute("aria-label", `${node.type}: ${node.name}`);

    // Expand/collapse button for nodes with children
    if (node.children.length > 0) {
      const expandBtn = document.createElement("button");
      expandBtn.className = "node-expand";
      expandBtn.innerHTML = "▸";
      expandBtn.title = "Expand/Collapse";

      this.eventManager.add(
        expandBtn,
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleNodeExpansion(node.id, listItem);
        },
        { id: `hierarchy-expand-${node.id}` }
      );

      nodeContent.appendChild(expandBtn);
      listItem.classList.add("has-children");
    } else {
      const spacer = document.createElement("span");
      spacer.className = "node-spacer";
      nodeContent.appendChild(spacer);
    }

    // Node icon
    const icon = document.createElement("span");
    icon.className = "node-icon";
    icon.innerHTML = this.getNodeIcon(node);
    nodeContent.appendChild(icon);

    // Node label
    const label = document.createElement("span");
    label.className = "node-label";
    label.textContent = node.name;
    label.title = `${node.type}: ${node.name}\nClick to focus and navigate`;

    // Add info badge
    if (node.meshCount > 0) {
      const badge = document.createElement("span");
      badge.className = "node-badge";
      badge.textContent =
        node.meshCount === 1 ? "1 mesh" : `${node.meshCount} meshes`;
      badge.title = `${node.vertexCount.toLocaleString()} vertices`;
      label.appendChild(badge);
    }

    // Add visibility indicator
    if (!node.visible) {
      const hiddenIndicator = document.createElement("span");
      hiddenIndicator.className = "node-hidden-indicator";
      hiddenIndicator.textContent = "👁️";
      hiddenIndicator.title = "Hidden";
      label.appendChild(hiddenIndicator);
    }

    nodeContent.appendChild(label);

    // Click handler for automatic focus (seamless navigation)
    this.eventManager.add(
      nodeContent,
      "click",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Automatically focus on click for seamless navigation
        this.focusOnNode(node.id);
      },
      { id: `hierarchy-select-${node.id}` }
    );

    // Keyboard handler for accessibility (Enter or Space)
    this.eventManager.add(
      nodeContent,
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          this.focusOnNode(node.id);
        }
      },
      { id: `hierarchy-keyboard-${node.id}` }
    );

    // Double-click to focus
    this.eventManager.add(
      nodeContent,
      "dblclick",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.focusOnNode(node.id);
      },
      { id: `hierarchy-focus-${node.id}` }
    );

    listItem.appendChild(nodeContent);

    // Children container
    if (node.children.length > 0) {
      const childrenList = document.createElement("ul");
      childrenList.className = "hierarchy-children";

      node.children.forEach((child) => {
        this.renderNode(child, childrenList);
      });

      listItem.appendChild(childrenList);
    }

    parentElement.appendChild(listItem);
  }

  /**
   * Toggle node expansion
   */
  toggleNodeExpansion(nodeId, listItem) {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
      listItem.classList.remove("expanded");
    } else {
      this.expandedNodes.add(nodeId);
      listItem.classList.add("expanded");
    }
  }

  /**
   * Select node in tree with automatic focus management
   */
  selectNode(nodeId, options = {}) {
    const {
      fromViewer = false,
      autoFocus = false,
      scrollIntoView = true,
      openPanel = true,
    } = options;

    // Automatically open panel if closed (unless from viewer click)
    if (openPanel && !this.isOpen && !fromViewer) {
      this.openPanel();
    }

    // Clear previous selection
    const prevSelected = this.treeContainer.querySelector(
      ".node-content.selected"
    );
    if (prevSelected) {
      prevSelected.classList.remove("selected");
      prevSelected.classList.remove("focused");
    }

    // Select new node
    const nodeElement = this.treeContainer.querySelector(
      `[data-node-id="${nodeId}"] > .node-content`
    );

    if (nodeElement) {
      nodeElement.classList.add("selected");

      // Set DOM focus for keyboard navigation (unless from viewer)
      if (!fromViewer) {
        nodeElement.focus();
      }

      // Add focused class for enhanced visual feedback
      if (autoFocus || !fromViewer) {
        nodeElement.classList.add("focused");

        // Remove focused class after animation
        setTimeout(() => {
          nodeElement.classList.remove("focused");
        }, 2000);
      }

      this.selectedNode = nodeId;

      // Scroll into view with padding
      if (scrollIntoView) {
        requestAnimationFrame(() => {
          nodeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        });
      }

      // Highlight in viewer if not already from viewer
      if (!fromViewer) {
        const object = this.nodeMap.get(nodeId);
        if (object) {
          // Select in viewer
          if (object.isMesh && this.viewer.selectObject) {
            this.viewer.selectObject(object);
          }

          // Auto-focus if requested
          if (autoFocus && this.viewer.focusOnObject) {
            this.viewer.focusOnObject(object);
          }
        }
      }

      // Emit event
      this.eventBus.emit("hierarchy:node-selected", {
        nodeId,
        object: this.nodeMap.get(nodeId),
        fromViewer,
        autoFocus,
      });
    }
  }

  /**
   * Focus on node (zoom and center) with seamless navigation
   * @param {string} nodeId - Node identifier
   * @param {object} options - Focus options
   */
  focusOnNode(nodeId, options = {}) {
    const { fromViewer = false, smooth = true } = options;

    const object = this.nodeMap.get(nodeId);
    if (!object) {
      console.warn(
        `[ModelHierarchy] Cannot focus: object not found for node ${nodeId}`
      );
      return;
    }

    try {
      // Expand parent nodes for visibility
      this.expandParentNodes(nodeId);

      // Automatically open panel if closed
      if (!this.isOpen) {
        this.openPanel();
      }

      // Select in tree with focus enabled (only if not from viewer)
      if (!fromViewer) {
        this.selectNode(nodeId, {
          autoFocus: true,
          scrollIntoView: true,
          openPanel: false, // Already opened above
        });
      }

      // Focus on the specific object in viewer with smooth transition
      if (this.viewer.focusOnObject) {
        this.viewer.focusOnObject(object);
      }

      // Add visual feedback with smooth animation
      const nodeElement = this.treeContainer.querySelector(
        `[data-node-id="${nodeId}"] > .node-content`
      );
      if (nodeElement) {
        // Add focus-active class for enhanced visual feedback
        nodeElement.classList.add("focus-active");

        // Show focus indicator temporarily
        this.showFocusIndicator();

        // Smooth scroll into view
        if (smooth) {
          requestAnimationFrame(() => {
            nodeElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          });
        }

        // Remove class after animation completes
        setTimeout(() => {
          nodeElement.classList.remove("focus-active");
          this.hideFocusIndicator();
        }, 1500);
      }

      // Emit event
      this.eventBus.emit("hierarchy:node-focused", {
        nodeId,
        object,
        fromViewer,
        smooth,
        timestamp: Date.now(),
      });

      console.log(`[ModelHierarchy] Focused on node: ${nodeId}`);
    } catch (error) {
      console.error("[ModelHierarchy] Error focusing on node:", error);
    }
  }

  /**
   * Show focus indicator in panel header
   */
  showFocusIndicator() {
    const indicator = document.getElementById("hierarchyFocusIndicator");
    if (indicator) {
      indicator.style.display = "flex";
      indicator.classList.add("active");
    }
  }

  /**
   * Hide focus indicator in panel header
   */
  hideFocusIndicator() {
    const indicator = document.getElementById("hierarchyFocusIndicator");
    if (indicator) {
      indicator.style.display = "none";
      indicator.classList.remove("active");
    }
  }

  /**
   * Select object in tree (from viewer interaction) with seamless sync
   */
  selectObjectInTree(object) {
    const nodeId = this.objectToNode.get(object);
    if (!nodeId) {
      console.warn("[ModelHierarchy] Object not found in tree:", object);
      return;
    }

    // Automatically open panel for visibility
    if (!this.isOpen) {
      this.openPanel();
    }

    // Expand parent nodes to make selection visible
    this.expandParentNodes(nodeId);

    // Focus on the object (not just select) for seamless navigation
    if (this.viewer.focusOnObject) {
      this.viewer.focusOnObject(object);
    }

    // Select with viewer flag to prevent circular updates
    this.selectNode(nodeId, {
      fromViewer: true,
      autoFocus: false, // Already focused above
      scrollIntoView: true,
      openPanel: false, // Already opened above
    });

    // Highlight in hierarchy with enhanced feedback
    this.highlightInHierarchy(object);

    // Add focus-active visual feedback
    const nodeElement = this.treeContainer.querySelector(
      `[data-node-id="${nodeId}"] > .node-content`
    );
    if (nodeElement) {
      nodeElement.classList.add("focus-active");

      // Show focus indicator
      this.showFocusIndicator();

      setTimeout(() => {
        nodeElement.classList.remove("focus-active");
        this.hideFocusIndicator();
      }, 1500);
    }

    // Emit focus event (not just selection)
    this.eventBus.emit("hierarchy:node-focused", {
      nodeId,
      object,
      fromViewer: true,
      timestamp: Date.now(),
    });

    console.log(`[ModelHierarchy] Focused from viewer: ${nodeId}`);
  }

  /**
   * Toggle panel visibility
   */
  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  /**
   * Open panel
   */
  openPanel() {
    this.isOpen = true;
    this.panel.classList.add("open");
    this.eventBus.emit("hierarchy:opened");
  }

  /**
   * Close panel
   */
  closePanel() {
    this.isOpen = false;
    this.panel.classList.remove("open");
    this.eventBus.emit("hierarchy:closed");
  }

  /**
   * Navigate with arrow keys for keyboard accessibility
   */
  navigateWithArrowKeys(key) {
    if (!this.selectedNode) return;

    const allNodes = Array.from(this.nodeMap.keys());
    const currentIndex = allNodes.indexOf(this.selectedNode);

    if (currentIndex === -1) return;

    let targetIndex;
    if (key === "ArrowDown") {
      targetIndex = currentIndex + 1;
    } else if (key === "ArrowUp") {
      targetIndex = currentIndex - 1;
    }

    // Wrap around
    if (targetIndex >= allNodes.length) {
      targetIndex = 0;
    } else if (targetIndex < 0) {
      targetIndex = allNodes.length - 1;
    }

    const targetNodeId = allNodes[targetIndex];
    if (targetNodeId) {
      // Select and scroll into view, but don't focus camera (only Enter does that)
      this.selectNode(targetNodeId, {
        autoFocus: false,
        scrollIntoView: true,
        openPanel: false,
      });
    }
  }

  /**
   * Helper: Get object type string
   */
  getObjectType(object) {
    if (object.isMesh) return "Mesh";
    if (object.isGroup) return "Group";
    if (object.isObject3D) return "Object3D";
    if (object.isScene) return "Scene";
    if (object.isLight) return "Light";
    if (object.isCamera) return "Camera";
    return "Unknown";
  }

  /**
   * Helper: Get default name for object
   */
  getDefaultName(object) {
    const type = this.getObjectType(object);
    return `${type}_${Math.random().toString(36).substr(2, 5)}`;
  }

  /**
   * Helper: Get icon for node type
   */
  getNodeIcon(node) {
    switch (node.type) {
      case "Mesh":
        return "▢";
      case "Group":
        return "⊞";
      case "Scene":
        return "⊡";
      case "Light":
        return "💡";
      case "Camera":
        return "📷";
      default:
        return "●";
    }
  }

  /**
   * Helper: Generate unique node ID
   */
  generateNodeId() {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate hierarchy statistics
   */
  calculateStats(node) {
    if (!node) return null;

    const count = (n) => {
      let total = 1;
      n.children.forEach((child) => {
        total += count(child);
      });
      return total;
    };

    return {
      totalNodes: count(node),
      totalMeshes: node.meshCount,
      totalVertices: node.vertexCount,
      maxDepth: this.getMaxDepth(node, 0),
    };
  }

  /**
   * Get maximum depth of hierarchy
   */
  getMaxDepth(node, currentDepth) {
    if (node.children.length === 0) {
      return currentDepth;
    }

    let maxChildDepth = currentDepth;
    node.children.forEach((child) => {
      const childDepth = this.getMaxDepth(child, currentDepth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    });

    return maxChildDepth;
  }
  /**
   * Destroy panel and cleanup resources
   */
  destroy() {
    if (this.stateMonitorInterval) {
      clearInterval(this.stateMonitorInterval);
      this.stateMonitorInterval = null;
    }

    this.eventManager.cleanup();
    this.clearHierarchy();

    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
    }

    console.log("[ModelHierarchy] Panel destroyed");
  }
  /**
   * Filter nodes based on search query
   */
  filterNodes(query) {
    if (!this.treeContainer) return;

    const searchLower = query.toLowerCase().trim();
    const allNodes = this.treeContainer.querySelectorAll(".hierarchy-node");

    if (!searchLower) {
      // Show all nodes when search is empty
      allNodes.forEach((node) => {
        node.style.display = "";
      });
      return;
    }

    allNodes.forEach((node) => {
      const label = node.querySelector(".node-label");
      const nodeName = label ? label.textContent.toLowerCase() : "";

      if (nodeName.includes(searchLower)) {
        // Show matching node
        node.style.display = "";

        // Show all parent nodes
        let parent = node.parentElement?.closest(".hierarchy-node");
        while (parent) {
          parent.style.display = "";
          parent.classList.add("expanded");
          parent = parent.parentElement?.closest(".hierarchy-node");
        }

        // Show all child nodes
        const children = node.querySelectorAll(".hierarchy-node");
        children.forEach((child) => {
          child.style.display = "";
        });
      } else {
        // Hide non-matching nodes (unless they have matching children)
        const hasMatchingChild = Array.from(
          node.querySelectorAll(".node-label")
        ).some((l) => l.textContent.toLowerCase().includes(searchLower));

        if (!hasMatchingChild) {
          node.style.display = "none";
        }
      }
    });
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      isOpen: this.isOpen,
      hasModel: this.currentModel !== null,
      selectedNode: this.selectedNode,
      expandedNodes: this.expandedNodes.size,
      totalNodes: this.nodeMap.size,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    try {
      this.nodeMap.clear();
      this.objectToNode.clear();
      this.expandedNodes.clear();
      this.modelHierarchy = null;
      console.log("ModelHierarchyPanel destroyed");
    } catch (error) {
      console.error("ModelHierarchyPanel: Error during cleanup:", error);
    }
  }
}

// Export to global scope
if (typeof window !== "undefined") {
  window.ModelHierarchyPanel = ModelHierarchyPanel;
}
