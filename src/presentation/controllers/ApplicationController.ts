/**
 * Application Controller
 *
 * Main controller coordinating all UI components and services.
 * Handles user interactions and event routing.
 */

import { ModelService, ViewService, ModelOperationsService } from '@application/services';
import { IEventBus } from '@domain/interfaces/IEventBus';
import { EventType } from '@domain/events/DomainEvents';
import {
  SectionTreeComponent,
  PropertiesPanelComponent,
  LoadingOverlayComponent,
  StatusBarComponent,
} from '@presentation/components';

export class ApplicationController {
  private sectionTree: SectionTreeComponent;
  private propertiesPanel: PropertiesPanelComponent;
  private loadingOverlay: LoadingOverlayComponent;
  private statusBar: StatusBarComponent;
  private fileInput: HTMLInputElement;

  constructor(
    private readonly modelService: ModelService,
    private readonly viewService: ViewService,
    private readonly operationsService: ModelOperationsService,
    private readonly eventBus: IEventBus
  ) {
    // Initialize components
    this.sectionTree = new SectionTreeComponent('section-tree');
    this.propertiesPanel = new PropertiesPanelComponent('properties-panel');
    this.loadingOverlay = new LoadingOverlayComponent('loading-overlay');
    this.statusBar = new StatusBarComponent('status-text', 'model-info');

    const fileInputEl = document.getElementById('file-input') as HTMLInputElement;
    if (!fileInputEl) {
      throw new Error('File input element not found');
    }
    this.fileInput = fileInputEl;

    this.setupEventListeners();
    this.setupDomainEventHandlers();
  }

