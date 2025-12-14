/**
 * Application Controller - Main orchestrator
 * Following Facade Pattern and coordinating all subsystems
 */

import { EventBus } from '../core/EventBus.js';
import { StateManager } from '../core/StateManager.js';
import { ModelRepository } from '../repositories/ModelRepository.js';
import { ModelLoaderService } from '../services/ModelLoaderService.js';
import { SectionManagerService } from '../services/SectionManagerService.js';
import { KeyboardShortcutsService } from '../services/KeyboardShortcutsService.js';
import { ModelExportService } from '../services/ModelExportService.js';
import { ViewerController } from './ViewerController.js';
import { UIController } from '../ui/UIController.js';
import { EVENTS } from '../domain/constants.js';

export class ApplicationController {
  constructor() {
    // Initialize core systems
    this.eventBus = new EventBus();
    this.stateManager = new StateManager(this.eventBus);

    // Initialize repositories
    this.modelRepository = new ModelRepository();

    // Initialize services
    this.modelLoader = new ModelLoaderService();
    this.sectionManager = new SectionManagerService();
    this.keyboardShortcuts = new KeyboardShortcutsService(this.eventBus);
    this.exportService = new ModelExportService();

    // Initialize controllers
    const canvas = document.getElementById('canvas-3d');
    this.viewerController = new ViewerController(canvas, this.eventBus, this.stateManager);
    this.uiController = new UIController(this.eventBus, this.stateManager);

    // Bind event handlers
    this.bindEvents();

    // Initialize UI
    this.initialize();
  }

  /**
   * Initialize the application
   */
  initialize() {
    // Populate model selector
    const models = this.modelRepository.getAllModels();
    this.uiController.populateModelSelector(models);

    console.log('Application initialized successfully');
  }

