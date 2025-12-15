/**
 * Main Application Class
 * Orchestrates all components and initializes the application
 */

import { ModelViewer } from "./components/ModelViewer";
import { NavigationPanel } from "./components/NavigationPanel";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { ControlPanel } from "./components/ControlPanel";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { StateManager } from "./core/StateManager";
import { EventBus } from "./core/EventBus";
import { EventType } from "./domain/events";
import "./styles/main.css";

export class Application {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private viewer: ModelViewer | null = null;
  private navigationPanel: NavigationPanel | null = null;
  private propertiesPanel: PropertiesPanel | null = null;
  private controlPanel: ControlPanel | null = null;
  private welcomeScreen: WelcomeScreen | null = null;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Initialize the application
   */
  initialize(): void {
    console.log("Initializing 3D Geometric Search Application...");

    try {
      this.createLayout();
      this.initializeComponents();
      this.setupGlobalErrorHandling();

      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Failed to initialize application:", error);
      this.showErrorMessage(
        "Failed to initialize application. Please refresh the page."
      );
    }
  }

  /**
   * Create application layout
   */
  private createLayout(): void {
    const app = document.getElementById("app");
    if (!app) {
      throw new Error("App container not found");
    }

    app.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <div class="header-content">
            <h1 class="app-title">
              <span class="icon">🔍</span>
              3D Geometric Search
            </h1>
            <div class="header-info">
              <span class="version">v2.0.0</span>
              <span class="formats">glTF • OBJ • STL • STEP</span>
            </div>
          </div>
        </header>
        
        <div class="app-body">
          <aside class="left-sidebar">
            <div id="controlPanel"></div>
          </aside>
          
          <main class="main-content">
            <div id="viewerContainer" class="viewer-container"></div>
          </main>
          
          <aside class="right-sidebar">
            <div id="navigationPanel"></div>
            <div id="propertiesPanel"></div>
          </aside>
        </div>
        
        <div id="messageOverlay" class="message-overlay hidden"></div>
      </div>
    `;
  }

  /**
   * Initialize all components
   */
  private initializeComponents(): void {
    // Get containers
    const viewerContainer = document.getElementById("viewerContainer");
    const navigationContainer = document.getElementById("navigationPanel");
    const propertiesContainer = document.getElementById("propertiesPanel");
    const controlContainer = document.getElementById("controlPanel");

    if (
      !viewerContainer ||
      !navigationContainer ||
      !propertiesContainer ||
      !controlContainer
    ) {
      throw new Error("Required containers not found");
    }

    // Initialize components
    this.viewer = new ModelViewer(viewerContainer);
    this.navigationPanel = new NavigationPanel(navigationContainer);
    this.propertiesPanel = new PropertiesPanel(propertiesContainer);
    this.controlPanel = new ControlPanel(controlContainer);
    this.welcomeScreen = new WelcomeScreen(viewerContainer);

    // Hide welcome screen when model is loaded
    this.eventBus.on(EventType.MODEL_LOADED, () => {
      if (this.welcomeScreen) {
        this.welcomeScreen.hide();
      }
    });

    console.log("All components initialized");
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error);
      this.showErrorMessage("An unexpected error occurred");
    });

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.showErrorMessage("An unexpected error occurred");
    });
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    this.showMessage(
      `
        <div class="error-message">
          <span class="icon">⚠️</span>
          <p>${message}</p>
        </div>
      `,
      3000
    );
  }

  /**
   * Show message overlay
   */
  private showMessage(html: string, duration?: number): void {
    const overlay = document.getElementById("messageOverlay");
    if (!overlay) return;

    overlay.innerHTML = html;
    overlay.classList.remove("hidden");

    if (duration) {
      setTimeout(() => {
        overlay.classList.add("hidden");
      }, duration);
    }
  }

  /**
   * Dispose application and cleanup resources
   */
  dispose(): void {
    console.log("Disposing application...");

    if (this.viewer) {
      this.viewer.dispose();
    }

    if (this.welcomeScreen) {
      this.welcomeScreen.dispose();
    }

    this.stateManager.reset();
    this.eventBus.clear();

    console.log("Application disposed");
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = new Application();
    app.initialize();
  });
} else {
  const app = new Application();
  app.initialize();
}
