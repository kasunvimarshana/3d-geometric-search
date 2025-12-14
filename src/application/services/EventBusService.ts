/**
 * Event Bus Service
 *
 * Centralized event management implementation.
 * Provides pub/sub pattern for decoupled component communication.
 */

import { IEventBus, EventHandler } from '@domain/interfaces/IEventBus';
import { DomainEvent, EventType } from '@domain/events/DomainEvents';

export class EventBusService implements IEventBus {
  private readonly handlers: Map<EventType, Set<EventHandler>> = new Map();
  private readonly eventHistory: DomainEvent[] = [];
  private readonly maxHistorySize = 100;
  private readonly maxQueueSize = 50; // Prevent queue overflow from event cascades
  private isProcessing = false;
  private eventQueue: DomainEvent[] = [];

  publish(event: DomainEvent): void {
    // Validate event
    if (!event || !event.type) {
      console.error('Invalid event published:', event);
      return;
    }

    // Queue event if currently processing to avoid recursion
    if (this.isProcessing) {
      // Prevent queue overflow (graceful degradation)
      if (this.eventQueue.length >= this.maxQueueSize) {
        console.error(
          `[EventBus] Queue overflow! Dropping event ${event.type}. This indicates an event cascade or circular dependency.`
        );
        return;
      }
      this.eventQueue.push(event);
      return;
    }

    this.processEvent(event);

    // Process queued events with overflow protection
    let processedCount = 0;
    while (this.eventQueue.length > 0 && processedCount < this.maxQueueSize) {
      const queuedEvent = this.eventQueue.shift();
      if (queuedEvent) {
        this.processEvent(queuedEvent);
        processedCount++;
      }
    }

    // Warn if queue wasn't fully drained
    if (this.eventQueue.length > 0) {
      console.warn(
        `[EventBus] Event queue not fully drained (${this.eventQueue.length} events remaining). This may indicate an infinite event loop.`
      );
      this.eventQueue.length = 0; // Clear to prevent memory leak
    }
  }

  private processEvent(event: DomainEvent): void {
    this.isProcessing = true;

    try {
      // Store in history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Notify handlers
      const handlers = this.handlers.get(event.type);
      if (!handlers || handlers.size === 0) {
        // No handlers - not necessarily an error
        return;
      }

      // Execute handlers safely with error isolation
      let errorCount = 0;
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          errorCount++;
          console.error(`[EventBus] Handler error for ${event.type}:`, error, '\nEvent:', event);

          // Don't let handler errors break the event system
          if (error instanceof Error) {
            console.error('Stack:', error.stack);
          }
        }
      });

      if (errorCount > 0) {
        console.warn(`[EventBus] ${errorCount} handler(s) failed for event ${event.type}`);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  subscribe<T = unknown>(eventType: EventType, handler: EventHandler<T>): () => void {
    // Validate inputs
    if (!eventType) {
      console.error('[EventBus] Cannot subscribe: invalid event type');
      return () => {}; // Return no-op unsubscribe
    }

    if (typeof handler !== 'function') {
      console.error('[EventBus] Cannot subscribe: handler must be a function');
      return () => {};
    }

    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType);
    handlers?.add(handler as EventHandler);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler as EventHandler);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    if (!eventType || !handler) {
      console.warn('[EventBus] Invalid unsubscribe call');
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);

      // Clean up empty handler sets
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  clear(): void {
    this.handlers.clear();
    this.eventHistory.length = 0;
  }

  getEventHistory(): readonly DomainEvent[] {
    return [...this.eventHistory];
  }

  getLastEvent(type?: EventType): DomainEvent | undefined {
    if (!type) {
      return this.eventHistory[this.eventHistory.length - 1];
    }

    for (let i = this.eventHistory.length - 1; i >= 0; i--) {
      const event = this.eventHistory[i];
      if (event && event.type === type) {
        return event;
      }
    }

    return undefined;
  }

  /**
   * Get diagnostic information about the event bus state
   */
  getDiagnostics(): {
    handlerCount: number;
    eventTypes: EventType[];
    historySize: number;
    isProcessing: boolean;
    queueSize: number;
  } {
    return {
      handlerCount: Array.from(this.handlers.values()).reduce((sum, set) => sum + set.size, 0),
      eventTypes: Array.from(this.handlers.keys()),
      historySize: this.eventHistory.length,
      isProcessing: this.isProcessing,
      queueSize: this.eventQueue.length,
    };
  }
}