  private setupEventListeners(): void {
    // Load model button
    const loadBtn = document.getElementById('load-model-btn');
    loadBtn?.addEventListener('click', () => this.handleLoadModel());

    // File input
    this.fileInput.addEventListener('change', (e) => this.handleFileSelected(e));

    // View controls
    document.getElementById('reset-view-btn')?.addEventListener('click', () => {
      this.viewService.resetView();
      this.statusBar.setStatus('View reset', 'success');
    });

    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
      this.viewService.zoomIn();
    });

    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
      this.viewService.zoomOut();
    });

    document.getElementById('fit-view-btn')?.addEventListener('click', () => {
      this.viewService.fitToView();
      this.statusBar.setStatus('Fitted to view', 'success');
    });

    // Display options
    document.getElementById('wireframe-toggle')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.viewService.setWireframe(checked);
    });

    document.getElementById('grid-toggle')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.viewService.setGridVisible(checked);
    });

    document.getElementById('axes-toggle')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.viewService.setAxesVisible(checked);
    });

    // Operations
    document.getElementById('disassemble-btn')?.addEventListener('click', () => {
      this.handleDisassemble();
    });

    document.getElementById('reassemble-btn')?.addEventListener('click', () => {
      this.handleReassemble();
    });

    // Fullscreen
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      this.handleFullscreen();
    });

    // Section tree handlers
    this.sectionTree.onSelect((sectionId) => {
      this.modelService.selectSection(sectionId);
    });

    this.sectionTree.onFocus((sectionId) => {
      this.modelService.focusOnSection(sectionId);
    });
  }

  private setupDomainEventHandlers(): void {
    try {
      // Model loading event
      this.eventBus.subscribe(EventType.MODEL_LOADING, (event) => {
        try {
          const payload = event.payload as { filename: string };
          this.loadingOverlay.show(`Loading ${payload.filename}...`);
          this.statusBar.setStatus('Loading model...', 'info');
        } catch (error) {
          console.error('[Controller] Error handling MODEL_LOADING:', error);
        }
      });

      // Model loaded event
      this.eventBus.subscribe(EventType.MODEL_LOADED, (event) => {
        try {
          const payload = event.payload as {
            filename: string;
            sectionCount: number;
            format: string;
          };
          this.loadingOverlay.hide();

          const model = this.modelService.getCurrentModel();
          if (model) {
            this.sectionTree.setModel(model);
            this.statusBar.setStatus('Model loaded successfully', 'success');
            this.statusBar.setModelInfo(
              `${payload.filename} | ${payload.sectionCount} sections | ${payload.format.toUpperCase()}`
            );
          } else {
            console.warn('[Controller] Model loaded but getCurrentModel returned null');
          }
        } catch (error) {
          console.error('[Controller] Error handling MODEL_LOADED:', error);
          this.loadingOverlay.hide();
          this.statusBar.setStatus('Error displaying model', 'error');
        }
      });

      // Model load error event
      this.eventBus.subscribe(EventType.MODEL_LOAD_ERROR, (event) => {
        try {
          const payload = event.payload as { error: Error };
          this.loadingOverlay.hide();
          const message = payload.error?.message || 'Unknown error';
          this.statusBar.setStatus(`Error: ${message}`, 'error');
        } catch (error) {
          console.error('[Controller] Error handling MODEL_LOAD_ERROR:', error);
          this.loadingOverlay.hide();
        }
      });

      // Section selected event
      this.eventBus.subscribe(EventType.SECTION_SELECTED, () => {
        try {
          const section = this.modelService.getSelectedSection();
          if (section) {
            this.propertiesPanel.showSection(section);
            this.statusBar.setStatus(`Selected: ${section.name}`, 'info');
          }
        } catch (error) {
          console.error('[Controller] Error handling SECTION_SELECTED:', error);
        }
      });

      // Section focused event
      this.eventBus.subscribe(EventType.SECTION_FOCUSED, (event) => {
        try {
          const payload = event.payload as { sectionId: string };
          this.statusBar.setStatus(`Focused on section: ${payload.sectionId}`, 'info');
        } catch (error) {
          console.error('[Controller] Error handling SECTION_FOCUSED:', error);
        }
      });

      // Disassembly/reassembly events
      this.eventBus.subscribe(EventType.MODEL_DISASSEMBLED, () => {
        try {
          this.statusBar.setStatus('Model disassembled', 'success');
        } catch (error) {
          console.error('[Controller] Error handling MODEL_DISASSEMBLED:', error);
        }
      });

      this.eventBus.subscribe(EventType.MODEL_REASSEMBLED, () => {
        try {
          this.statusBar.setStatus('Model reassembled', 'success');
        } catch (error) {
          console.error('[Controller] Error handling MODEL_REASSEMBLED:', error);
        }
      });

      // Model cleared event
      this.eventBus.subscribe(EventType.MODEL_CLEARED, () => {
        try {
          this.sectionTree.clear();
          this.propertiesPanel.clear();
          this.statusBar.setModelInfo('');
          this.statusBar.setStatus('Model cleared', 'info');
        } catch (error) {
          console.error('[Controller] Error handling MODEL_CLEARED:', error);
        }
      });

      // Fullscreen events
      this.eventBus.subscribe(EventType.VIEW_FULLSCREEN, (event) => {
        try {
          const payload = event.payload as { enabled: boolean };
          this.statusBar.setStatus(
            payload.enabled ? 'Entered fullscreen' : 'Exited fullscreen',
            'success'
          );
        } catch (error) {
          console.error('[Controller] Error handling VIEW_FULLSCREEN:', error);
        }
      });

      this.eventBus.subscribe(EventType.VIEW_FULLSCREEN_ERROR, (event) => {
        try {
          const payload = event.payload as { error: Error };
          const message = payload.error?.message || 'Fullscreen not supported';
          this.statusBar.setStatus(message, 'error');
        } catch (error) {
          console.error('[Controller] Error handling VIEW_FULLSCREEN_ERROR:', error);
        }
      });
    } catch (error) {
      console.error('[Controller] Fatal error setting up event handlers:', error);
      this.statusBar.setStatus('Application error', 'error');
    }
  }

  private handleLoadModel(): void {
    this.fileInput.click();
  }

  private async handleFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      console.warn('[Controller] No file selected');
      return;
    }

    try {
      await this.modelService.loadModel(file);
    } catch (error) {
      console.error('[Controller] File load error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.statusBar.setStatus(`Failed to load model: ${errorMsg}`, 'error');
      this.loadingOverlay.hide(); // Ensure overlay is hidden on error
    } finally {
      // Reset input to allow loading the same file again
      input.value = '';
    }
  }

  private handleDisassemble(): void {
    try {
      const model = this.modelService.getCurrentModel();
      if (!model) {
        this.statusBar.setStatus('No model loaded', 'error');
        return;
      }

      if (this.operationsService.getDisassemblyState()) {
        this.statusBar.setStatus('Model is already disassembled', 'info');
        return;
      }

      this.operationsService.disassemble(model);
    } catch (error) {
      console.error('[Controller] Disassemble error:', error);
      this.statusBar.setStatus('Failed to disassemble model', 'error');
    }
  }

  private handleReassemble(): void {
    try {
      if (!this.operationsService.getDisassemblyState()) {
        this.statusBar.setStatus('Model is not disassembled', 'error');
        return;
      }

      this.operationsService.reassemble();
    } catch (error) {
      console.error('[Controller] Reassemble error:', error);
      this.statusBar.setStatus('Failed to reassemble model', 'error');
    }
  }

  private async handleFullscreen(): Promise<void> {
    const viewport = document.getElementById('viewport');
    if (!viewport) {
      console.error('[Controller] Viewport element not found');
      this.statusBar.setStatus('Cannot enter fullscreen: viewport not found', 'error');
      return;
    }

    try {
      await this.viewService.toggleFullscreen(viewport);
      // Status is set by event handler
    } catch (error) {
      console.error('[Controller] Fullscreen error:', error);
      // Error status is set by event handler
    }
  }
}
