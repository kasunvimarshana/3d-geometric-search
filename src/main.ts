/**
 * Main Application Entry Point
 * 
 * Bootstraps the application with dependency injection.
 * Initializes all services, loaders, renderer, and UI components.
 */

import { EventBusService, ModelService, ViewService, ModelOperationsService } from '@application/services';
import {
  CompositeModelLoader,
  GLTFModelLoader,
  OBJModelLoader,
  STLModelLoader,
  STEPModelLoader,
} from '@infrastructure/loaders';
import { ThreeJSRenderer } from '@infrastructure/renderers';
import { ApplicationController } from '@presentation/controllers';

/**
 * Application bootstrap function
 */
async function bootstrap(): Promise<void> {
  try {
    console.log('Initializing 3D Geometric Search...');

    // Create event bus (singleton)
    const eventBus = new EventBusService();

    // Create and configure model loader
    const modelLoader = new CompositeModelLoader();
    modelLoader.registerLoader(new GLTFModelLoader());
    modelLoader.registerLoader(new OBJModelLoader());
    modelLoader.registerLoader(new STLModelLoader());
    modelLoader.registerLoader(new STEPModelLoader());

    // Create renderer
    const renderer = new ThreeJSRenderer();
    const viewportElement = document.getElementById('viewport');
    
    if (!viewportElement) {
      throw new Error('Viewport element not found');
    }

    await renderer.initialize(viewportElement);

    // Create services
    const modelService = new ModelService(modelLoader, renderer, eventBus);
    const viewService = new ViewService(renderer, eventBus);
    const operationsService = new ModelOperationsService(eventBus);

    // Create and initialize controller
    const controller = new ApplicationController(
      modelService,
      viewService,
      operationsService,
      eventBus
    );

    // Handle window resize
    window.addEventListener('resize', () => {
      renderer.resize();
    });

    // Handle cleanup on page unload
    window.addEventListener('beforeunload', () => {
      renderer.dispose();
      eventBus.clear();
    });

    console.log('Application initialized successfully');

    // Make controller available globally for debugging (optional)
    if (import.meta.env.DEV) {
      (window as Window & { app?: ApplicationController }).app = controller;
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    
    // Show error to user
    const viewport = document.getElementById('viewport');
    if (viewport) {
      viewport.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 2rem;
          text-align: center;
          color: #e74c3c;
        ">
          <div>
            <h2>Application Failed to Initialize</h2>
            <p>${error instanceof Error ? error.message : 'Unknown error occurred'}</p>
            <p style="margin-top: 1rem; font-size: 0.9em; color: #7f8c8d;">
              Please refresh the page or check the console for details.
            </p>
          </div>
        </div>
      `;
    }
  }
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    void bootstrap();
  });
} else {
  void bootstrap();
}

export {};
