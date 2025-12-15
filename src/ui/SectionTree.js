/**
 * Section tree component
 * Displays hierarchical section structure
 */
import { Component } from './Component.js';
import { stateManager } from '../state/StateManager.js';

export class SectionTree extends Component {
  constructor(eventOrchestrator) {
    super();
    this.eventOrchestrator = eventOrchestrator;
    this.model = null;
    this.unsubscribe = null;
  }

  render() {
    const container = this.createElement('div', 'app-sidebar');

    container.innerHTML = `
      <div class="section-tree">
        <h2 class="section-tree-title">Model Structure</h2>
        <div class="section-tree-content"></div>
      </div>
    `;

    return container;
  }

  afterMount() {
    // Subscribe to state changes
    this.unsubscribe = stateManager.subscribe(
      this.handleStateChange.bind(this),
      ['model', 'selection', 'highlightedSectionId']
    );

    // Initial render
    this.updateTree();
  }

  beforeUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleStateChange(state) {
    this.model = state.model;
    this.updateTree();
  }

  updateTree() {
    const container = this.$('.section-tree-content');
    if (!container) return;

    if (!this.model) {
      container.innerHTML = '<p class="text-muted text-small">No model loaded</p>';
      return;
    }

    container.innerHTML = '';

    this.model.sections.forEach((section) => {
      const sectionEl = this.renderSection(section);
      container.appendChild(sectionEl);
    });
  }

  renderSection(section, level = 0) {
    const container = this.createElement('div');
    container.style.marginLeft = `${level * 16}px`;

    const item = this.createElement('div', 'section-item');
    item.dataset.sectionId = section.id;

    const state = stateManager.getState();
    if (state.selection && state.selection.has(section.id)) {
      item.classList.add('selected');
    }
    if (state.highlightedSectionId === section.id) {
      item.classList.add('highlighted');
    }

    const icon = section.children.length > 0 ? '📁' : '📄';
    item.innerHTML = `
      <span>${icon}</span>
      <span>${section.name}</span>
      <span class="text-muted text-small">(${section.type})</span>
    `;

    // Add event listeners
    this.addEventListener(item, 'click', (e) => {
      e.stopPropagation();
      this.handleSectionClick(section.id);
    });

    this.addEventListener(item, 'mouseenter', () => {
      this.handleSectionHover(section.id);
    });

    this.addEventListener(item, 'mouseleave', () => {
      this.handleSectionUnhover();
    });

    this.addEventListener(item, 'dblclick', (e) => {
      e.stopPropagation();
      this.handleSectionDoubleClick(section.id);
    });

    container.appendChild(item);

    // Render children
    if (section.children.length > 0) {
      const childrenContainer = this.createElement('div', 'section-children');
      section.children.forEach((child) => {
        childrenContainer.appendChild(this.renderSection(child, level + 1));
      });
      container.appendChild(childrenContainer);
    }

    return container;
  }

  async handleSectionClick(sectionId) {
    const state = stateManager.getState();
    if (state.selection && state.selection.has(sectionId)) {
      await this.eventOrchestrator.emit('section:deselect', { sectionId });
    } else {
      await this.eventOrchestrator.emit('section:select', { sectionId });
    }
  }

  async handleSectionDoubleClick(sectionId) {
    await this.eventOrchestrator.emit('section:focus', { sectionId });
  }

  async handleSectionHover(sectionId) {
    await this.eventOrchestrator.emit('section:highlight', { sectionId });
  }

  async handleSectionUnhover() {
    await this.eventOrchestrator.emit('section:dehighlight', {});
  }
}
