import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ModelRegistry } from '../../core/registry/ModelRegistry';
import { buildModelTree } from '../../core/domain/modelTree';
import { loadAnyModel, loadAnyModelFromFiles } from '../../infrastructure/loaders/index';

export interface ModelState {
  modelId: string | null;
  tree: any | null;
  selectedNodeId: string | null;
  isolatedNodeId: string | null;
  highlighted: string[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private stateSubject = new BehaviorSubject<ModelState>({
    modelId: null,
    tree: null,
    selectedNodeId: null,
    isolatedNodeId: null,
    highlighted: [],
    status: 'idle',
    error: null
  });

  public state$: Observable<ModelState> = this.stateSubject.asObservable();

  get currentState(): ModelState {
    return this.stateSubject.value;
  }

  async loadModel(file?: File, files?: FileList): Promise<void> {
    this.updateState({ status: 'loading', error: null });
    try {
      const result = files && files.length > 0
        ? await loadAnyModelFromFiles(files)
        : await loadAnyModel(file);
      
      const { modelId, rootObject } = result;
      ModelRegistry.register(modelId, rootObject);
      const tree = buildModelTree(rootObject);
      
      this.updateState({
        status: 'ready',
        modelId,
        tree
      });
    } catch (err: any) {
      this.updateState({
        status: 'error',
        error: String(err?.message || err)
      });
    }
  }

  selectNode(nodeId: string): void {
    this.updateState({ selectedNodeId: nodeId });
    ModelRegistry.select(nodeId);
  }

  isolateSection(nodeId: string): void {
    this.updateState({ isolatedNodeId: nodeId });
    ModelRegistry.isolate(nodeId);
  }

  clearIsolation(): void {
    this.updateState({ isolatedNodeId: null });
    ModelRegistry.clearIsolation();
  }

  highlightNodes(nodeIds: string[]): void {
    this.updateState({ highlighted: nodeIds || [] });
    ModelRegistry.highlight(nodeIds);
  }

  clearHighlights(): void {
    this.updateState({ highlighted: [] });
    ModelRegistry.highlight([]);
  }

  async disassemble(factor: number = 1): Promise<void> {
    await ModelRegistry.disassemble(factor);
  }

  async reassemble(): Promise<void> {
    await ModelRegistry.reassemble();
  }

  refreshScene(): void {
    ModelRegistry.refreshMaterials();
  }

  clearError(): void {
    this.updateState({
      status: this.currentState.modelId ? 'ready' : 'idle',
      error: null
    });
  }

  private updateState(partial: Partial<ModelState>): void {
    this.stateSubject.next({
      ...this.currentState,
      ...partial
    });
  }
}
