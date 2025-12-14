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

  publish(event: DomainEvent): void {
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify handlers
    const handlers = this.handlers.get(event.type);
    if (!handlers) return;

    // Execute handlers safely
    handlers.forEach((handler) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    });
  }

  subscribe<T = unknown>(eventType: EventType, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType);
    handlers?.add(handler as EventHandler);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler as EventHandler);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
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
}
