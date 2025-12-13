/**
 * UI Controller - Manages user interface interactions
 * Following MVC Pattern and Single Responsibility Principle
 */

export class UIController {
  constructor(eventBus, stateManager) {
    this.eventBus = eventBus;
    this.stateManager = stateManager;
    this.elements = this.initializeElements();
    this.bindEvents();
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    return {
      modelSelector: document.getElementById('model-selector'),
      loadModelBtn: document.getElementById('load-model-btn'),
      modelUrlInput: document.getElementById('model-url-input'),
      loadUrlBtn: document.getElementById('load-url-btn'),
      modelFileInput: document.getElementById('model-file-input'),
      loadFileBtn: document.getElementById('load-file-btn'),
      fileName: document.getElementById('file-name'),
      sectionsList: document.getElementById('sections-list'),
      resetViewBtn: document.getElementById('reset-view-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      fullscreenBtn: document.getElementById('fullscreen-btn'),
      zoomSlider: document.getElementById('zoom-slider'),
      zoomValue: document.getElementById('zoom-value'),
      sectionInfo: document.getElementById('section-info'),
    };
  }

  /**
   * Bind UI events
   */
  bindEvents() {
    // Model selector change
    this.elements.modelSelector.addEventListener('change', () => {
      this.elements.loadModelBtn.disabled = !this.elements.modelSelector.value;
    });

    // Zoom slider
    this.elements.zoomSlider.addEventListener('input', e => {
      const zoom = parseInt(e.target.value);
      this.elements.zoomValue.textContent = `${zoom}%`;
      this.stateManager.setZoom(zoom);
    });
  }

  /**
   * Populate model selector with available models
   */
  populateModelSelector(models) {
    this.elements.modelSelector.innerHTML = '<option value="">Select a model...</option>';

    models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      this.elements.modelSelector.appendChild(option);
    });
  }

  /**
   * Render sections list
   */
  renderSections(sections) {
    this.elements.sectionsList.innerHTML = '';

    if (sections.length === 0) {
      this.elements.sectionsList.innerHTML = '<p class="no-sections">No sections available</p>';
      return;
    }

    const tree = this.buildSectionTree(sections);
    const listElement = this.createSectionTreeElement(tree);
    this.elements.sectionsList.appendChild(listElement);
  }

  /**
   * Build section tree from flat array
   */
  buildSectionTree(sections) {
    const roots = sections.filter(s => !s.parent);

    const buildNode = section => {
      const children = sections.filter(s => s.parent === section.id);
      return {
        section,
        children: children.map(buildNode),
      };
    };

    return roots.map(buildNode);
  }

  /**
   * Create DOM tree for sections
   */
  createSectionTreeElement(tree, depth = 0) {
    const ul = document.createElement('ul');
    ul.className = 'sections-tree';

    tree.forEach(node => {
      const li = document.createElement('li');
      li.className = 'section-item';
      li.dataset.sectionId = node.section.id;
      li.dataset.depth = depth;

      const header = document.createElement('div');
      header.className = 'section-header';

      // Expand/collapse button for nodes with children
      if (node.children.length > 0) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'section-toggle';
        toggleBtn.textContent = '▼';
        toggleBtn.onclick = e => {
          e.stopPropagation();
          li.classList.toggle('collapsed');
          toggleBtn.textContent = li.classList.contains('collapsed') ? '▶' : '▼';
        };
        header.appendChild(toggleBtn);
      } else {
        const spacer = document.createElement('span');
        spacer.className = 'section-spacer';
        header.appendChild(spacer);
      }

      // Section name
      const nameSpan = document.createElement('span');
      nameSpan.className = 'section-name';
      nameSpan.textContent = node.section.name;
      header.appendChild(nameSpan);

      // Action buttons
      const actions = document.createElement('div');
      actions.className = 'section-actions';

      const highlightBtn = this.createActionButton('👁', 'Highlight', () => {
        this.onSectionHighlight(node.section.id);
      });
      actions.appendChild(highlightBtn);

      const isolateBtn = this.createActionButton('🔍', 'Isolate', () => {
        this.onSectionIsolate(node.section.id);
      });
      actions.appendChild(isolateBtn);

      header.appendChild(actions);
      li.appendChild(header);

      // Add children
      if (node.children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'section-children';
        childrenContainer.appendChild(this.createSectionTreeElement(node.children, depth + 1));
        li.appendChild(childrenContainer);
      }

      ul.appendChild(li);
    });

    return ul;
  }

  /**
   * Create action button
   */
  createActionButton(icon, title, onClick) {
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.title = title;
    btn.textContent = icon;
    btn.onclick = e => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  }

  /**
   * Event handler for section highlight
   */
  onSectionHighlight(sectionId) {
    // To be connected to section manager
    const currentSelected = this.stateManager.getSelectedSection();
    if (currentSelected === sectionId) {
      this.stateManager.setSelectedSection(null);
    } else {
      this.stateManager.setSelectedSection(sectionId);
    }
  }

  /**
   * Event handler for section isolate
   */
  onSectionIsolate(sectionId) {
    // To be connected to section manager
    const currentIsolated = this.stateManager.getIsolatedSection();
    if (currentIsolated === sectionId) {
      this.stateManager.clearIsolatedSection();
    } else {
      this.stateManager.setIsolatedSection(sectionId);
    }
  }

  /**
   * Enable controls
   */
  enableControls() {
    this.elements.resetViewBtn.disabled = false;
    this.elements.refreshBtn.disabled = false;
    this.elements.zoomSlider.disabled = false;
  }

  /**
   * Disable controls
   */
  disableControls() {
    this.elements.resetViewBtn.disabled = true;
    this.elements.refreshBtn.disabled = true;
    this.elements.zoomSlider.disabled = true;
  }

  /**
   * Update section info display
   */
  updateSectionInfo(text) {
    this.elements.sectionInfo.textContent = text;
  }

  /**
   * Clear section info display
   */
  clearSectionInfo() {
    this.elements.sectionInfo.textContent = '';
  }

  /**
   * Show loading state
   */
  showLoading() {
    this.updateSectionInfo('Loading model...');
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.clearSectionInfo();
  }

  /**
   * Show error message
   */
  showError(message) {
    this.updateSectionInfo(`Error: ${message}`);
  }

  /**
   * Update zoom display
   */
  updateZoomDisplay(zoom) {
    this.elements.zoomSlider.value = zoom;
    this.elements.zoomValue.textContent = `${zoom}%`;
  }
}
