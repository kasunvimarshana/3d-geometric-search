import { Application } from "./core/Application";
import "./styles/main.css";

/**
 * Application Entry Point
 */
function main(): void {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
}

function initialize(): void {
  // Get or create root container
  let container = document.getElementById("app");

  if (!container) {
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);
  }

  // Create and initialize application
  try {
    const app = new Application(container);

    // Make app available globally for debugging
    if (import.meta.env.DEV) {
      (window as unknown as { app: Application }).app = app;
    }

    // Handle cleanup on page unload
    window.addEventListener("beforeunload", () => {
      app.destroy();
    });

    console.log("3D Geometric Search & Viewer initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);

    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: sans-serif;
          color: #f44336;
        ">
          <div style="text-align: center;">
            <h1>Application Error</h1>
            <p>${error}</p>
            <p style="color: #666; font-size: 14px;">Please refresh the page and try again.</p>
          </div>
        </div>
      `;
    }
  }
}

// Start the application
main();