  /**
   * Bind all event handlers
   */
  bindEvents() {
    // UI Events
    document.getElementById('load-model-btn').addEventListener('click', () => {
      this.handleLoadModel();
    });

    document.getElementById('load-url-btn').addEventListener('click', () => {
      this.handleLoadModelFromURL();
    });

    document.getElementById('load-file-btn').addEventListener('click', () => {
      this.handleLoadModelFromFile();
    });

    document.getElementById('model-file-input').addEventListener('change', e => {
      this.handleFileSelected(e);
    });

    document.getElementById('reset-view-btn').addEventListener('click', () => {
      this.handleResetView();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.handleRefresh();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.handleToggleFullscreen();
    });

    document.getElementById('frame-object-btn').addEventListener('click', () => {
      this.handleFrameObject();
    });

    document.getElementById('camera-front-btn').addEventListener('click', () => {
      this.viewerController.setCameraPreset('front');
    });

    document.getElementById('camera-top-btn').addEventListener('click', () => {
      this.viewerController.setCameraPreset('top');
    });

    document.getElementById('camera-right-btn').addEventListener('click', () => {
      this.viewerController.setCameraPreset('right');
    });

    document.getElementById('camera-iso-btn').addEventListener('click', () => {
      this.viewerController.setCameraPreset('isometric');
    });

    document.getElementById('wireframe-toggle').addEventListener('change', e => {
      this.viewerController.toggleWireframe(e.target.checked);
    });

    document.getElementById('grid-toggle').addEventListener('change', e => {
      this.viewerController.toggleGrid(e.target.checked);
    });

    document.getElementById('axes-toggle').addEventListener('change', e => {
      this.viewerController.toggleAxes(e.target.checked);
    });

    document.getElementById('help-btn').addEventListener('click', () => {
      this.uiController.toggleHelpOverlay();
    });

    document.getElementById('close-help-btn').addEventListener('click', () => {
      this.uiController.toggleHelpOverlay();
    });

    document.getElementById('export-btn').addEventListener('click', () => {
      this.handleExport();
    });

    document.getElementById('section-search-input').addEventListener('input', e => {
      this.handleSectionSearch(e.target.value);
    });

    // Keyboard shortcuts
    this.eventBus.subscribe('SHORTCUT_RESET_VIEW', () => this.handleResetView());
    this.eventBus.subscribe('SHORTCUT_FRAME_OBJECT', () => this.handleFrameObject());
    this.eventBus.subscribe('SHORTCUT_TOGGLE_HELP', () => this.uiController.toggleHelpOverlay());
    this.eventBus.subscribe('SHORTCUT_TOGGLE_WIREFRAME', () => {
      const toggle = document.getElementById('wireframe-toggle');
      toggle.checked = !toggle.checked;
      this.viewerController.toggleWireframe(toggle.checked);
    });
    this.eventBus.subscribe('SHORTCUT_CAMERA_FRONT', () =>
      this.viewerController.setCameraPreset('front')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_BACK', () =>
      this.viewerController.setCameraPreset('back')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_TOP', () =>
      this.viewerController.setCameraPreset('top')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_BOTTOM', () =>
      this.viewerController.setCameraPreset('bottom')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_LEFT', () =>
      this.viewerController.setCameraPreset('left')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_RIGHT', () =>
      this.viewerController.setCameraPreset('right')
    );
    this.eventBus.subscribe('SHORTCUT_CAMERA_ISOMETRIC', () =>
      this.viewerController.setCameraPreset('isometric')
    );
    this.eventBus.subscribe('SHORTCUT_EXIT_FOCUS', () => this.viewerController.exitFocusMode());
    this.eventBus.subscribe('SHORTCUT_TOGGLE_FULLSCREEN', () => this.handleToggleFullscreen());
    this.eventBus.subscribe('SHORTCUT_REFRESH', () => this.handleRefresh());
    this.eventBus.subscribe('SHORTCUT_EXPORT_MODEL', () => this.handleExport());
    this.eventBus.subscribe('SHORTCUT_FOCUS_SEARCH', () => {
      document.getElementById('section-search-input').focus();
    });

    // State Events
    this.eventBus.subscribe(EVENTS.SECTION_SELECTED, sectionId => {
      this.handleSectionSelected(sectionId);
    });

    this.eventBus.subscribe(EVENTS.SECTION_ISOLATED, sectionId => {
      this.handleSectionIsolated(sectionId);
    });

    this.eventBus.subscribe(EVENTS.ISOLATION_CLEARED, () => {
      this.handleIsolationCleared();
    });

    this.eventBus.subscribe(EVENTS.ZOOM_CHANGED, zoom => {
      this.handleZoomChanged(zoom);
    });

    this.eventBus.subscribe(EVENTS.VIEW_RESET, () => {
      this.viewerController.resetView();
    });
  }

  /**
   * Handle model loading
   */
  async handleLoadModel() {
    const modelSelector = document.getElementById('model-selector');
    const modelId = modelSelector.value;

    if (!modelId) return;

    try {
      this.uiController.showLoading();
      this.uiController.disableControls();

      // Get model from repository
      const model = this.modelRepository.getModelById(modelId);

      if (!model) {
        throw new Error('Model not found');
      }

      // Try to load the model, fallback to demo geometry if file doesn't exist
      let loadedObject;
      try {
        loadedObject = await this.modelLoader.load(model);
      } catch (error) {
        console.warn('Could not load model file, using demo geometry:', error.message);
        loadedObject = this.modelLoader.createDemoGeometry();
      }

      // Add to viewer
      this.viewerController.addModel(loadedObject);

      // Create sections
      const sections = this.modelRepository.createSectionsFromObject(loadedObject, model.id);

      // Initialize section manager
      this.sectionManager.initialize(loadedObject);
      sections.forEach(section => this.sectionManager.addSection(section));

      // Update state
      this.stateManager.setCurrentModel(model);
      this.stateManager.setSections(sections);

      // Update UI
      this.uiController.renderSections(sections);
      this.uiController.enableControls();
      this.uiController.hideLoading();

      // Emit event
      this.eventBus.emit(EVENTS.MODEL_LOADED, model);

      console.log(`Model "${model.name}" loaded successfully with ${sections.length} sections`);
    } catch (error) {
      console.error('Failed to load model:', error);
      this.uiController.showError(error.message);
      this.uiController.disableControls();
    }
  }

