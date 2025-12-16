import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { UIService, UIState } from '../../services/ui.service';
import { ViewerService } from '../../services/viewer.service';
import { ModelService, ModelState } from '../../services/model.service';

@Component({
  selector: 'app-hotkeys',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (helpVisible) {
      <div class="overlay" style="left: 12px; top: 56px; right: auto;">
        <div style="font-weight: 600; margin-bottom: 6px;">Shortcuts</div>
        <div>?: Toggle help</div>
        <div>F: Fit selection (or all)</div>
        <div>A: Fit all</div>
        <div>I: Isolate selection</div>
        <div>Esc: Clear isolation</div>
        <div>R: Reset view</div>
      </div>
    }
  `,
  styles: []
})
export class HotkeysComponent implements OnInit, OnDestroy {
  helpVisible = false;
  selectedNodeId: string | null = null;
  isolatedNodeId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private uiService: UIService,
    private viewerService: ViewerService,
    private modelService: ModelService
  ) {}

  ngOnInit(): void {
    this.uiService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: UIState) => {
        this.helpVisible = state.help.visible;
      });

    this.modelService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ModelState) => {
        this.selectedNodeId = state.selectedNodeId;
        this.isolatedNodeId = state.isolatedNodeId;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // Skip if typing in an input field
    if (this.isTypingTarget(event.target)) {
      return;
    }

    const key = event.key;

    // Toggle help
    if (key === '?' || (key === '/' && event.shiftKey)) {
      event.preventDefault();
      this.uiService.toggleHelp();
      return;
    }

    // Fit selection or all
    if (key === 'f' || key === 'F') {
      event.preventDefault();
      if (this.selectedNodeId) {
        this.viewerService.fitToSelection();
      } else {
        this.viewerService.fitToAll();
      }
      return;
    }

    // Fit all
    if (key === 'a' || key === 'A') {
      event.preventDefault();
      this.viewerService.fitToAll();
      return;
    }

    // Isolate selection
    if (key === 'i' || key === 'I') {
      if (this.selectedNodeId) {
        event.preventDefault();
        this.modelService.isolateSection(this.selectedNodeId);
        this.viewerService.fitToSelection();
      }
      return;
    }

    // Clear isolation
    if (key === 'Escape' || key === 'e' || key === 'E') {
      if (this.isolatedNodeId) {
        event.preventDefault();
        this.modelService.clearIsolation();
        this.viewerService.fitToAll();
      }
      return;
    }

    // Reset view
    if (key === 'r' || key === 'R') {
      event.preventDefault();
      this.viewerService.resetView();
      return;
    }
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    if (!target) return false;
    const element = target as HTMLElement;
    const tag = (element.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || element.isContentEditable;
  }
}
