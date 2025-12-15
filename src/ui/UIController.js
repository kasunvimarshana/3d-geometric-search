/**
 * UIController
 *
 * Orchestrates all UI components and handles user interactions.
 */
export class UIController {
  constructor(components, eventBus) {
    this.components = components;
    this.eventBus = eventBus;
    this.elements = this.getElements();
    this.setupEventListeners();
  }

  /**
   * Get DOM elements
   */
  getElements() {
    return {
      uploadButton: document.getElementById('btn-upload'),
      fileInput: document.getElementById('file-input'),
      uploadOverlay: document.getElementById('upload-overlay'),
      viewport: document.getElementById('viewport'),
      resetViewButton: document.getElementById('btn-reset-view'),
      fitViewButton: document.getElementById('btn-fit-view'),
      toggleWireframeButton: document.getElementById('btn-toggle-wireframe'),
      explodeButton: document.getElementById('btn-explode'),
      fullscreenButton: document.getElementById('btn-fullscreen'),
      zoomSlider: document.getElementById('zoom-slider'),
      rotationSpeedSlider: document.getElementById('rotation-speed'),
      showGridCheckbox: document.getElementById('show-grid'),
      showAxesCheckbox: document.getElementById('show-axes'),
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Upload handlers
    this.elements.uploadButton?.addEventListener('click', () => {
      this.elements.fileInput?.click();
    });

    this.elements.fileInput?.addEventListener('change', (e) => {
      this.handleFileSelect(e);
    });

    // Drag and drop
    this.setupDragAndDrop();

    // View controls
    this.elements.resetViewButton?.addEventListener('click', () => {
      this.eventBus.emit('view:reset');
    });

    this.elements.fitViewButton?.addEventListener('click', () => {
      this.eventBus.emit('view:fit');
    });

    this.elements.toggleWireframeButton?.addEventListener('click', () => {
      this.eventBus.emit('view:toggle-wireframe');
    });

    this.elements.explodeButton?.addEventListener('click', () => {
      this.eventBus.emit('model:toggle-explode');
    });

    this.elements.fullscreenButton?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // View settings
    this.elements.zoomSlider?.addEventListener('input', (e) => {
      this.eventBus.emit('view:zoom', parseFloat(e.target.value));
    });

    this.elements.rotationSpeedSlider?.addEventListener('input', (e) => {
      this.eventBus.emit('view:rotation-speed', parseFloat(e.target.value));
    });

    this.elements.showGridCheckbox?.addEventListener('change', (e) => {
      this.eventBus.emit('view:toggle-grid', e.target.checked);
    });

    this.elements.showAxesCheckbox?.addEventListener('change', (e) => {
      this.eventBus.emit('view:toggle-axes', e.target.checked);
    });

    // Hierarchy tree events
    if (this.components.hierarchyTree) {
      this.components.hierarchyTree.onSectionClick = (sectionId) => {
        this.eventBus.emit('section:select', sectionId);
      };

      this.components.hierarchyTree.onSectionDoubleClick = (sectionId) => {
        this.eventBus.emit('section:focus', sectionId);
      };
    }
  }

  /**
   * Setup drag and drop
   */
  setupDragAndDrop() {
    const overlay = this.elements.uploadOverlay;
    const viewport = this.elements.viewport;

    if (!overlay || !viewport) return;

    ['dragenter', 'dragover'].forEach((event) => {
      viewport.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        overlay.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach((event) => {
      viewport.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
        overlay.classList.remove('drag-active');
      });
    });

    viewport.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        this.handleFile(files[0]);
      }
    });
  }

  /**
   * Handle file select
   */
  handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  /**
   * Handle file
   */
  handleFile(file) {
    this.eventBus.emit('file:upload', file);
  }

  /**
   * Toggle fullscreen
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Show loading
   */
  showLoading(message = 'Loading...') {
    // Implementation depends on loading UI design
    console.log('Loading:', message);
  }

  /**
   * Hide loading
   */
  hideLoading() {
    console.log('Loading complete');
  }

  /**
   * Show error
   */
  showError(message) {
    alert(`Error: ${message}`);
  }

  /**
   * Update zoom slider
   */
  updateZoomSlider(value) {
    if (this.elements.zoomSlider) {
      this.elements.zoomSlider.value = value;
    }
  }

  /**
   * Hide upload overlay
   */
  hideUploadOverlay() {
    if (this.elements.uploadOverlay) {
      this.elements.uploadOverlay.style.display = 'none';
    }
  }

  /**
   * Show upload overlay
   */
  showUploadOverlay() {
    if (this.elements.uploadOverlay) {
      this.elements.uploadOverlay.style.display = 'flex';
    }
  }
}
