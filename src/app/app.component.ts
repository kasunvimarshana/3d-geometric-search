import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ViewportComponent } from './components/viewport/viewport.component';
import { HotkeysComponent } from './components/hotkeys/hotkeys.component';
import { ModelService, ModelState } from './services/model.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, ViewportComponent, HotkeysComponent],
  template: `
    <div class="layout">
      <app-toolbar></app-toolbar>
      <main class="main">
        <app-viewport></app-viewport>
        <app-hotkeys></app-hotkeys>
        
        @if (status === 'loading') {
          <div class="overlay">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: #93c5fd;">Loading…</strong>
              <span style="opacity: 0.9;">Parsing model, please wait</span>
            </div>
          </div>
        }
        
        @if (status === 'error') {
          <div class="overlay">
            <div style="display: flex; align-items: center; gap: 8px;">
              <strong style="color: #fca5a5;">Error:</strong>
              <span style="opacity: 0.9;">{{ error }}</span>
              <button class="btn" style="margin-left: auto;" (click)="clearError()">×</button>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  status: string = 'idle';
  error: string | null = null;
  private destroy$ = new Subject<void>();
  private errorTimeout: any = null;

  constructor(private modelService: ModelService) {}

  ngOnInit(): void {
    this.modelService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ModelState) => {
        this.status = state.status;
        this.error = state.error;
        
        // Auto-clear error after 5 seconds
        if (state.status === 'error') {
          if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
          }
          this.errorTimeout = setTimeout(() => {
            this.modelService.clearError();
          }, 5000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  clearError(): void {
    this.modelService.clearError();
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
      this.errorTimeout = null;
    }
  }
}
