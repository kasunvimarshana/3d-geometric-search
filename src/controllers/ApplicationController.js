/**
 * Application Controller - Main orchestrator
 * Following Facade Pattern and coordinating all subsystems
 *
 * Enhanced with centralized ModelEventCoordinator for robust event handling
 */

import { EventBus } from '../core/EventBus.js';
import { StateManager } from '../core/StateManager.js';
import { ModelRepository } from '../repositories/ModelRepository.js';
import { ModelLoaderService } from '../services/ModelLoaderService.js';
import { SectionManagerService } from '../services/SectionManagerService.js';
import { KeyboardShortcutsService } from '../services/KeyboardShortcutsService.js';
import { ModelExportService } from '../services/ModelExportService.js';
import { ModelEventCoordinator } from '../services/ModelEventCoordinator.js';
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

    // Initialize ModelEventCoordinator for centralized event handling
    this.eventCoordinator = new ModelEventCoordinator(this.eventBus, this.stateManager);

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

    // Set up status bar updates
    this.setupStatusBarUpdates();

    console.log('Application initialized successfully');
  }

  /**
   * Set up status bar updates
   */
  setupStatusBarUpdates() {
    // Update status on model load
    this.eventBus.subscribe(EVENTS.MODEL_LOADED, data => {
      this.updateStatusBar('model', `Loaded: ${data.model.name}`);
      this.updateStatusBar('sections', `${data.sections.length} section(s)`);
    });

    // Update status on camera changes
    this.eventBus.subscribe(EVENTS.VIEW_RESET, () => {
      this.updateStatusBar('camera', 'View Reset');
      setTimeout(() => this.updateStatusBar('camera', ''), 2000);
    });

    // Update status on section selection
    this.eventBus.subscribe(EVENTS.SECTION_SELECTED, data => {
      const section = data.section || data;
      this.updateStatusBar('sections', `Selected: ${section.name || section.id}`);
    });

    this.eventBus.subscribe(EVENTS.ISOLATION_CLEARED, () => {
      this.updateStatusBar('sections', 'All sections visible');
      setTimeout(() => {
        const sections = this.stateManager.getSections();
        this.updateStatusBar('sections', `${sections.length} section(s)`);
      }, 2000);
    });
  }

  /**
   * Update status bar
   */
  updateStatusBar(area, text) {
    const statusElement = document.getElementById(`status-${area}`);
    if (statusElement) {
      statusElement.textContent = text;
    }
  }

  /**
   * Bind all event handlers
   */
  bindEvents() {
    // Helper function to safely add event listener
    const addListener = (id, event, handler) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener(event, handler);
      }
    };

    // UI Events
    addListener('load-model-btn', 'click', () => {
      this.handleLoadModel();
    });

    addListener('load-url-btn', 'click', () => {
      this.handleLoadModelFromURL();
    });

    addListener('load-file-btn', 'click', () => {
      this.handleLoadModelFromFile();
    });

    addListener('model-file-input', 'change', e => {
      this.handleFileSelected(e);
    });

    addListener('reset-view-btn', 'click', () => {
      this.handleResetView();
    });

    addListener('refresh-btn', 'click', () => {
      this.handleRefresh();
    });

    addListener('fullscreen-btn', 'click', () => {
      this.handleToggleFullscreen();
    });

    addListener('frame-object-btn', 'click', () => {
      this.handleFrameObject();
    });

    addListener('camera-front-btn', 'click', () => {
      this.viewerController.setCameraPreset('front');
    });

    addListener('camera-top-btn', 'click', () => {
      this.viewerController.setCameraPreset('top');
    });

    addListener('camera-right-btn', 'click', () => {
      this.viewerController.setCameraPreset('right');
    });

    addListener('camera-iso-btn', 'click', () => {
      this.viewerController.setCameraPreset('isometric');
    });

    addListener('wireframe-toggle', 'change', e => {
      this.viewerController.toggleWireframe(e.target.checked);
    });

    addListener('grid-toggle', 'change', e => {
      this.viewerController.toggleGrid(e.target.checked);
    });

    addListener('axes-toggle', 'change', e => {
      this.viewerController.toggleAxes(e.target.checked);
    });

    addListener('help-btn', 'click', () => {
      this.uiController.toggleHelpOverlay();
    });

    addListener('close-help-btn', 'click', () => {
      this.uiController.toggleHelpOverlay();
    });

    addListener('export-btn', 'click', () => {
      this.handleExport();
    });

    addListener('section-search-input', 'input', e => {
      this.handleSectionSearch(e.target.value);
    });

    // Keyboard shortcuts
    this.eventBus.subscribe('SHORTCUT_RESET_VIEW', () => this.handleResetView());
    this.eventBus.subscribe('SHORTCUT_FRAME_OBJECT', () => this.handleFrameObject());
    this.eventBus.subscribe('SHORTCUT_TOGGLE_HELP', () => this.uiController.toggleHelpOverlay());
    this.eventBus.subscribe('SHORTCUT_TOGGLE_WIREFRAME', () => {
      const toggle = document.getElementById('wireframe-toggle');
      if (toggle) {
        toggle.checked = !toggle.checked;
        this.viewerController.toggleWireframe(toggle.checked);
      }
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
      const searchInput = document.getElementById('section-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    });

    // State Events
    this.eventBus.subscribe(EVENTS.SECTION_SELECTED, data => {
      this.handleSectionSelected(data);
    });

    this.eventBus.subscribe(EVENTS.SECTION_ISOLATED, data => {
      this.handleSectionIsolated(data);
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

    // Model Event Coordinator Synchronization Events
    this.eventBus.subscribe(EVENTS.UI_UPDATE_REQUIRED, data => {
      this.handleUIUpdateRequired(data);
    });

    this.eventBus.subscribe(EVENTS.NAVIGATION_UPDATE_REQUIRED, data => {
      this.handleNavigationUpdateRequired(data);
    });

    this.eventBus.subscribe(EVENTS.SELECTION_STATE_CHANGED, data => {
      this.handleSelectionStateChanged(data);
    });

    // Model Interaction Events
    this.eventBus.subscribe(EVENTS.MODEL_CLICKED, data => {
      this.handleModelClicked(data);
    });

    this.eventBus.subscribe(EVENTS.OBJECT_SELECTED, data => {
      this.handleObjectSelected(data);
    });

    this.eventBus.subscribe(EVENTS.OBJECT_DESELECTED, () => {
      this.handleObjectDeselected();
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
      // Get model from repository
      const model = this.modelRepository.getModelById(modelId);

      if (!model) {
        throw new Error('Model not found');
      }

      // Emit load start event
      this.eventCoordinator.emitEvent(EVENTS.MODEL_LOAD_START, {
        modelId: model.id,
        modelName: model.name,
        source: 'repository',
      });

      this.uiController.showLoading(`Loading ${model.name}...`);
      this.uiController.disableControls();

      // Try to load the model, fallback to demo geometry if file doesn't exist
      let loadedObject;
      try {
        loadedObject = await this.modelLoader.load(model);
      } catch (error) {
        console.warn('Could not load model file, using demo geometry:', error.message);
        loadedObject = this.modelLoader.createDemoGeometry();
      }

      // Add to viewer (emits MODEL_UPDATED event)
      this.viewerController.addModel(loadedObject);

      // Create sections
      const sections = this.modelRepository.createSectionsFromObject(loadedObject, model.id);

      // Initialize section manager
      this.sectionManager.initialize(loadedObject);
      sections.forEach(section => this.sectionManager.addSection(section));

      // Update state
      this.stateManager.setCurrentModel(model);
      this.stateManager.setSections(sections);

      // Emit model loaded event with comprehensive data
      this.eventCoordinator.emitEvent(EVENTS.MODEL_LOADED, {
        model: {
          id: model.id,
          name: model.name,
          type: model.type,
          url: model.url,
        },
        sections,
        object3D: loadedObject,
      });

      // Update UI
      this.uiController.renderSections(sections);
      this.uiController.enableControls();
      this.uiController.hideLoading();
      this.uiController.showSuccess(`Model "${model.name}" loaded successfully`);

      console.log(`Model "${model.name}" loaded successfully with ${sections.length} sections`);
    } catch (error) {
      console.error('Failed to load model:', error);

      // Emit error event
      this.eventCoordinator.emitEvent(EVENTS.MODEL_LOAD_ERROR, {
        error: error.message,
        modelId: this.modelRepository.getModelById(modelSelector.value)?.id,
        modelName: this.modelRepository.getModelById(modelSelector.value)?.name,
      });

      this.uiController.showError(error.message);
      this.uiController.disableControls();
      this.uiController.hideLoading();
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
      const modelSelector = document.getElementById('model-selector');
      if (modelSelector) {
        modelSelector.value = currentModel.id;
      }

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
      if (fileNameSpan) {
        fileNameSpan.textContent = file.name;
      }
      if (loadFileBtn) {
        loadFileBtn.disabled = false;
      }
    } else {
      if (fileNameSpan) {
        fileNameSpan.textContent = '';
      }
      if (loadFileBtn) {
        loadFileBtn.disabled = true;
      }
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

      // Update ViewerController's mesh-to-section mapping for click handling
      this.viewerController.updateMeshToSectionMap(sections);

      // Update state
      this.stateManager.setCurrentModel(model);
      this.stateManager.setSections(sections);

      // Update UI
      this.uiController.renderSections(sections);
      this.uiController.enableControls();
      this.uiController.hideLoading();

      // Clear model selector
      const modelSelector = document.getElementById('model-selector');
      if (modelSelector) {
        modelSelector.value = '';
      }

      // Emit event with complete data
      this.eventBus.emit(EVENTS.MODEL_LOADED, {
        model,
        sections,
        object3D: loadedObject,
      });

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
  handleSectionSelected(data) {
    const { sectionId } = data;

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
      if (section) {
        this.uiController.updateSectionInfo(`Selected: ${section.name}`);
      }
    } else {
      this.uiController.clearSectionInfo();
    }

    console.log('[ApplicationController] Section selected:', sectionId);
  }

  /**
   * Handle section isolated
   */
  handleSectionIsolated(data) {
    const { sectionId } = data;
    if (sectionId) {
      this.sectionManager.isolateSection(sectionId);
      const section = this.stateManager.getSection(sectionId);
      if (section) {
        this.uiController.updateSectionInfo(`Isolated: ${section.name}`);
      }
      console.log('[ApplicationController] Section isolated:', sectionId);
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
   * Handle UI update required from ModelEventCoordinator
   */
  handleUIUpdateRequired(data) {
    const { type, message, progress } = data;

    switch (type) {
      case 'loading':
        this.uiController.showLoading(message);
        if (progress !== undefined) {
          this.uiController.updateLoadingProgress(progress);
        }
        break;

      case 'loaded':
        this.uiController.hideLoading();
        if (message) {
          this.uiController.showSuccess(message);
        }
        break;

      case 'error':
        this.uiController.showError(message);
        this.uiController.hideLoading();
        break;

      case 'unloaded':
        this.uiController.clearSectionInfo();
        this.uiController.disableControls();
        break;

      case 'isolation':
      case 'focus-entered':
      case 'focus-exited':
      case 'isolation-cleared':
        // UI already updated, log for debugging
        if (this.eventCoordinator.debugMode) {
          console.log('[ApplicationController] UI update:', type, message);
        }
        break;

      default:
        console.warn('[ApplicationController] Unknown UI update type:', type);
    }
  }

  /**
   * Handle navigation update required from ModelEventCoordinator
   */
  handleNavigationUpdateRequired(data) {
    const { type, sections, sectionId } = data;

    switch (type) {
      case 'model-loaded':
        // Re-render section list with new sections
        if (sections) {
          this.uiController.renderSections(sections);
        }
        break;

      case 'model-unloaded':
        // Clear section list
        this.uiController.renderSections([]);
        break;

      case 'section-isolated':
        // Re-render sections to reflect isolation state
        if (data.sections) {
          this.uiController.renderSections(data.sections);
        }
        break;

      case 'isolation-cleared':
        // Re-render all sections
        const allSections = this.stateManager.getSections();
        if (allSections) {
          this.uiController.renderSections(allSections);
        }
        break;

      case 'state-restored':
        // Re-render sections from restored state
        if (sections) {
          this.uiController.renderSections(sections);
        }
        break;

      default:
        console.warn('[ApplicationController] Unknown navigation update type:', type);
    }
  }

  /**
   * Handle selection state changed from ModelEventCoordinator
   */
  handleSelectionStateChanged(data) {
    const { selectedSection, section, previousSelection } = data;

    if (selectedSection) {
      // Update UI to show selected section
      this.uiController.updateSectionInfo(section);
      console.log(`[ApplicationController] Section selected: ${selectedSection}`);
    } else if (previousSelection) {
      // Clear selection in UI
      this.uiController.clearSectionInfo();
      console.log(`[ApplicationController] Section deselected: ${previousSelection}`);
    }
  }

  /**
   * Handle model clicked event
   */
  handleModelClicked(data) {
    const { meshName, sectionId, point } = data;

    if (this.eventCoordinator.debugMode) {
      console.log('[ApplicationController] Model clicked:', {
        meshName,
        sectionId,
        point,
      });
    }

    // Update UI with click information
    if (sectionId) {
      const section = this.stateManager.getSection(sectionId);
      if (section) {
        this.uiController.updateSectionInfo(section);
      }
    }
  }

  /**
   * Handle object selected event
   */
  handleObjectSelected(data) {
    const { object, sectionId } = data;

    if (this.eventCoordinator.debugMode) {
      console.log('[ApplicationController] Object selected:', {
        objectName: object?.name,
        sectionId,
      });
    }

    // Highlight the selected section in the viewer
    if (sectionId) {
      // Clear previous highlights
      const sections = this.stateManager.getSections();
      sections.forEach(section => {
        if (section.id !== sectionId) {
          this.sectionManager.highlightSection(section.id, false);
        }
      });

      // Highlight selected section
      this.sectionManager.highlightSection(sectionId, true);

      // Update UI to highlight section in list
      this.uiController.highlightSectionInList(sectionId);
    }
  }

  /**
   * Handle object deselected event
   */
  handleObjectDeselected() {
    if (this.eventCoordinator.debugMode) {
      console.log('[ApplicationController] Object deselected');
    }

    // Clear all highlights
    const sections = this.stateManager.getSections();
    sections.forEach(section => {
      this.sectionManager.highlightSection(section.id, false);
    });

    // Clear UI section highlight
    this.uiController.clearSectionHighlight();

    // Clear section info
    this.uiController.clearSectionInfo();
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
    this.eventCoordinator.dispose();

    console.log('Application disposed');
  }
}
