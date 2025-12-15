import { Store, ApplicationState, StateActions } from './state/index.js';
import { EventOrchestrator, EventTypes } from './events/index.js';
import {
  Renderer,
  SceneManager,
  CameraController,
  InteractionManager,
  ModelRenderer,
} from './engine/index.js';
import { UIController, HierarchyTree, PropertiesPanel, StatisticsPanel } from './ui/index.js';
import { ModelService, SelectionService } from './core/services/index.js';
import { ModelLoaderFactory } from './loaders/index.js';
import { Selection } from './core/entities/index.js';

/**
 * Application
 *
 * Main application class that orchestrates all components and manages
 * the application lifecycle.
 */
export class Application {
  constructor() {
    this.isInitialized = false;
    this.store = null;
    this.eventOrchestrator = null;
    this.renderer = null;
    this.sceneManager = null;
    this.cameraController = null;
    this.interactionManager = null;
    this.modelRenderer = null;
    this.uiController = null;
    this.services = {
      model: new ModelService(),
      selection: new SelectionService(),
    };
  }

  /**
   * Initialize application
   */
  async initialize() {
    try {
      // Initialize state
      this.store = new Store(ApplicationState.getInitialState());

      // Initialize event system
      this.eventOrchestrator = new EventOrchestrator(this.store);

      // Initialize 3D engine
      const viewportElement = document.getElementById('viewport');
      this.renderer = new Renderer(viewportElement);
      this.sceneManager = new SceneManager(this.renderer.getScene());
      this.cameraController = new CameraController(
        this.renderer.getCamera(),
        this.renderer.getControls()
      );
      this.interactionManager = new InteractionManager(
        this.renderer.getCamera(),
        this.renderer.renderer.domElement
      );
      this.modelRenderer = new ModelRenderer(this.sceneManager);

      // Initialize UI components
      const components = {
        hierarchyTree: new HierarchyTree(document.getElementById('hierarchy-tree')),
        propertiesPanel: new PropertiesPanel(document.getElementById('properties-panel')),
        statisticsPanel: new StatisticsPanel(document.getElementById('stats-panel')),
      };

      this.uiController = new UIController(components, this.eventOrchestrator.getEventBus());

      // Setup event handlers
      this.setupEventHandlers();

      // Setup state subscribers
      this.setupStateSubscribers();

      // Start render loop
      this.renderer.startRenderLoop();

      this.isInitialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    const bus = this.eventOrchestrator.getEventBus();

    // File upload
    bus.on(EventTypes.FILE_UPLOAD, async (file) => {
      await this.handleFileUpload(file);
    });

    // Model events
    bus.on(EventTypes.MODEL_TOGGLE_EXPLODE, () => {
      this.handleToggleExplode();
    });

    // Section events
    bus.on(EventTypes.SECTION_SELECT, (sectionId) => {
      this.handleSectionSelect(sectionId);
    });

    bus.on(EventTypes.SECTION_FOCUS, (sectionId) => {
      this.handleSectionFocus(sectionId);
    });

    // View events
    bus.on(EventTypes.VIEW_RESET, () => {
      this.cameraController.reset();
    });

    bus.on(EventTypes.VIEW_FIT, () => {
      const bounds = this.sceneManager.calculateSceneBounds();
      if (bounds) {
        this.cameraController.fitToBounds(bounds);
      }
    });

    bus.on(EventTypes.VIEW_ZOOM, (zoomLevel) => {
      this.cameraController.setZoom(zoomLevel);
    });

    bus.on(EventTypes.VIEW_TOGGLE_WIREFRAME, () => {
      const state = this.store.getState();
      const newMode = !state.viewState.wireframeMode;
      this.modelRenderer.setWireframeMode(newMode);
      this.store.updateState('viewState.wireframeMode', newMode);
    });

    bus.on(EventTypes.VIEW_TOGGLE_GRID, (visible) => {
      this.sceneManager.setGridVisible(visible);
      this.store.updateState('viewState.gridVisible', visible);
    });

    bus.on(EventTypes.VIEW_TOGGLE_AXES, (visible) => {
      this.sceneManager.setAxesVisible(visible);
      this.store.updateState('viewState.axesVisible', visible);
    });

    bus.on(EventTypes.VIEW_ROTATION_SPEED, (speed) => {
      this.cameraController.setAutoRotate(speed > 0, speed);
      this.store.updateState('viewState.rotationSpeed', speed);
      this.store.updateState('viewState.autoRotate', speed > 0);
    });

    // Interaction events
    this.interactionManager.setOnClick((object) => {
      const sectionId = object.userData.sectionId;
      if (sectionId) {
        bus.emit(EventTypes.SECTION_SELECT, sectionId);
      }
    });

    this.interactionManager.setOnDoubleClick((object) => {
      const sectionId = object.userData.sectionId;
      if (sectionId) {
        bus.emit(EventTypes.SECTION_FOCUS, sectionId);
      }
    });
  }

  /**
   * Setup state subscribers
   */
  setupStateSubscribers() {
    this.store.subscribe((newState, prevState) => {
      // Update UI when model changes
      if (newState.model !== prevState.model) {
        this.updateUIForModel(newState.model);
      }

      // Update UI when selection changes
      if (newState.selection !== prevState.selection) {
        this.updateUIForSelection(newState.selection);
      }

      // Update statistics
      if (newState.statistics !== prevState.statistics && newState.statistics) {
        this.uiController.components.statisticsPanel.update(newState.statistics);
      }
    });
  }

  /**
   * Handle file upload
   */
  async handleFileUpload(file) {
    try {
      this.store.setState(StateActions.setLoading(true));
      this.uiController.showLoading('Loading model...');

      const startTime = Date.now();

      // Get appropriate loader
      const loader = ModelLoaderFactory.getLoader(file);

      // Load model
      const { model, object3D } = await loader.load(file);

      // Validate model
      const validation = this.services.model.validateModel(model);
      if (!validation.valid) {
        throw new Error(`Invalid model: ${validation.errors.join(', ')}`);
      }

      // Update model bounds
      model.bounds = this.services.model.calculateBounds(model);

      // Render model
      this.modelRenderer.renderModel(model, object3D);

      // Update interaction manager
      this.interactionManager.setSelectableObjects(this.modelRenderer.getAllSectionObjects());

      // Fit camera to model
      if (model.bounds) {
        this.cameraController.fitToBounds(model.bounds);
      }

      // Update state
      const loadTime = Date.now() - startTime;
      const currentState = this.store.getState();
      this.store.setState({
        ...StateActions.setModel(model),
        selection: currentState.selection,
        statistics: {
          ...model.getStatistics(),
          loadTime,
        },
      });

      this.store.setState(StateActions.setUploadOverlayVisible(false));
      this.uiController.hideUploadOverlay();
      this.uiController.hideLoading();

      console.log(`Model loaded in ${loadTime}ms`);
    } catch (error) {
      console.error('Failed to load model:', error);
      this.store.setState(StateActions.setError(error.message));
      this.uiController.showError(error.message);
      this.uiController.hideLoading();
    } finally {
      this.store.setState(StateActions.setLoading(false));
    }
  }

  /**
   * Handle section select
   */
  handleSectionSelect(sectionId) {
    const state = this.store.getState();
    const newSelection = state.selection.clone();

    if (newSelection.isSelected(sectionId)) {
      newSelection.deselect(sectionId);
      this.modelRenderer.deselectSections([sectionId]);
    } else {
      newSelection.select(sectionId);
      this.modelRenderer.selectSections([sectionId]);
    }

    this.store.setState(StateActions.updateSelection(newSelection));
  }

  /**
   * Handle section focus
   */
  handleSectionFocus(sectionId) {
    const state = this.store.getState();
    const model = state.model;

    if (!model) return;

    const section = model.findSection(sectionId);
    if (!section) return;

    const object = this.modelRenderer.getSectionObject(sectionId);
    if (object) {
      this.cameraController.focusOnObject(object);
    }

    const newSelection = state.selection.clone();
    newSelection.focus(sectionId);

    this.store.setState(StateActions.updateSelection(newSelection));
  }

  /**
   * Handle toggle explode
   */
  handleToggleExplode() {
    const state = this.store.getState();
    const isExploded = state.interaction.isExploded;

    this.store.setState(StateActions.setExploded(!isExploded, 2));

    // TODO: Implement explode/assemble animation
    console.log('Explode/assemble:', !isExploded);
  }

  /**
   * Update UI for model
   */
  updateUIForModel(model) {
    if (model) {
      this.uiController.components.hierarchyTree.render(model.sections);
      this.uiController.components.propertiesPanel.displayModelProperties(model);
    } else {
      this.uiController.components.hierarchyTree.clear();
      this.uiController.components.propertiesPanel.clear();
    }
  }

  /**
   * Update UI for selection
   */
  updateUIForSelection(selection) {
    if (!selection) {
      return;
    }
    const selectedIds = Array.from(selection.selectedIds);

    // Update hierarchy tree
    this.uiController.components.hierarchyTree.selectSections(selectedIds);

    // Update properties panel
    if (selectedIds.length === 1) {
      const state = this.store.getState();
      const section = state.model?.findSection(selectedIds[0]);
      if (section) {
        this.uiController.components.propertiesPanel.displayProperties(section);
      }
    } else if (selectedIds.length > 1) {
      this.uiController.components.propertiesPanel.container.innerHTML = `<div class="empty-state">${selectedIds.length} sections selected</div>`;
    }

    // Update focus
    if (selection.focusedId) {
      this.uiController.components.hierarchyTree.expandToSection(selection.focusedId);
    }
  }

  /**
   * Dispose application
   */
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.interactionManager) {
      this.interactionManager.dispose();
    }

    if (this.modelRenderer) {
      this.modelRenderer.dispose();
    }

    if (this.eventOrchestrator) {
      this.eventOrchestrator.clear();
    }

    this.isInitialized = false;
  }
}
