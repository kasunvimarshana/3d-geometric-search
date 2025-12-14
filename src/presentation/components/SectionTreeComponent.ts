/**
 * Section Tree Component
 *
 * Displays hierarchical model structure.
 * Handles section selection and navigation.
 */

import { Model } from '@domain/models/Model';
import { ModelSection } from '@domain/models/ModelSection';

export class SectionTreeComponent {
  private container: HTMLElement;
  private onSectionSelect?: (sectionId: string) => void;
  private onSectionFocus?: (sectionId: string) => void;

  constructor(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Container element not found: ${containerId}`);
    }
    this.container = element;
  }

  setModel(model: Model): void {
    try {
      if (!model) {
        console.error('[SectionTree] Null model provided');
        this.clear();
        return;
      }

      this.clear();

      const rootSections = model.getRootSections();

      if (rootSections.length === 0) {
        this.container.innerHTML = '<p class="empty-message">No sections available</p>';
        return;
      }

      const tree = document.createElement('ul');
      tree.className = 'tree-root';

      rootSections.forEach((section) => {
        try {
          const node = this.createNode(section, model);
          tree.appendChild(node);
        } catch (error) {
          console.error('[SectionTree] Error creating node:', error);
        }
      });

      this.container.appendChild(tree);
    } catch (error) {
      console.error('[SectionTree] Error setting model:', error);
      this.container.innerHTML = '<p class="error-message">Error loading model structure</p>';
    }
  }

  clear(): void {
    try {
      this.container.innerHTML = '';
    } catch (error) {
      console.error('[SectionTree] Error clearing tree:', error);
    }
  }

  onSelect(handler: (sectionId: string) => void): void {
    if (typeof handler !== 'function') {
      console.error('[SectionTree] onSelect: handler must be a function');
      return;
    }
    this.onSectionSelect = handler;
  }

  onFocus(handler: (sectionId: string) => void): void {
    if (typeof handler !== 'function') {
      console.error('[SectionTree] onFocus: handler must be a function');
      return;
    }
    this.onSectionFocus = handler;
  }

  private createNode(section: ModelSection, model: Model): HTMLElement {
    const li = document.createElement('li');
    li.className = 'tree-node';
    li.dataset['sectionId'] = section.id;

    try {
      const content = document.createElement('div');
      content.className = 'tree-node-content';

      // Expand/collapse button for nodes with children
      const children = model.getChildSections(section.id);
      if (children.length > 0) {
        const toggle = document.createElement('button');
        toggle.className = 'tree-toggle';
        toggle.textContent = '▶';
        toggle.onclick = (e): void => {
          e.stopPropagation();
          this.toggleNode(li);
        };
        content.appendChild(toggle);
      } else {
        const spacer = document.createElement('span');
        spacer.className = 'tree-spacer';
        content.appendChild(spacer);
      }

      // Section name
      const label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = section.name;
      label.onclick = (): void => {
        this.handleSelect(section.id);
      };
      content.appendChild(label);

      // Focus button
      const focusBtn = document.createElement('button');
      focusBtn.className = 'tree-focus-btn';
      focusBtn.textContent = '🎯';
      focusBtn.title = 'Focus on section';
      focusBtn.onclick = (e): void => {
        e.stopPropagation();
        this.handleFocus(section.id);
      };
      content.appendChild(focusBtn);

      li.appendChild(content);

      // Add children
      if (children.length > 0) {
        const childList = document.createElement('ul');
        childList.className = 'tree-children';

        children.forEach((child) => {
          try {
            const childNode = this.createNode(child, model);
            childList.appendChild(childNode);
          } catch (error) {
            console.error('[SectionTree] Error creating child node:', error);
          }
        });

        li.appendChild(childList);
      }
    } catch (error) {
      console.error('[SectionTree] Error in createNode:', error);
      li.innerHTML = '<div class="tree-node-content error">Error loading section</div>';
    }

    return li;
  }

  private toggleNode(node: HTMLElement): void {
    try {
      node.classList.toggle('expanded');
      const toggle = node.querySelector('.tree-toggle');
      if (toggle) {
        toggle.textContent = node.classList.contains('expanded') ? '▼' : '▶';
      }
    } catch (error) {
      console.error('[SectionTree] Error toggling node:', error);
    }
  }

  private handleSelect(sectionId: string): void {
    try {
      if (!sectionId) {
        console.warn('[SectionTree] handleSelect: invalid sectionId');
        return;
      }

      // Remove previous selection
      this.container.querySelectorAll('.tree-node-content').forEach((el) => {
        el.classList.remove('selected');
      });

      // Add selection to clicked node
      const node = this.container.querySelector(`[data-section-id="${sectionId}"]`);
      if (node) {
        const content = node.querySelector('.tree-node-content');
        content?.classList.add('selected');
      }

      if (this.onSectionSelect) {
        this.onSectionSelect(sectionId);
      }
    } catch (error) {
      console.error('[SectionTree] Error handling select:', error);
    }
  }

  private handleFocus(sectionId: string): void {
    try {
      if (!sectionId) {
        console.warn('[SectionTree] handleFocus: invalid sectionId');
        return;
      }

      if (this.onSectionFocus) {
        this.onSectionFocus(sectionId);
      }
    } catch (error) {
      console.error('[SectionTree] Error handling focus:', error);
    }
  }
}
