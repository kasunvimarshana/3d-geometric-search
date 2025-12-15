/**
 * Welcome Screen Component
 * Displays initial welcome message and instructions
 */

export class WelcomeScreen {
  private container: HTMLElement;
  private welcomeElement: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  /**
   * Render welcome screen
   */
  private render(): void {
    this.welcomeElement = document.createElement("div");
    this.welcomeElement.className = "welcome-screen";
    this.welcomeElement.innerHTML = `
      <div class="welcome-content">
        <div class="welcome-icon">🔍</div>
        <h1>3D Geometric Search</h1>
        <p class="welcome-subtitle">Professional CAD Viewer & Model Inspector</p>
        
        <div class="welcome-features">
          <div class="feature-item">
            <span class="feature-icon">📁</span>
            <h3>Load Models</h3>
            <p>Support for glTF, OBJ, STL, and STEP formats</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <h3>Explore Sections</h3>
            <p>Navigate hierarchical model structure</p>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🔦</span>
            <h3>Inspect Properties</h3>
            <p>View detailed section information</p>
          </div>
        </div>

        <div class="welcome-actions">
          <div class="action-hint">
            <span>↑</span>
            Click "Load Model" in the control panel to begin
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.welcomeElement);
  }

  /**
   * Hide the welcome screen
   */
  hide(): void {
    if (this.welcomeElement) {
      this.welcomeElement.style.opacity = "0";
      setTimeout(() => {
        if (this.welcomeElement && this.welcomeElement.parentNode) {
          this.welcomeElement.parentNode.removeChild(this.welcomeElement);
          this.welcomeElement = null;
        }
      }, 300);
    }
  }

  /**
   * Show the welcome screen
   */
  show(): void {
    if (!this.welcomeElement) {
      this.render();
      // Trigger reflow for animation
      this.welcomeElement!.offsetHeight;
      this.welcomeElement!.style.opacity = "1";
    }
  }

  /**
   * Check if welcome screen is visible
   */
  isVisible(): boolean {
    return this.welcomeElement !== null;
  }

  /**
   * Dispose the welcome screen
   */
  dispose(): void {
    if (this.welcomeElement && this.welcomeElement.parentNode) {
      this.welcomeElement.parentNode.removeChild(this.welcomeElement);
      this.welcomeElement = null;
    }
  }
}
