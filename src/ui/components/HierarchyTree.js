/**
 * HierarchyTree
 *
 * UI component for displaying and interacting with the model hierarchy tree.
 */
export class HierarchyTree {
  constructor(container) {
    this.container = container;
    this.onSectionClick = null;
    this.onSectionDoubleClick = null;
    this.selectedIds = new Set();
  }

  /**
   * Render hierarchy tree
   */
  render(sections) {
    this.container.innerHTML = '';

    if (!sections || sections.length === 0) {
      this.container.innerHTML = '<div class="empty-state">No model loaded</div>';
      return;
    }

    const tree = document.createElement('ul');
    tree.className = 'tree';

    sections.forEach((section) => {
      const node = this.createNode(section);
      tree.appendChild(node);
    });

    this.container.appendChild(tree);
  }

  /**
   * Create tree node
   */
  createNode(section) {
    const li = document.createElement('li');
    li.className = 'tree-node';
    li.dataset.sectionId = section.id;

    const content = document.createElement('div');
    content.className = 'tree-node-content';

    // Expand/collapse button
    if (section.children && section.children.length > 0) {
      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = '▼';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleNode(li);
      });
      content.appendChild(toggle);
    } else {
      const spacer = document.createElement('span');
      spacer.className = 'tree-spacer';
      content.appendChild(spacer);
    }

    // Node label
    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = section.name || `Section ${section.id}`;
    content.appendChild(label);

    // Click handlers
    content.addEventListener('click', () => {
      if (this.onSectionClick) {
        this.onSectionClick(section.id);
      }
    });

    content.addEventListener('dblclick', () => {
      if (this.onSectionDoubleClick) {
        this.onSectionDoubleClick(section.id);
      }
    });

    li.appendChild(content);

    // Children
    if (section.children && section.children.length > 0) {
      const childTree = document.createElement('ul');
      childTree.className = 'tree-children';

      section.children.forEach((child) => {
        const childNode = this.createNode(child);
        childTree.appendChild(childNode);
      });

      li.appendChild(childTree);
    }

    return li;
  }

  /**
   * Toggle node expansion
   */
  toggleNode(node) {
    const toggle = node.querySelector('.tree-toggle');
    const children = node.querySelector('.tree-children');

    if (children) {
      const isExpanded = children.style.display !== 'none';
      children.style.display = isExpanded ? 'none' : 'block';
      toggle.textContent = isExpanded ? '▶' : '▼';
      node.classList.toggle('collapsed', isExpanded);
    }
  }

  /**
   * Highlight sections
   */
  highlightSections(sectionIds) {
    // Remove previous highlights
    this.container.querySelectorAll('.tree-node-content').forEach((node) => {
      node.classList.remove('highlighted');
    });

    // Add new highlights
    sectionIds.forEach((id) => {
      const node = this.container.querySelector(`[data-section-id="${id}"] .tree-node-content`);
      if (node) {
        node.classList.add('highlighted');
      }
    });
  }

  /**
   * Select sections
   */
  selectSections(sectionIds) {
    this.selectedIds = new Set(sectionIds);

    // Remove previous selections
    this.container.querySelectorAll('.tree-node-content').forEach((node) => {
      node.classList.remove('selected');
    });

    // Add new selections
    sectionIds.forEach((id) => {
      const node = this.container.querySelector(`[data-section-id="${id}"] .tree-node-content`);
      if (node) {
        node.classList.add('selected');
      }
    });
  }

  /**
   * Expand to section
   */
  expandToSection(sectionId) {
    const node = this.container.querySelector(`[data-section-id="${sectionId}"]`);
    if (!node) return;

    // Expand all parent nodes
    let parent = node.parentElement;
    while (parent && parent !== this.container) {
      if (parent.classList.contains('tree-children')) {
        parent.style.display = 'block';
        const parentNode = parent.parentElement;
        const toggle = parentNode?.querySelector('.tree-toggle');
        if (toggle) {
          toggle.textContent = '▼';
        }
        parentNode?.classList.remove('collapsed');
      }
      parent = parent.parentElement;
    }

    // Scroll into view
    node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Clear tree
   */
  clear() {
    this.container.innerHTML = '';
    this.selectedIds.clear();
  }
}
