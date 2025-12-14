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
      sectionSearchInput: document.getElementById('section-search-input'),
      resetViewBtn: document.getElementById('reset-view-btn'),
      frameObjectBtn: document.getElementById('frame-object-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      fullscreenBtn: document.getElementById('fullscreen-btn'),
      cameraFrontBtn: document.getElementById('camera-front-btn'),
      cameraTopBtn: document.getElementById('camera-top-btn'),
      cameraRightBtn: document.getElementById('camera-right-btn'),
      cameraIsoBtn: document.getElementById('camera-iso-btn'),
      wireframeToggle: document.getElementById('wireframe-toggle'),
      gridToggle: document.getElementById('grid-toggle'),
      axesToggle: document.getElementById('axes-toggle'),
      zoomSlider: document.getElementById('zoom-slider'),
      zoomValue: document.getElementById('zoom-value'),
      exportFormat: document.getElementById('export-format'),
      exportBtn: document.getElementById('export-btn'),
      helpBtn: document.getElementById('help-btn'),
      helpOverlay: document.getElementById('help-overlay'),
      closeHelpBtn: document.getElementById('close-help-btn'),
      shortcutsList: document.getElementById('shortcuts-list'),
      loadingOverlay: document.getElementById('loading-overlay'),
      loadingProgress: document.getElementById('loading-progress'),
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
    this.elements.frameObjectBtn.disabled = false;
    this.elements.refreshBtn.disabled = false;
    this.elements.zoomSlider.disabled = false;
    this.elements.sectionSearchInput.disabled = false;
    this.elements.cameraFrontBtn.disabled = false;
    this.elements.cameraTopBtn.disabled = false;
    this.elements.cameraRightBtn.disabled = false;
    this.elements.cameraIsoBtn.disabled = false;
    this.elements.wireframeToggle.disabled = false;
    this.elements.exportFormat.disabled = false;
    this.elements.exportBtn.disabled = false;
  }

  /**
   * Disable controls
   */
  disableControls() {
    this.elements.resetViewBtn.disabled = true;
    this.elements.frameObjectBtn.disabled = true;
    this.elements.refreshBtn.disabled = true;
    this.elements.zoomSlider.disabled = true;
    this.elements.sectionSearchInput.disabled = true;
    this.elements.cameraFrontBtn.disabled = true;
    this.elements.cameraTopBtn.disabled = true;
    this.elements.cameraRightBtn.disabled = true;
    this.elements.cameraIsoBtn.disabled = true;
    this.elements.wireframeToggle.disabled = true;
    this.elements.exportFormat.disabled = true;
    this.elements.exportBtn.disabled = true;
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
  showLoading(message = 'Loading model...') {
    this.elements.loadingOverlay.classList.remove('hidden');
    const textElement = this.elements.loadingOverlay.querySelector('.loading-text');
    if (textElement) {
      textElement.textContent = message;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    this.elements.loadingOverlay.classList.add('hidden');
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(percent) {
    if (this.elements.loadingProgress) {
      this.elements.loadingProgress.textContent = `${Math.round(percent)}%`;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.updateSectionInfo(`⚠️ Error: ${message}`);
    console.error(message);
  }

  /**
   * Show info message
   */
  showInfo(message) {
    this.updateSectionInfo(`ℹ️ ${message}`);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.updateSectionInfo(`✓ ${message}`);
    // Clear after 3 seconds
    setTimeout(() => this.clearSectionInfo(), 3000);
  }

  /**
   * Toggle help overlay
   */
  toggleHelpOverlay() {
    const isHidden = this.elements.helpOverlay.classList.toggle('hidden');

    if (!isHidden) {
      // Populate shortcuts when shown
      this.populateShortcuts();
    }
  }

  /**
   * Populate keyboard shortcuts in help overlay
   */
  populateShortcuts() {
    // Get shortcuts from the keyboard service via eventBus
    const shortcuts = {
      'View Controls': [
        { key: 'R', description: 'Reset camera view' },
        { key: 'F', description: 'Frame model in view' },
        { key: 'W', description: 'Toggle wireframe mode' },
        { key: 'H', description: 'Toggle help overlay' },
        { key: 'F11', description: 'Toggle fullscreen' },
      ],
      'Camera Presets': [
        { key: '1', description: 'Front view' },
        { key: '5', description: 'Top view' },
        { key: '4', description: 'Right view' },
        { key: '7', description: 'Isometric view' },
      ],
      Navigation: [
        { key: 'Esc', description: 'Exit focus mode' },
        { key: '/', description: 'Focus search box' },
      ],
      Advanced: [
        { key: 'Ctrl+E', description: 'Export model' },
        { key: 'F5', description: 'Refresh view' },
      ],
    };

    let html = '';
    for (const [category, items] of Object.entries(shortcuts)) {
      html += '<div class="shortcuts-category">';
      html += `<h3>${category}</h3>`;
      items.forEach(item => {
        html += '<div class="shortcut-item">';
        html += `<span class="shortcut-key">${item.key}</span>`;
        html += `<span class="shortcut-description">${item.description}</span>`;
        html += '</div>';
      });
      html += '</div>';
    }

    this.elements.shortcutsList.innerHTML = html;
  }

  /**
   * Update zoom display
   */
  updateZoomDisplay(zoom) {
    this.elements.zoomSlider.value = zoom;
    this.elements.zoomValue.textContent = `${zoom}%`;
  }
}
