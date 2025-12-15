/**
 * Application entry point
 * Initializes and starts the 3D Geometric Search application
 */
import { Application } from './Application.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get root container
    const container = document.getElementById('app');

    if (!container) {
      throw new Error('Root container #app not found');
    }

    // Create and initialize application
    const app = new Application(container);
    await app.initialize();

    // Make app globally accessible for debugging
    window.app = app;

    console.log('✓ 3D Geometric Search application started');
    console.log('Supported formats:', ['glTF/GLB', 'OBJ/MTL', 'STL', 'STEP (partial)']);
  } catch (error) {
    console.error('Failed to start application:', error);

    // Show error to user
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: system-ui, -apple-system, sans-serif;
          color: #e74c3c;
        ">
          <div style="text-align: center; max-width: 500px; padding: 2rem;">
            <h1 style="font-size: 2rem; margin-bottom: 1rem;">⚠️ Initialization Error</h1>
            <p style="margin-bottom: 1rem;">${error.message}</p>
            <p style="font-size: 0.875rem; color: #7f8c8d;">
              Please check the console for more details.
            </p>
          </div>
        </div>
      `;
    }
  }
});

// Handle cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.app && window.app.dispose) {
    window.app.dispose();
  }
});
