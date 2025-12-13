/**
 * Main Entry Point
 * Initializes and starts the 3D Geometric Search application
 */

import { ApplicationController } from './controllers/ApplicationController.js';

/**
 * Initialize the application when DOM is ready
 */
function main() {
  console.log('Starting 3D Geometric Search application...');
  
  try {
    // Create and initialize the application
    const app = new ApplicationController();
    
    // Make app globally accessible for debugging (optional)
    window.app = app;
    
    console.log('Application started successfully');
    console.log('Select a model from the dropdown to begin');
  } catch (error) {
    console.error('Failed to start application:', error);
    
    // Display error to user
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: sans-serif;
          color: #e74c3c;
        ">
          <div style="text-align: center;">
            <h1>Failed to Start Application</h1>
            <p>${error.message}</p>
            <p style="color: #95a5a6; font-size: 14px;">
              Check the console for more details.
            </p>
          </div>
        </div>
      `;
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
