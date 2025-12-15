import { Application } from './Application.js';

/**
 * Main entry point
 */
async function main() {
  try {
    console.log('Starting 3D Model Viewer...');

    const app = new Application();
    await app.initialize();

    // Make app globally accessible for debugging
    window.app = app;

    console.log('3D Model Viewer ready');
  } catch (error) {
    console.error('Failed to start application:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <h1>Failed to start application</h1>
        <p style="color: red;">${error.message}</p>
        <p>Please check the console for more details.</p>
      </div>
    `;
  }
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
