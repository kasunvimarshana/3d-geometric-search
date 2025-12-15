/**
 * Model Operations Service
 *
 * Handles complex model operations like disassembly and reassembly.
 * Manages model transformations and animations.
 */

import { Model } from '@domain/models/Model';
import { IEventBus } from '@domain/interfaces/IEventBus';
import { ModelDisassembledEvent, ModelReassembledEvent } from '@domain/events/DomainEvents';

export class ModelOperationsService {
  private isDisassembled = false;

  constructor(private readonly eventBus: IEventBus) {}

  disassemble(_model: Model): void {
    try {
      if (this.isDisassembled) {
        console.warn('[ModelOperations] Model is already disassembled');
        return;
      }

      if (!_model) {
        const error = new Error('No model provided for disassembly');
        this.eventBus.publish(new OperationErrorEvent({ operation: 'disassemble', error }));
        throw error;
      }

      // Placeholder for disassembly logic
      // In a real implementation, this would:
      // 1. Get all sections: model.getAllSections()
      // 2. Calculate explosion center
      // 3. Move sections away from center
      // 4. Animate the movement

      this.isDisassembled = true;

      this.eventBus.publish(new ModelDisassembledEvent());
    } catch (error) {
      console.error('[ModelOperations] Error during disassembly:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new OperationErrorEvent({ operation: 'disassemble', error: errorObj }));
      throw error;
    }
  }

  reassemble(): void {
    try {
      if (!this.isDisassembled) {
        console.warn('[ModelOperations] Model is not disassembled');
        return;
      }

      // Reset all transformations
      // In a full implementation, this would animate back to original positions
      this.isDisassembled = false;

      this.eventBus.publish(new ModelReassembledEvent());
    } catch (error) {
      console.error('[ModelOperations] Error during reassembly:', error);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this.eventBus.publish(new OperationErrorEvent({ operation: 'reassemble', error: errorObj }));
      throw error;
    }
  }

  getDisassemblyState(): boolean {
    return this.isDisassembled;
  }
}
