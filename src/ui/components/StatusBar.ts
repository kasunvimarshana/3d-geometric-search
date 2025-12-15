import { UIComponent } from "./UIComponent";

interface StatusBarProps {
  message?: string;
  loading?: boolean;
  error?: string;
}

/**
 * Status Bar Component
 * Displays application status, loading indicators, and errors
 */
export class StatusBar extends UIComponent {
  private props: StatusBarProps;

  constructor(props: StatusBarProps = {}) {
    super("div", "status-bar");
    this.props = props;
    this.render();
  }

  private render(): void {
    let content = "";

    if (this.props.loading) {
      content = `
        <div class="status-loading">
          <span class="spinner"></span>
          <span>${this.props.message || "Loading..."}</span>
        </div>
      `;
    } else if (this.props.error) {
      content = `
        <div class="status-error">
          <span class="icon">⚠️</span>
          <span>${this.props.error}</span>
        </div>
      `;
    } else if (this.props.message) {
      content = `
        <div class="status-message">
          <span>${this.props.message}</span>
        </div>
      `;
    } else {
      content = `
        <div class="status-ready">
          <span>Ready</span>
        </div>
      `;
    }

    this.element.innerHTML = content;
  }

  update(data: StatusBarProps): void {
    this.props = { ...this.props, ...data };
    this.render();
  }

  setMessage(message: string): void {
    this.update({ message, loading: false, error: undefined });
  }

  setLoading(loading: boolean, message?: string): void {
    this.update({ loading, message, error: undefined });
  }

  setError(error: string): void {
    this.update({ error, loading: false });
  }

  clearError(): void {
    this.update({ error: undefined });
  }
}
