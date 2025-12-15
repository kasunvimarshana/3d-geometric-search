import { EventBus } from './EventBus.js';
import { EventTypes } from './EventTypes.js';

/**
 * EventOrchestrator
 *
 * Orchestrates application events with validation, logging,
 * and centralized error handling.
 */
export class EventOrchestrator {
  constructor(store) {
    this.eventBus = new EventBus();
    this.store = store;
    this.eventLog = [];
    this.maxLogSize = 100;
    this.enableLogging = true;
  }

  /**
   * Register event handler
   */
  on(eventName, handler, options = {}) {
    const { validate = null, once = false } = options;

    const wrappedHandler = (...args) => {
      // Log event
      this.logEvent(eventName, args);

      // Validate
      if (validate) {
        const validation = validate(...args);
        if (!validation.valid) {
          console.error(`Event validation failed for "${eventName}":`, validation.errors);
          return;
        }
      }

      // Execute handler
      try {
        handler(...args);
      } catch (error) {
        this.handleError(eventName, error, args);
      }
    };

    if (once) {
      return this.eventBus.once(eventName, wrappedHandler);
    } else {
      return this.eventBus.on(eventName, wrappedHandler);
    }
  }

  /**
   * Emit event
   */
  emit(eventName, ...args) {
    this.eventBus.emit(eventName, ...args);
  }

  /**
   * Remove event handler
   */
  off(eventName, handler) {
    this.eventBus.off(eventName, handler);
  }

  /**
   * Log event
   */
  logEvent(eventName, args) {
    if (!this.enableLogging) return;

    const entry = {
      timestamp: Date.now(),
      event: eventName,
      data: args,
    };

    this.eventLog.push(entry);

    // Limit log size
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }
  }

  /**
   * Handle error
   */
  handleError(eventName, error, args) {
    console.error(`Error in event handler for "${eventName}":`, error);

    // Emit error event
    this.eventBus.emit(EventTypes.ERROR, {
      event: eventName,
      error,
      args,
    });

    // Update state
    if (this.store) {
      this.store.updateState('ui.error', error.message);
    }
  }

  /**
   * Get event log
   */
  getEventLog() {
    return this.eventLog;
  }

  /**
   * Clear event log
   */
  clearEventLog() {
    this.eventLog = [];
  }

  /**
   * Enable/disable logging
   */
  setLoggingEnabled(enabled) {
    this.enableLogging = enabled;
  }

  /**
   * Get event bus
   */
  getEventBus() {
    return this.eventBus;
  }

  /**
   * Clear all events
   */
  clear() {
    this.eventBus.clear();
    this.clearEventLog();
  }
}
