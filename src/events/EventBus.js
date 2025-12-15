/**
 * EventBus
 *
 * Centralized event system for decoupled communication
 * between different parts of the application.
 */
export class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
  }

  /**
   * Subscribe to an event
   */
  on(eventName, handler) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(handler);

    // Return unsubscribe function
    return () => this.off(eventName, handler);
  }

  /**
   * Subscribe to an event once
   */
  once(eventName, handler) {
    if (!this.onceEvents.has(eventName)) {
      this.onceEvents.set(eventName, new Set());
    }

    this.onceEvents.get(eventName).add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.onceEvents.get(eventName);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(eventName, handler) {
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Emit an event
   */
  emit(eventName, ...args) {
    // Call regular handlers
    const handlers = this.events.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error);
        }
      });
    }

    // Call once handlers
    const onceHandlers = this.onceEvents.get(eventName);
    if (onceHandlers) {
      onceHandlers.forEach((handler) => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in once handler for "${eventName}":`, error);
        }
      });
      this.onceEvents.delete(eventName);
    }
  }

  /**
   * Clear all handlers for an event
   */
  clear(eventName) {
    if (eventName) {
      this.events.delete(eventName);
      this.onceEvents.delete(eventName);
    } else {
      this.events.clear();
      this.onceEvents.clear();
    }
  }

  /**
   * Get all event names
   */
  getEventNames() {
    return Array.from(new Set([...this.events.keys(), ...this.onceEvents.keys()]));
  }

  /**
   * Check if event has handlers
   */
  hasHandlers(eventName) {
    return (
      (this.events.has(eventName) && this.events.get(eventName).size > 0) ||
      (this.onceEvents.has(eventName) && this.onceEvents.get(eventName).size > 0)
    );
  }
}
