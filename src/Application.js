/**
 * Main Application Class
 * Orchestrates all layers and manages application lifecycle
 */
import { Engine } from './engine/Engine.js';
import { SceneManager } from './engine/SceneManager.js';
import { EventOrchestrator } from './events/EventOrchestrator.js';
import { loaderFactory } from './loaders/LoaderFactory.js';
import { stateManager } from './state/StateManager.js';
import { StateActions } from './state/StateActions.js';
import { Camera } from './core/Camera.js';
import { Selection } from './core/Selection.js';

// UI Components
import { Toolbar } from './ui/Toolbar.js';
import { SectionTree } from './ui/SectionTree.js';
import { PropertiesPanel } from './ui/PropertiesPanel.js';
import { Viewer } from './ui/Viewer.js';
import { LoadingOverlay } from './ui/LoadingOverlay.js';

export class Application {
  constructor(container) {
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.components = {};
    this.engine = null;
    this.sceneManager = null;
    this.eventOrchestrator = null;
    this.initialized = false;
  }

  /**
   * Initialize application
   */
  async initialize() {
    if (this.initialized) {
      console.warn('Application already initialized');
      return;
    }

    try {
      // Initialize state
      this.initializeState();

      // Create UI structure
      this.createUI();

      // Initialize 3D engine
      this.initializeEngine();

      // Initialize event system
      this.initializeEvents();

      // Setup UI interactions
      this.setupUIInteractions();

      // Subscribe to state changes
      this.subscribeToState();

      // Start engine
      this.engine.start();

      this.initialized = true;
      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Initialize application state
   */
  initializeState() {
    const camera = new Camera();
    const selection = new Selection();

    StateActions.setCamera(camera);
    StateActions.setSelection(selection);
  }

  /**
   * Create UI structure
   */
  createUI() {
    // Create main structure
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';

    // Header
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = '<h1 class="app-title">3D Geometric Search</h1>';
    appContainer.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'app-body';

    // Create and mount components
    this.components.sidebar = new SectionTree(null); // Will set event orchestrator later
    this.components.sidebar.mount(body);

    // Main area
    const mainArea = document.createElement('div');
    mainArea.className = 'app-main';

    this.components.toolbar = new Toolbar(null); // Will set event orchestrator later
    this.components.toolbar.mount(mainArea);

    this.components.viewer = new Viewer();
    this.components.viewer.mount(mainArea);

    this.components.loadingOverlay = new LoadingOverlay();
    this.components.loadingOverlay.mount(mainArea);

    body.appendChild(mainArea);

    // Properties panel
    this.components.properties = new PropertiesPanel();
    this.components.properties.mount(body);

    appContainer.appendChild(body);

    // Mount to container
    this.container.appendChild(appContainer);
  }

  /**
   * Initialize 3D engine
   */
  initializeEngine() {
    const viewerContainer = this.components.viewer.getContainer();
    this.engine = new Engine(viewerContainer);
    this.engine.initialize();

    this.sceneManager = new SceneManager(this.engine);
  }

  /**
   * Initialize event system
   */
  initializeEvents() {
    this.eventOrchestrator = new EventOrchestrator(this.sceneManager);

    // Set event orchestrator on components that need it
    this.components.toolbar.eventOrchestrator = this.eventOrchestrator;
    this.components.sidebar.eventOrchestrator = this.eventOrchestrator;
  }

  /**
   * Setup UI interactions
   */
  setupUIInteractions() {
    // Listen for file selection from toolbar
    this.components.toolbar.element.addEventListener('file-selected', async (event) => {
      await this.loadFile(event.detail.file);
    });

    // Setup canvas interactions
    const canvas = this.engine.renderer.domElement;

    canvas.addEventListener('click', (event) => {
      this.handleCanvasClick(event);
    });

    canvas.addEventListener('mousemove', (event) => {
      this.handleCanvasMouseMove(event);
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribeToState() {
    stateManager.subscribe(this.handleStateChange.bind(this));
  }

  /**
   * Handle state changes
   */
  handleStateChange(state) {
    // Update UI visibility based on state
    if (state.ui) {
      const sidebar = this.components.sidebar.element;
      if (sidebar) {
        sidebar.classList.toggle('hidden', !state.ui.sidebarVisible);
      }

      const properties = this.components.properties.element;
      if (properties) {
        properties.classList.toggle('hidden', !state.ui.propertiesPanelVisible);
      }
    }

    // Handle errors
    if (state.error) {
      this.showError(state.error);
    }
  }

  /**
   * Load 3D file
   */
  async loadFile(file) {
    try {
      StateActions.setLoading(true);
      StateActions.clearError();

      // Load model using appropriate loader
      const model = await loaderFactory.load(file);

      // Emit model load event
      await this.eventOrchestrator.emit('model:load', { model });

      console.log('Model loaded successfully:', model);
    } catch (error) {
      console.error('Failed to load file:', error);
      StateActions.setError({
        message: `Failed to load file: ${error.message}`,
        details: error,
      });
    } finally {
      StateActions.setLoading(false);
    }
  }

  /**
   * Handle canvas click
   */
  handleCanvasClick(event) {
    const sectionId = this.sceneManager.getSectionAtPoint(event.clientX, event.clientY);

    if (sectionId) {
      this.eventOrchestrator.emit('section:select', { sectionId });
    }
  }

  /**
   * Handle canvas mouse move
   */
  handleCanvasMouseMove(event) {
    const sectionId = this.sceneManager.getSectionAtPoint(event.clientX, event.clientY);

    const state = stateManager.getState();
    if (sectionId !== state.hoveredSectionId) {
      if (sectionId) {
        this.eventOrchestrator.emit('section:hover', { sectionId });
      } else {
        this.eventOrchestrator.emit('section:unhover');
      }
    }
  }

  /**
   * Show error message
   */
  showError(error) {
    // Create error notification
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.innerHTML = `
      <span>⚠️</span>
      <span>${error.message || 'An error occurred'}</span>
      <button onclick="this.parentElement.remove()" style="margin-left: auto;">✕</button>
    `;

    this.container.appendChild(errorEl);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorEl.parentElement) {
        errorEl.remove();
      }
    }, 5000);
  }

  /**
   * Dispose and cleanup
   */
  dispose() {
    // Stop engine
    if (this.engine) {
      this.engine.stop();
      this.engine.dispose();
    }

    // Dispose scene manager
    if (this.sceneManager) {
      this.sceneManager.dispose();
    }

    // Dispose event orchestrator
    if (this.eventOrchestrator) {
      this.eventOrchestrator.dispose();
    }

    // Unmount components
    Object.values(this.components).forEach((component) => {
      if (component && component.unmount) {
        component.unmount();
      }
    });

    // Clear container
    this.container.innerHTML = '';

    // Reset state
    stateManager.reset();

    this.initialized = false;
  }
}
