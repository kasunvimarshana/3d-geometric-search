/**
 * Toolbar component
 * Provides main action buttons
 */
import { Component } from './Component.js';

export class Toolbar extends Component {
  constructor(eventOrchestrator) {
    super();
    this.eventOrchestrator = eventOrchestrator;
  }

  render() {
    const toolbar = this.createElement('div', 'app-toolbar');

    toolbar.innerHTML = `
      <button class="btn btn-primary" data-action="load">
        📁 Load Model
      </button>
      <button class="btn" data-action="fit">
        🎯 Fit to Screen
      </button>
      <button class="btn" data-action="reset">
        🔄 Reset Camera
      </button>
      <button class="btn" data-action="disassemble" data-toggle="true">
        🔧 Disassemble
      </button>
      <button class="btn" data-action="fullscreen">
        ⛶ Fullscreen
      </button>
      <button class="btn" data-action="clear">
        🗑️ Clear
      </button>
      <div style="flex: 1;"></div>
      <button class="btn btn-icon" data-action="toggle-sidebar" title="Toggle Sidebar">
        ☰
      </button>
      <button class="btn btn-icon" data-action="toggle-properties" title="Toggle Properties">
        ℹ️
      </button>
    `;

    return toolbar;
  }

  afterMount() {
    // Add event listeners for all buttons
    const buttons = this.$$('button[data-action]');
    buttons.forEach((button) => {
      this.addEventListener(button, 'click', this.handleButtonClick.bind(this));
    });

    // Create hidden file input
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.gltf,.glb,.obj,.stl,.step,.stp';
    this.fileInput.style.display = 'none';
    this.addEventListener(this.fileInput, 'change', this.handleFileSelect.bind(this));
    this.element.appendChild(this.fileInput);
  }

  async handleButtonClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;

    switch (action) {
      case 'load':
        this.fileInput.click();
        break;
      case 'fit':
        await this.eventOrchestrator.emit('camera:fit');
        break;
      case 'reset':
        await this.eventOrchestrator.emit('camera:reset');
        break;
      case 'disassemble':
        const isDisassembled = button.dataset.toggle === 'true';
        if (isDisassembled) {
          await this.eventOrchestrator.emit('model:reassemble');
          button.textContent = '🔧 Disassemble';
          button.dataset.toggle = 'false';
        } else {
          await this.eventOrchestrator.emit('model:disassemble');
          button.textContent = '🔨 Reassemble';
          button.dataset.toggle = 'true';
        }
        break;
      case 'fullscreen':
        await this.eventOrchestrator.emit('view:fullscreen');
        break;
      case 'clear':
        await this.eventOrchestrator.emit('model:clear');
        break;
      case 'toggle-sidebar':
        await this.eventOrchestrator.emit('ui:toggle-sidebar');
        break;
      case 'toggle-properties':
        await this.eventOrchestrator.emit('ui:toggle-properties');
        break;
    }
  }

  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Emit file-selected event
    // File loading will be handled by the main application
    this.emit('file-selected', { file });

    // Reset input
    this.fileInput.value = '';
  }

  emit(eventName, detail) {
    const event = new CustomEvent(eventName, { detail });
    this.element.dispatchEvent(event);
  }
}
