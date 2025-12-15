/**
 * Event Bus
 *
 * Centralized event system for decoupled component communication.
 * Implements the Observer pattern for loose coupling.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.processing = false;
  }

  /**
   * Subscribes to an event
   * @param {String} event - Event name
   * @param {Function} callback - Event handler
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(callback);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribes from an event
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  /**
   * Emits an event
   * @param {String} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data = {}) {
    this.eventQueue.push({ event, data, timestamp: Date.now() });

    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Processes event queue sequentially
   */
  async processQueue() {
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift();

      if (this.listeners.has(event)) {
        const handlers = Array.from(this.listeners.get(event));

        for (const handler of handlers) {
          try {
            await handler(data);
          } catch (error) {
            console.error(`Error in event handler for ${event}:`, error);
          }
        }
      }

      // Emit wildcard listeners
      if (this.listeners.has("*")) {
        const wildcardHandlers = Array.from(this.listeners.get("*"));
        for (const handler of wildcardHandlers) {
          try {
            await handler({ event, data });
          } catch (error) {
            console.error(`Error in wildcard handler:`, error);
          }
        }
      }
    }

    this.processing = false;
  }

  /**
   * Clears all listeners
   */
  clear() {
    this.listeners.clear();
    this.eventQueue = [];
  }

  /**
   * Gets list of registered events
   */
  getEvents() {
    return Array.from(this.listeners.keys());
  }
}
