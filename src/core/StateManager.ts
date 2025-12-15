/**
 * Centralized State Manager
 * Implements State Pattern with immutable updates
 */

import type { ModelState, Model3D, ViewState } from "../domain/types";
import { EventBus } from "./EventBus";
import { EventType } from "../domain/events";

export class StateManager {
  private static instance: StateManager;
  private state: ModelState;
  private subscribers: Set<(state: ModelState) => void>;
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.subscribers = new Set();
    this.state = this.getInitialState();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): ModelState {
    return {
      model: null,
      viewState: {
        zoom: 1,
        scale: 1,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        fullscreen: false,
      },
      selectionState: {
        selectedSectionIds: [],
        focusedSectionId: null,
        highlightedSectionIds: [],
      },
      disassembled: false,
      loading: false,
      error: null,
    };
  }

  /**
   * Get current state (immutable)
   */
  getState(): Readonly<ModelState> {
    return this.state;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: ModelState) => void): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state
    callback(this.state);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update state and notify subscribers
   */
  private updateState(partial: Partial<ModelState>): void {
    this.state = { ...this.state, ...partial };

    // Notify subscribers
    this.subscribers.forEach((callback) => {
      try {
        callback(this.state);
      } catch (error) {
        console.error("Error in state subscriber:", error);
      }
    });
  }

  /**
   * Load a model
   */
  loadModel(filePath: string): void {
    this.updateState({ loading: true, error: null });
    this.eventBus.emit({
      type: EventType.MODEL_LOADING,
      timestamp: new Date(),
      filePath,
    });
  }

  /**
   * Set loaded model
   */
  setModel(model: Model3D): void {
    this.updateState({
      model,
      loading: false,
      error: null,
      selectionState: {
        selectedSectionIds: [],
        focusedSectionId: null,
        highlightedSectionIds: [],
      },
    });

    this.eventBus.emit({
      type: EventType.MODEL_LOADED,
      timestamp: new Date(),
      model,
    });
  }

  /**
   * Set loading error
   */
  setError(error: string): void {
    this.updateState({ loading: false, error });
  }

  /**
   * Update view state
   */
  updateViewState(viewState: Partial<ViewState>): void {
    const newViewState = { ...this.state.viewState, ...viewState };
    this.updateState({ viewState: newViewState });

    this.eventBus.emit({
      type: EventType.VIEW_STATE_CHANGED,
      timestamp: new Date(),
      viewState: newViewState,
    });
  }

  /**
   * Reset view state
   */
  resetViewState(): void {
    const initialState = this.getInitialState();
    this.updateViewState(initialState.viewState);

    this.eventBus.emit({
      type: EventType.VIEW_RESET,
      timestamp: new Date(),
    });
  }

  /**
   * Select a section
   */
  selectSection(sectionId: string, multiSelect: boolean = false): void {
    const { model, selectionState } = this.state;
    if (!model || !model.sections.has(sectionId)) {
      return;
    }

    const section = model.sections.get(sectionId)!;
    const selectedSectionIds = multiSelect
      ? [...selectionState.selectedSectionIds, sectionId]
      : [sectionId];

    // Update section state
    section.selected = true;

    this.updateState({
      selectionState: {
        ...selectionState,
        selectedSectionIds,
        focusedSectionId: sectionId,
      },
    });

    this.eventBus.emit({
      type: EventType.SECTION_SELECTED,
      timestamp: new Date(),
      sectionId,
      section,
    });
  }

  /**
   * Deselect a section
   */
  deselectSection(sectionId: string): void {
    const { model, selectionState } = this.state;
    if (!model || !model.sections.has(sectionId)) {
      return;
    }

    const section = model.sections.get(sectionId)!;
    section.selected = false;

    const selectedSectionIds = selectionState.selectedSectionIds.filter(
      (id) => id !== sectionId
    );

    this.updateState({
      selectionState: {
        ...selectionState,
        selectedSectionIds,
      },
    });

    this.eventBus.emit({
      type: EventType.SECTION_DESELECTED,
      timestamp: new Date(),
      sectionId,
    });
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    const { model, selectionState } = this.state;
    if (!model) return;

    // Update all selected sections
    selectionState.selectedSectionIds.forEach((id) => {
      const section = model.sections.get(id);
      if (section) {
        section.selected = false;
      }
    });

    this.updateState({
      selectionState: {
        selectedSectionIds: [],
        focusedSectionId: null,
        highlightedSectionIds: [],
      },
    });
  }

  /**
   * Highlight a section
   */
  highlightSection(sectionId: string): void {
    const { model, selectionState } = this.state;
    if (!model || !model.sections.has(sectionId)) {
      return;
    }

    const section = model.sections.get(sectionId)!;
    section.highlighted = true;

    const highlightedSectionIds = [
      ...selectionState.highlightedSectionIds,
      sectionId,
    ];

    this.updateState({
      selectionState: {
        ...selectionState,
        highlightedSectionIds,
      },
    });

    this.eventBus.emit({
      type: EventType.SECTION_HIGHLIGHTED,
      timestamp: new Date(),
      sectionId,
    });
  }

  /**
   * Dehighlight a section
   */
  dehighlightSection(sectionId: string): void {
    const { model, selectionState } = this.state;
    if (!model || !model.sections.has(sectionId)) {
      return;
    }

    const section = model.sections.get(sectionId)!;
    section.highlighted = false;

    const highlightedSectionIds = selectionState.highlightedSectionIds.filter(
      (id) => id !== sectionId
    );

    this.updateState({
      selectionState: {
        ...selectionState,
        highlightedSectionIds,
      },
    });

    this.eventBus.emit({
      type: EventType.SECTION_DEHIGHLIGHTED,
      timestamp: new Date(),
      sectionId,
    });
  }

  /**
   * Toggle disassembly state
   */
  toggleDisassembly(): void {
    const disassembled = !this.state.disassembled;
    this.updateState({ disassembled });

    this.eventBus.emit({
      type: disassembled
        ? EventType.MODEL_DISASSEMBLED
        : EventType.MODEL_REASSEMBLED,
      timestamp: new Date(),
    });
  }

  /**
   * Focus on a section
   */
  focusSection(sectionId: string): void {
    const { model, selectionState } = this.state;
    if (!model || !model.sections.has(sectionId)) {
      return;
    }

    const section = model.sections.get(sectionId)!;

    this.updateState({
      selectionState: {
        ...selectionState,
        focusedSectionId: sectionId,
      },
    });

    this.eventBus.emit({
      type: EventType.SECTION_FOCUSED,
      timestamp: new Date(),
      sectionId,
      section,
    });
  }

  /**
   * Navigate to a section
   */
  navigateToSection(sectionId: string): void {
    this.eventBus.emit({
      type: EventType.NAVIGATE_TO_SECTION,
      timestamp: new Date(),
      sectionId,
    });
  }

  /**
   * Reset entire state
   */
  reset(): void {
    this.state = this.getInitialState();
    this.subscribers.forEach((callback) => callback(this.state));
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance();