  /**
   * Handle reset view
   */
  handleResetView() {
    this.viewerController.resetView();
    this.sectionManager.clearIsolation();
    this.stateManager.reset();
    this.uiController.updateZoomDisplay(100);
    this.uiController.clearSectionInfo();

    // Re-render sections
    const sections = this.stateManager.getSections();
    this.uiController.renderSections(sections);

    console.log('View reset');
  }

  /**
   * Handle refresh
   */
  handleRefresh() {
    const currentModel = this.stateManager.getCurrentModel();

    if (currentModel) {
      // Clear everything
      this.viewerController.removeModel();
      this.sectionManager.clear();
      this.stateManager.clear();
      this.uiController.renderSections([]);
      this.uiController.clearSectionInfo();
      this.uiController.disableControls();

      // Set the model selector back
      document.getElementById('model-selector').value = currentModel.id;

      // Reload the model
      this.handleLoadModel();

      console.log('Application refreshed');
    }
  }

  /**
   * Handle toggle fullscreen
   */
  handleToggleFullscreen() {
    const app = document.getElementById('app');
    const isFullscreen = app.classList.toggle('fullscreen');

    this.stateManager.setFullscreen(isFullscreen);

    // Trigger resize to adjust canvas
    setTimeout(() => {
      this.viewerController.handleResize();
    }, 100);

    console.log(`Fullscreen: ${isFullscreen ? 'enabled' : 'disabled'}`);
  }

  /**
   * Handle file selected
   */
  handleFileSelected(event) {
    const file = event.target.files[0];
    const fileNameSpan = document.getElementById('file-name');
    const loadFileBtn = document.getElementById('load-file-btn');

    if (file) {
      fileNameSpan.textContent = file.name;
      loadFileBtn.disabled = false;
    } else {
      fileNameSpan.textContent = '';
      loadFileBtn.disabled = true;
    }
  }

  /**
   * Handle loading model from URL
   */
  async handleLoadModelFromURL() {
    const urlInput = document.getElementById('model-url-input');
    const url = urlInput.value.trim();

    if (!url) {
      this.uiController.showError('Please enter a valid URL');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      this.uiController.showError('Invalid URL format');
      return;
    }

    // Create model from URL
    const model = this.modelRepository.createExternalModel(url);
    await this.loadExternalModel(model);
  }

  /**
   * Handle loading model from file
   */
  async handleLoadModelFromFile() {
    const fileInput = document.getElementById('model-file-input');
    const file = fileInput.files[0];

    if (!file) {
      this.uiController.showError('Please select a file');
      return;
    }

    // Validate file type
    const validExtensions = ['.gltf', '.glb', '.obj', '.stl', '.stla', '.fbx', '.step', '.stp'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExt)) {
      this.uiController.showError(
        'Please select a supported file: GLTF, GLB, OBJ, STL, FBX, or STEP'
      );
      return;
    }

    // Info message for STEP files (conversion will be attempted)
    if (fileExt === '.step' || fileExt === '.stp') {
      console.log('STEP file detected. Attempting automatic conversion to GLTF...');
      this.uiController.showInfo(
        'STEP file detected. Attempting automatic conversion... This may take a moment.'
      );
    }

