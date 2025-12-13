/**
 * Application Controller - Main orchestrator
 * Following Facade Pattern and coordinating all subsystems
 */

import { EventBus } from '../core/EventBus.js';
import { StateManager } from '../core/StateManager.js';
import { ModelRepository } from '../repositories/ModelRepository.js';
import { ModelLoaderService } from '../services/ModelLoaderService.js';
import { SectionManagerService } from '../services/SectionManagerService.js';
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

    document.getElementById('reset-view-btn').addEventListener('click', () => {
      this.handleResetView();
    });

    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.handleRefresh();
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
      this.handleToggleFullscreen();
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
   * Dispose of all resources
   */
  dispose() {
    this.viewerController.dispose();
    this.modelLoader.dispose();
    this.sectionManager.clear();
    this.stateManager.clear();
    this.eventBus.clear();
    
    console.log('Application disposed');
  }
}
