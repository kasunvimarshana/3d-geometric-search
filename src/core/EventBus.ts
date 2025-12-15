/**
 * Centralized Event Bus
 * Implements Observer Pattern for event handling
 */

import type { DomainEvent, EventType, EventListener } from "../domain/events";

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<EventType, Set<EventListener>>;
  private eventQueue: DomainEvent[] = [];
  private processing = false;

  private constructor() {
    this.listeners = new Map();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to events of a specific type with validation
   */
  on<T extends DomainEvent>(
    eventType: EventType,
    listener: EventListener<T>
  ): () => void {
    if (!eventType) {
      console.error("EventBus.on: eventType is required");
      return () => {}; // Return no-op unsubscribe
    }

    if (typeof listener !== "function") {
      console.error("EventBus.on: listener must be a function");
      return () => {}; // Return no-op unsubscribe
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(listener as EventListener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T extends DomainEvent>(
    eventType: EventType,
    listener: EventListener<T>
  ): void {
    const unsubscribe = this.on(eventType, (event) => {
      listener(event as T);
      unsubscribe();
    });
  }

  /**
   * Emit an event with validation
   */
  emit(event: DomainEvent): void {
    if (!event) {
      console.error("EventBus.emit: event is required");
      return;
    }

    if (!event.type) {
      console.error("EventBus.emit: event.type is required");
      return;
    }

    if (!event.timestamp) {
      console.error("EventBus.emit: event.timestamp is required");
      return;
    }

    this.eventQueue.push(event);
    this.processQueue();
  }

  /**
   * Process event queue to prevent race conditions
   */
  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.processEvent(event);
    }

    this.processing = false;
  }

  /**
   * Process a single event with error handling
   */
  private async processEvent(event: DomainEvent): Promise<void> {
    const listeners = this.listeners.get(event.type);

    if (!listeners || listeners.size === 0) {
      return;
    }

    // Execute listeners with error handling
    const promises = Array.from(listeners).map(async (listener) => {
      try {
        await listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Remove all listeners for a specific event type
   */
  off(eventType: EventType): void {
    this.listeners.delete(eventType);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.eventQueue = [];
  }

  /**
   * Get listener count for debugging
   */
  getListenerCount(eventType?: EventType): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    let total = 0;
    this.listeners.forEach((listeners) => {
      total += listeners.size;
    });
    return total;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