    // Create model from file
    const model = this.modelRepository.createExternalModel(file);
    await this.loadExternalModel(model);
  }

  /**
   * Load external model (common logic for URL and File)
   */
  async loadExternalModel(model) {
    try {
      this.uiController.showLoading();
      this.uiController.disableControls();

      // Load the model
      const loadedObject = await this.modelLoader.load(model);

      // Clear previous model
      this.viewerController.removeModel();

      // Add to viewer
      this.viewerController.addModel(loadedObject);

      // Create sections
      const sections = this.modelRepository.createSectionsFromObject(loadedObject, model.id);

      // Initialize section manager
      this.sectionManager.initialize(loadedObject);
      sections.forEach(section => this.sectionManager.addSection(section));

      // Update state
      this.stateManager.setCurrentModel(model);
      this.stateManager.setSections(sections);

      // Update UI
      this.uiController.renderSections(sections);
      this.uiController.enableControls();
      this.uiController.hideLoading();

      // Clear model selector
      document.getElementById('model-selector').value = '';

      // Emit event
      this.eventBus.emit(EVENTS.MODEL_LOADED, model);

      console.log(
        `External model "${model.name}" loaded successfully with ${sections.length} sections`
      );
    } catch (error) {
      console.error('Failed to load external model:', error);

      // Handle STEP conversion instructions if available
      if (error.isManualConversionRequired && error.instructions) {
        const toolsList = error.instructions.tools.map(t => `• ${t.name} (${t.url})`).join('\n');
        this.uiController.showError(
          `${error.message}\n\nRecommended conversion tools:\n${toolsList}\n\nSee: ${error.instructions.documentation}`
        );
      } else {
        this.uiController.showError(`Failed to load model: ${error.message}`);
      }

      this.uiController.disableControls();
      this.uiController.hideLoading();
    }
  }

  /**
   * Handle section selected
   */
  handleSectionSelected(sectionId) {
    // Clear previous highlights
    const sections = this.stateManager.getSections();
    sections.forEach(section => {
      if (section.id !== sectionId) {
        this.sectionManager.highlightSection(section.id, false);
      }
    });

    // Highlight selected section
    if (sectionId) {
      this.sectionManager.highlightSection(sectionId, true);
      const section = this.stateManager.getSection(sectionId);
      this.uiController.updateSectionInfo(`Selected: ${section.name}`);
    } else {
      this.uiController.clearSectionInfo();
    }

    console.log('Section selected:', sectionId);
  }

  /**
   * Handle section isolated
   */
  handleSectionIsolated(sectionId) {
    if (sectionId) {
      this.sectionManager.isolateSection(sectionId);
      const section = this.stateManager.getSection(sectionId);
      this.uiController.updateSectionInfo(`Isolated: ${section.name}`);
      console.log('Section isolated:', sectionId);
    }
  }

  /**
   * Handle isolation cleared
   */
  handleIsolationCleared() {
    this.sectionManager.clearIsolation();
    this.uiController.clearSectionInfo();
    console.log('Isolation cleared');
  }

  /**
   * Handle zoom changed
   */
  handleZoomChanged(zoom) {
    this.viewerController.setZoom(zoom);
    this.uiController.updateZoomDisplay(zoom);
  }

  /**
   * Handle frame object
   */
  handleFrameObject() {
    this.viewerController.frameObject();
    console.log('Model framed in view');
  }

  /**
   * Handle export model
   */
  async handleExport() {
    const formatSelect = document.getElementById('export-format');
    const format = formatSelect.value;

    if (!format) {
      this.uiController.showError('Please select an export format');
      return;
    }

    const model = this.viewerController.getCurrentModel();
    if (!model) {
      this.uiController.showError('No model loaded to export');
      return;
    }

    try {
      this.uiController.showLoading('Exporting model...');

      const currentModel = this.stateManager.getCurrentModel();
      const filename = currentModel?.name?.replace(/\.[^/.]+$/, '') || 'model';

      await this.exportService.export(model, format, filename);

      this.uiController.hideLoading();
      this.uiController.showSuccess(`Model exported successfully as ${filename}.${format}`);

      console.log(`Model exported as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
      this.uiController.hideLoading();
      this.uiController.showError(`Export failed: ${error.message}`);
    }
  }

  /**
   * Handle section search
   */
  handleSectionSearch(query) {
    const sections = this.stateManager.getSections();

    if (!query || query.trim() === '') {
      // Show all sections
      this.uiController.renderSections(sections);
      return;
    }

    // Filter sections by name
    const filtered = sections.filter(section =>
      section.name.toLowerCase().includes(query.toLowerCase())
    );

    this.uiController.renderSections(filtered);
    console.log(`Filtered ${filtered.length} of ${sections.length} sections`);
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    this.viewerController.dispose();
    this.modelLoader.dispose();
    this.sectionManager.clear();
    this.stateManager.clear();
    this.eventBus.clear();
    this.keyboardShortcuts.dispose();

    console.log('Application disposed');
  }
}
