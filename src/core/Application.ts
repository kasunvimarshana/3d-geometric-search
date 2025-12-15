import { EventBus } from "@core/EventBus";
import { StateManager } from "@core/StateManager";
import { ModelRepository } from "@core/ModelRepository";
import { SectionManager } from "@core/SectionManager";
import { ModelLoaderFactory } from "@infrastructure/loaders/ModelLoaderFactory";
import { FileHandler } from "@infrastructure/FileHandler";
import { ThreeRenderer } from "@infrastructure/ThreeRenderer";
import { AnimationController } from "@infrastructure/AnimationController";
import { Toolbar } from "@ui/components/Toolbar";
import { SectionPanel } from "@ui/components/SectionPanel";
import { StatusBar } from "@ui/components/StatusBar";
import { ViewerContainer } from "@ui/components/ViewerContainer";
import { EventType } from "@domain/types";
import { ApplicationEvent } from "@domain/events";

/**
 * Application Orchestrator
 * Main application class that coordinates all components
 * Implements Facade pattern to simplify complex subsystems
 */
export class Application {
  // Core services
  private eventBus: EventBus;
  private stateManager: StateManager;
  private modelRepository: ModelRepository;
  private sectionManager: SectionManager;

  // Infrastructure
  private modelLoaderFactory: ModelLoaderFactory;
  private fileHandler: FileHandler;
  private renderer: ThreeRenderer;
  private animationController?: AnimationController;

  // UI Components
  private toolbar: Toolbar;
  private sectionPanel: SectionPanel;
  private statusBar: StatusBar;
  private viewerContainer: ViewerContainer;

  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;

    // Initialize core services
    this.eventBus = new EventBus();
    this.stateManager = new StateManager();
    this.modelRepository = new ModelRepository();
    this.sectionManager = new SectionManager();

    // Initialize infrastructure
    this.modelLoaderFactory = new ModelLoaderFactory();
    this.fileHandler = new FileHandler();
    this.renderer = new ThreeRenderer();

    // Initialize UI components
    this.viewerContainer = new ViewerContainer();
    this.toolbar = new Toolbar({
      onFileUpload: this.handleFileUpload.bind(this),
      onReset: this.handleReset.bind(this),
      onDisassemble: this.handleDisassemble.bind(this),
      onReassemble: this.handleReassemble.bind(this),
      onFullscreen: this.handleFullscreen.bind(this),
      onZoomIn: this.handleZoomIn.bind(this),
      onZoomOut: this.handleZoomOut.bind(this),
      onScaleUp: this.handleScaleUp.bind(this),
      onScaleDown: this.handleScaleDown.bind(this),
      onFitToScreen: this.handleFitToScreen.bind(this),
      supportedFormats: this.modelLoaderFactory.getSupportedFormats(),
    });
    this.sectionPanel = new SectionPanel({
      sections: [],
      onSectionSelect: this.handleSectionSelect.bind(this),
      onSectionFocus: this.handleSectionFocus.bind(this),
    });
    this.statusBar = new StatusBar();

