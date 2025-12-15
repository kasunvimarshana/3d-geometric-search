import { IStateManager } from "@domain/interfaces";
import { ApplicationState, ViewMode, AnimationState } from "@domain/types";

/**
 * State Manager
 * Implements centralized, immutable state management
 * Follows Observer pattern for state subscriptions
 */
export class StateManager implements IStateManager {
  private state: ApplicationState;
  private listeners: Set<(state: ApplicationState) => void>;

  constructor(initialState?: Partial<ApplicationState>) {
    this.state = this.createInitialState(initialState);
    this.listeners = new Set();
  }

  private createInitialState(
    partial?: Partial<ApplicationState>
  ): ApplicationState {
    return {
      model: partial?.model,
      viewState: partial?.viewState || {
        mode: ViewMode.NORMAL,
        cameraState: {
          position: { x: 0, y: 0, z: 10 },
          target: { x: 0, y: 0, z: 0 },
          zoom: 1,
          fieldOfView: 75,
          minZoomDistance: 0.1,
          maxZoomDistance: 1000,
        },
        selectedSectionIds: [],
        highlightedSectionIds: [],
        focusedSectionId: undefined,
        isolatedSectionIds: [],
        animationState: AnimationState.ASSEMBLED,
        modelScale: 1.0,
        minModelScale: 0.1,
        maxModelScale: 10.0,
      },
      loading: partial?.loading || false,
      error: partial?.error,
    };
  }

  /**
   * Get current state (readonly)
   */
  getState(): Readonly<ApplicationState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Update state immutably
   */
  updateState(updater: (state: ApplicationState) => ApplicationState): void {
    const previousState = this.state;

    try {
      // Create new state object
      const newState = updater({ ...this.state });

      // Validate state
      if (!this.validateState(newState)) {
        throw new Error("Invalid state update");
      }

      this.state = newState;

      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      // Rollback on error
      this.state = previousState;
      throw new Error(`State update failed: ${error}`);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ApplicationState) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.state = this.createInitialState();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    const frozenState = Object.freeze({ ...this.state });
    this.listeners.forEach((listener) => {
      try {
        listener(frozenState);
      } catch (error) {
        console.error("Error in state listener:", error);
      }
    });
  }

  private validateState(state: ApplicationState): boolean {
    // Basic validation
    if (!state.viewState) return false;
    if (!state.viewState.cameraState) return false;
    if (!Array.isArray(state.viewState.selectedSectionIds)) return false;
    if (!Array.isArray(state.viewState.highlightedSectionIds)) return false;
    if (!Array.isArray(state.viewState.isolatedSectionIds)) return false;

    return true;
  }
}
