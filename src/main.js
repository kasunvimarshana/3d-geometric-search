/**
 * Main Entry Point
 * Initializes and starts the 3D Geometric Viewer application
 * Wires together all controllers and services with the new UI
 */

import { ApplicationController } from './controllers/ApplicationController.js';

/**
 * Initialize UI event handlers for the new layout
 */
function initializeUIHandlers(app) {
  // Theme toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }

  // Sidebar toggle
  const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('app-sidebar--collapsed');
    });
  }

  // Help modal/overlay
  const helpBtn = document.getElementById('help-btn');
  const helpModal = document.getElementById('help-overlay');
  const closeHelpBtn = document.getElementById('close-help-btn');

  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => {
      helpModal.classList.remove('hidden');
    });
  }

  if (closeHelpBtn && helpModal) {
    closeHelpBtn.addEventListener('click', () => {
      helpModal.classList.add('hidden');
    });

    // Close on backdrop click
    helpModal.addEventListener('click', e => {
      if (e.target === helpModal) {
        helpModal.classList.add('hidden');
      }
    });
  }

  // Tab navigation
  const tabs = document.querySelectorAll('.tabs__tab');
  const panels = document.querySelectorAll('.tabs__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.getAttribute('aria-controls');

      // Update tabs
      tabs.forEach(t => {
        t.classList.remove('tabs__tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('tabs__tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      panels.forEach(p => {
        p.classList.remove('tabs__panel--active');
      });
      const activePanel = document.getElementById(targetPanel);
      if (activePanel) {
        activePanel.classList.add('tabs__panel--active');
      }
    });
  });

  // Close modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && helpModal && !helpModal.classList.contains('hidden')) {
      helpModal.classList.add('hidden');
    }
  });

  // Expand/Collapse all sections buttons
  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      const sectionItems = document.querySelectorAll('.section-item.collapsed');
      sectionItems.forEach(item => {
        item.classList.remove('collapsed');
        const toggle = item.querySelector('.section-toggle');
        if (toggle) toggle.textContent = '▼';
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      const sectionItems = document.querySelectorAll('.section-item:not(.collapsed)');
      sectionItems.forEach(item => {
        const hasChildren = item.querySelector('.section-children');
        if (hasChildren) {
          item.classList.add('collapsed');
          const toggle = item.querySelector('.section-toggle');
          if (toggle) toggle.textContent = '▶';
        }
      });
    });
  }
}

/**
 * Global error handler
 */
function setupGlobalErrorHandler() {
  window.addEventListener('error', event => {
    console.error('Global error:', event.error);

    // Show user-friendly error notification
    showErrorNotification('An unexpected error occurred. Check console for details.');
  });

  window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);

    // Show user-friendly error notification
    showErrorNotification('An operation failed. Check console for details.');
  });
}

/**
 * Show error notification to user
 */
function showErrorNotification(message) {
  const statusBar = document.querySelector('.app-statusbar__left');
  if (statusBar) {
    const errorEl = document.createElement('span');
    errorEl.className = 'badge badge--error';
    errorEl.textContent = message;
    errorEl.style.marginLeft = 'var(--space-2)';

    statusBar.appendChild(errorEl);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorEl.remove();
    }, 5000);
  }
}

/**
 * Initialize the application when DOM is ready
 */
function main() {
  console.log('🚀 Starting 3D Geometric Viewer v3.0...');

  try {
    // Setup global error handling
    setupGlobalErrorHandler();

    // Get canvas element
    const canvas = document.getElementById('canvas-3d');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create and initialize the application
    const app = new ApplicationController(canvas);

    // Initialize UI handlers for new layout
    initializeUIHandlers(app);

    // Make app globally accessible for debugging
    window.app = app;

    console.log('✅ Application started successfully');
    console.log('💡 Press ? or click help button for keyboard shortcuts');

    // Update status bar
    const statusModel = document.getElementById('status-model');
    if (statusModel) {
      statusModel.textContent = 'Ready - Load a model to begin';
    }
  } catch (error) {
    console.error('❌ Failed to start application:', error);

    // Display error to user
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          font-family: var(--font-sans, sans-serif);
          background-color: var(--bg-primary, #f9fafb);
        ">
          <div style="
            text-align: center;
            padding: var(--space-8, 2rem);
            max-width: 600px;
          ">
            <h1 style="
              color: var(--error-500, #ef4444);
              font-size: var(--text-3xl, 1.875rem);
              margin-bottom: var(--space-4, 1rem);
            ">
              Failed to Start Application
            </h1>
            <p style="
              color: var(--text-primary, #111827);
              font-size: var(--text-base, 1rem);
              margin-bottom: var(--space-2, 0.5rem);
            ">
              ${error.message}
            </p>
            <p style="
              color: var(--text-secondary, #6b7280);
              font-size: var(--text-sm, 0.875rem);
            ">
              Check the browser console for more details.
            </p>
            <button 
              onclick="location.reload()" 
              style="
                margin-top: var(--space-6, 1.5rem);
                padding: var(--space-3, 0.75rem) var(--space-6, 1.5rem);
                background-color: var(--primary-500, #2563eb);
                color: white;
                border: none;
                border-radius: var(--radius-md, 0.375rem);
                cursor: pointer;
                font-size: var(--text-sm, 0.875rem);
              "
            >
              Reload Page
            </button>
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
