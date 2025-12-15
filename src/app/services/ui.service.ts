import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UIState {
  rightOverlay: { visible: boolean };
  help: { visible: boolean };
}

@Injectable({
  providedIn: 'root'
})
export class UIService {
  private stateSubject = new BehaviorSubject<UIState>({
    rightOverlay: { visible: true },
    help: { visible: false }
  });

  public state$: Observable<UIState> = this.stateSubject.asObservable();

  get currentState(): UIState {
    return this.stateSubject.value;
  }

  toggleRightOverlay(): void {
    this.updateState({
      rightOverlay: { visible: !this.currentState.rightOverlay.visible }
    });
  }

  toggleHelp(): void {
    this.updateState({
      help: { visible: !this.currentState.help.visible }
    });
  }

  private updateState(partial: Partial<UIState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partial
    });
  }
}
