import { IEventBus } from "@domain/interfaces";
import { ApplicationEvent } from "@domain/events";
import { EventType } from "@domain/types";

/**
 * Event Bus
 * Implements centralized event orchestration
 * Follows Publish-Subscribe pattern with type safety
 */
export class EventBus implements IEventBus {
  private handlers: Map<EventType, Set<(event: ApplicationEvent) => void>>;
  private globalHandlers: Set<(event: ApplicationEvent) => void>;
  private eventQueue: ApplicationEvent[];
  private processing: boolean;

  constructor() {
    this.handlers = new Map();
    this.globalHandlers = new Set();
    this.eventQueue = [];
    this.processing = false;
  }

  /**
   * Publish an event
   * Events are queued and processed to prevent race conditions
   */
  publish(event: ApplicationEvent): void {
    if (!this.validateEvent(event)) {
      throw new Error(`Invalid event: ${JSON.stringify(event)}`);
    }

    this.eventQueue.push(event);

    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Subscribe to specific event type
   */
  subscribe(
    eventType: EventType,
    handler: (event: ApplicationEvent) => void
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    const handlers = this.handlers.get(eventType)!;
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    };
  }

  /**
   * Subscribe to all events
   */
  subscribeAll(handler: (event: ApplicationEvent) => void): () => void {
    this.globalHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    this.eventQueue = [];
    this.processing = false;
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      await this.dispatchEvent(event);
    }

    this.processing = false;
  }

  private async dispatchEvent(event: ApplicationEvent): Promise<void> {
    // Call global handlers
    for (const handler of this.globalHandlers) {
      try {
        await this.safeHandlerCall(handler, event);
      } catch (error) {
        console.error("Error in global event handler:", error);
      }
    }

    // Call type-specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await this.safeHandlerCall(handler, event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }
    }
  }

  private async safeHandlerCall(
    handler: (event: ApplicationEvent) => void,
    event: ApplicationEvent
  ): Promise<void> {
    return new Promise((resolve) => {
      try {
        const result = handler(event) as unknown;
        if (
          result &&
          typeof result === "object" &&
          "then" in result &&
          typeof (result as { then: unknown }).then === "function"
        ) {
          (result as Promise<void>)
            .then(() => resolve())
            .catch((error: unknown) => {
              console.error("Async handler error:", error);
              resolve();
            });
        } else {
          resolve();
        }
      } catch (error) {
        console.error("Handler execution error:", error);
        resolve();
      }
    });
  }

  private validateEvent(event: ApplicationEvent): boolean {
    if (!event || typeof event !== "object") return false;
    if (!event.type || !Object.values(EventType).includes(event.type))
      return false;
    if (typeof event.timestamp !== "number") return false;

    return true;
  }
}