    this.setupEventHandlers();
    this.setupStateSubscription();
    this.render();
  }

  private render(): void {
    // Create main layout
    this.container.innerHTML = "";
    this.container.className = "app";

    const mainContent = document.createElement("div");
    mainContent.className = "main-content";

    // Mount components
    this.toolbar.mount(this.container);
    mainContent.appendChild(this.viewerContainer.getElement());
    mainContent.appendChild(this.sectionPanel.getElement());
    this.container.appendChild(mainContent);
    this.statusBar.mount(this.container);

    // Initialize renderer
    this.renderer.initialize(this.viewerContainer.getContainer());
  }

  private setupEventHandlers(): void {
    // Model loading events
    this.eventBus.subscribe(
      EventType.MODEL_LOAD_START,
      this.onModelLoadStart.bind(this)
    );
    this.eventBus.subscribe(
      EventType.MODEL_LOAD_SUCCESS,
      this.onModelLoadSuccess.bind(this)
    );
    this.eventBus.subscribe(
      EventType.MODEL_LOAD_ERROR,
      this.onModelLoadError.bind(this)
    );

    // Section events
    this.eventBus.subscribe(
      EventType.SECTION_SELECT,
      this.onSectionSelect.bind(this)
    );
    this.eventBus.subscribe(
      EventType.SECTION_DESELECT,
      this.onSectionDeselect.bind(this)
    );
    this.eventBus.subscribe(
      EventType.SECTION_FOCUS,
      this.onSectionFocus.bind(this)
    );
    this.eventBus.subscribe(
      EventType.SECTION_HIGHLIGHT,
      this.onSectionHighlight.bind(this)
    );
    this.eventBus.subscribe(
      EventType.SECTION_DEHIGHLIGHT,
      this.onSectionDehighlight.bind(this)
    );

    // View events
    this.eventBus.subscribe(EventType.VIEW_RESET, this.onViewReset.bind(this));
    this.eventBus.subscribe(EventType.VIEW_ZOOM, this.onViewZoom.bind(this));
    this.eventBus.subscribe(EventType.VIEW_SCALE, this.onViewScale.bind(this));
    this.eventBus.subscribe(
      EventType.VIEW_FIT_TO_SCREEN,
      this.onViewFitToScreen.bind(this)
    );

    // Animation events
    this.eventBus.subscribe(
      EventType.ANIMATION_START,
      this.onAnimationStart.bind(this)
    );
    this.eventBus.subscribe(
      EventType.ANIMATION_COMPLETE,
      this.onAnimationComplete.bind(this)
    );

    // Error events
    this.eventBus.subscribe(EventType.ERROR, this.onError.bind(this));
  }

  private setupStateSubscription(): void {
    this.stateManager.subscribe((state) => {
      // Update UI based on state changes
      if (state.model) {
        const sections = Array.from(state.model.sections.values());
        this.sectionPanel.update({ sections });
      }

      // Update status bar
      if (state.loading) {
        this.statusBar.setLoading(true, "Loading model...");
      } else if (state.error) {
        this.statusBar.setError(state.error);
      } else {
        this.statusBar.setMessage("Ready");
      }
    });
  }

  // Event Handlers

  private async handleFileUpload(file: File): Promise<void> {
    try {
      this.eventBus.publish({
        type: EventType.MODEL_LOAD_START,
        timestamp: Date.now(),
        payload: { filename: file.name, format: "unknown" },
      });

      // Detect format
      const format = this.fileHandler.detectFormat(file.name);
      if (!format) {
        throw new Error(`Unsupported file format: ${file.name}`);
      }

      // Read file
      const data = await this.fileHandler.readFile(file);

      // Load model
      const model = await this.modelLoaderFactory.loadModel(
        data,
        format,
        file.name
      );

      // Save model
      this.modelRepository.save(model);
      this.sectionManager.setModel(model);

      // Update state
      this.stateManager.updateState((state) => ({
        ...state,
        model,
        loading: false,
        error: undefined,
      }));

      // Load model in renderer
      this.renderer.loadModel(model);

      this.eventBus.publish({
        type: EventType.MODEL_LOAD_SUCCESS,
        timestamp: Date.now(),
        payload: {
          modelId: model.id,
          sectionCount: model.sections.size,
        },
      });
    } catch (error) {
      this.eventBus.publish({
        type: EventType.MODEL_LOAD_ERROR,
        timestamp: Date.now(),
        payload: {
          error: String(error),
          filename: file.name,
        },
      });
    }
  }

  private handleReset(): void {
    this.eventBus.publish({
      type: EventType.VIEW_RESET,
      timestamp: Date.now(),
      payload: { animated: true },
    });
  }

  private async handleDisassemble(): Promise<void> {
    if (!this.animationController) return;

    this.eventBus.publish({
      type: EventType.ANIMATION_START,
      timestamp: Date.now(),
      payload: { animationType: "disassemble" },
    });

    try {
      await this.animationController.disassemble();

      this.eventBus.publish({
        type: EventType.ANIMATION_COMPLETE,
        timestamp: Date.now(),
        payload: { animationType: "disassemble" },
      });
    } catch (error) {
      this.eventBus.publish({
        type: EventType.ERROR,
        timestamp: Date.now(),
        payload: { error: String(error), context: "disassemble" },
      });
    }
  }

  private async handleReassemble(): Promise<void> {
    if (!this.animationController) return;

    this.eventBus.publish({
      type: EventType.ANIMATION_START,
      timestamp: Date.now(),
      payload: { animationType: "reassemble" },
    });

    try {
      await this.animationController.reassemble();

      this.eventBus.publish({
        type: EventType.ANIMATION_COMPLETE,
        timestamp: Date.now(),
        payload: { animationType: "reassemble" },
      });
    } catch (error) {
      this.eventBus.publish({
        type: EventType.ERROR,
        timestamp: Date.now(),
        payload: { error: String(error), context: "reassemble" },
      });
    }
  }

  private handleFullscreen(): void {
    const container = this.viewerContainer.getContainer();
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      container.requestFullscreen?.();
    }
  }

  private handleZoomIn(): void {
    this.eventBus.publish({
      type: EventType.VIEW_ZOOM,
      timestamp: Date.now(),
      payload: { delta: 1, animated: true },
    });
  }

  private handleZoomOut(): void {
    this.eventBus.publish({
      type: EventType.VIEW_ZOOM,
      timestamp: Date.now(),
      payload: { delta: -1, animated: true },
    });
  }

  private handleScaleUp(): void {
    this.eventBus.publish({
      type: EventType.VIEW_SCALE,
      timestamp: Date.now(),
      payload: { scaleFactor: 1.1, animated: true },
    });
  }

  private handleScaleDown(): void {
    this.eventBus.publish({
      type: EventType.VIEW_SCALE,
      timestamp: Date.now(),
      payload: { scaleFactor: 0.9, animated: true },
    });
  }

  private handleFitToScreen(): void {
    this.eventBus.publish({
      type: EventType.VIEW_FIT_TO_SCREEN,
      timestamp: Date.now(),
      payload: { animated: true, margin: 1.2 },
    });
  }

  private handleSectionSelect(sectionId: string, multi: boolean): void {
    this.eventBus.publish({
      type: EventType.SECTION_SELECT,
      timestamp: Date.now(),
      payload: { sectionId, multi },
    });
  }

  private handleSectionFocus(sectionId: string): void {
    this.eventBus.publish({
      type: EventType.SECTION_FOCUS,
      timestamp: Date.now(),
      payload: { sectionId },
    });
  }

  // Event Listeners

  private onModelLoadStart(_event: ApplicationEvent): void {
    this.stateManager.updateState((state) => ({
      ...state,
      loading: true,
      error: undefined,
    }));
  }

  private onModelLoadSuccess(_event: ApplicationEvent): void {
    this.stateManager.updateState((state) => ({
      ...state,
      loading: false,
    }));

    this.statusBar.setMessage("Model loaded successfully");
  }

  private onModelLoadError(event: ApplicationEvent): void {
    const payload = event.payload as { error: string; filename: string };

    this.stateManager.updateState((state) => ({
      ...state,
      loading: false,
      error: payload.error,
    }));
  }

  private onSectionSelect(event: ApplicationEvent): void {
    const payload = event.payload as { sectionId: string; multi: boolean };

    this.sectionManager.selectSection(payload.sectionId, payload.multi);

    // Update state
    const selectedSectionIds = this.sectionManager.getSelectedSections();
    this.stateManager.updateState((state) => ({
      ...state,
      viewState: {
        ...state.viewState,
        selectedSectionIds,
      },
    }));

    // Update section panel
    this.sectionPanel.updateSectionState(payload.sectionId, { selected: true });

    // Highlight section
    this.eventBus.publish({
      type: EventType.SECTION_HIGHLIGHT,
      timestamp: Date.now(),
      payload: { sectionId: payload.sectionId, duration: 1000 },
    });
  }

  private onSectionDeselect(event: ApplicationEvent): void {
    const payload = event.payload as { sectionId?: string };

    this.sectionManager.deselectSection(payload.sectionId);

    const selectedSectionIds = this.sectionManager.getSelectedSections();
    this.stateManager.updateState((state) => ({
      ...state,
      viewState: {
        ...state.viewState,
        selectedSectionIds,
      },
    }));
  }

  private onSectionFocus(event: ApplicationEvent): void {
    const payload = event.payload as { sectionId: string };

    this.renderer.focusSection(payload.sectionId, true);

    this.stateManager.updateState((state) => ({
      ...state,
      viewState: {
        ...state.viewState,
        focusedSectionId: payload.sectionId,
      },
    }));
  }

  private onSectionHighlight(event: ApplicationEvent): void {
    const payload = event.payload as { sectionId: string; duration?: number };

    this.renderer.highlightSection(payload.sectionId, true);
    this.sectionPanel.updateSectionState(payload.sectionId, {
      highlighted: true,
    });

    // Auto-dehighlight after duration
    if (payload.duration) {
      setTimeout(() => {
        this.eventBus.publish({
          type: EventType.SECTION_DEHIGHLIGHT,
          timestamp: Date.now(),
          payload: { sectionId: payload.sectionId },
        });
      }, payload.duration);
    }
  }

  private onSectionDehighlight(event: ApplicationEvent): void {
    const payload = event.payload as { sectionId?: string };

    if (payload.sectionId) {
      this.renderer.dehighlightSection(payload.sectionId, true);
      this.sectionPanel.updateSectionState(payload.sectionId, {
        highlighted: false,
      });
    }
  }

  private onViewReset(event: ApplicationEvent): void {
    const payload = event.payload as { animated?: boolean };

    this.renderer.resetView(payload?.animated ?? true);
    this.renderer.showAllSections();

    // Reset scale to default
    const model = this.modelRepository.getCurrent();
    if (model) {
      this.stateManager.updateState((state) => ({
        ...state,
        viewState: {
          ...state.viewState,
          modelScale: 1.0,
        },
      }));
    }
  }

  private onViewZoom(event: ApplicationEvent): void {
    const payload = event.payload as {
      delta: number;
      point?: { x: number; y: number };
      animated?: boolean;
    };

    this.renderer.zoom(payload.delta, payload.point, payload.animated ?? false);

    // Update state with current zoom level
    this.stateManager.updateState((state) => ({
      ...state,
      viewState: {
        ...state.viewState,
        cameraState: {
          ...state.viewState.cameraState,
          zoom: state.viewState.cameraState.zoom * (1 + payload.delta * 0.05),
        },
      },
    }));
  }

  private onViewScale(event: ApplicationEvent): void {
    const payload = event.payload as {
      scaleFactor: number;
      animated?: boolean;
    };

    const state = this.stateManager.getState();
    const currentScale = state.viewState.modelScale;
    const newScale = currentScale * payload.scaleFactor;

    // Apply scale limits
    const minScale = state.viewState.minModelScale;
    const maxScale = state.viewState.maxModelScale;
    const clampedScale = Math.max(minScale, Math.min(maxScale, newScale));

    // Calculate the actual factor to apply
    const actualFactor = clampedScale / currentScale;

    if (Math.abs(actualFactor - 1.0) > 0.001) {
      this.renderer.scaleModel(actualFactor, payload.animated ?? false);

      // Update state
      this.stateManager.updateState((state) => ({
        ...state,
        viewState: {
          ...state.viewState,
          modelScale: clampedScale,
        },
      }));

      this.statusBar.setMessage(`Scale: ${(clampedScale * 100).toFixed(0)}%`);
    }
  }

  private onViewFitToScreen(event: ApplicationEvent): void {
    const payload = (event.payload ?? {}) as {
      animated?: boolean;
      margin?: number;
    };

    this.renderer.fitToScreen(payload.animated ?? true, payload.margin ?? 1.2);

    this.statusBar.setMessage("Fit to screen");
  }

  private onAnimationStart(event: ApplicationEvent): void {
    const payload = event.payload as { animationType: string };

    this.toolbar.setButtonEnabled("disassemble-btn", false);
    this.toolbar.setButtonEnabled("reassemble-btn", false);
    this.statusBar.setLoading(true, `${payload.animationType}...`);
  }

  private onAnimationComplete(_event: ApplicationEvent): void {
    this.toolbar.setButtonEnabled("disassemble-btn", true);
    this.toolbar.setButtonEnabled("reassemble-btn", true);
    this.statusBar.setMessage("Animation complete");
  }

  private onError(event: ApplicationEvent): void {
    const payload = event.payload as { error: string; context?: string };

    const message = payload.context
      ? `${payload.context}: ${payload.error}`
      : payload.error;

    this.statusBar.setError(message);
  }

  /**
   * Destroy application and clean up resources
   */
  destroy(): void {
    this.renderer.dispose();
    this.eventBus.clear();
    this.modelRepository.clear();

    this.toolbar.destroy();
    this.sectionPanel.destroy();
    this.statusBar.destroy();
    this.viewerContainer.destroy();
  }
}
