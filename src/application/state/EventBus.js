/**
 * Event Bus
 * Implements IEventBus interface
 * Central event dispatcher for application-wide events
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Subscribe to event
   *
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }

    this.listeners.get(eventName).add(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, callback);
  }

  /**
   * Unsubscribe from event
   *
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   */
  unsubscribe(eventName, callback) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.delete(callback);

      // Clean up empty listener sets
      if (eventListeners.size === 0) {
        this.listeners.delete(eventName);
      }
    }
  }

  /**
   * Emit event
   *
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  emit(eventName, data = null) {
    // Record in history
    this.recordEvent(eventName, data);

    // Call all listeners
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for "${eventName}":`, error);
        }
      });
    }

    // Also emit to wildcard listeners (*)
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(data, eventName);
        } catch (error) {
          console.error(`Error in wildcard listener for "${eventName}":`, error);
        }
      });
    }
  }

  /**
   * Alias for emit (for compatibility)
   *
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  publish(eventName, data = null) {
    return this.emit(eventName, data);
  }

  /**
   * Subscribe once (auto-unsubscribe after first call)
   *
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback) {
    const wrapper = data => {
      callback(data);
      this.unsubscribe(eventName, wrapper);
    };

    return this.subscribe(eventName, wrapper);
  }

  /**
   * Clear all listeners for event
   *
   * @param {string} [eventName] - Event name (if omitted, clears all)
   */
  clear(eventName = null) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for event
   *
   * @param {string} eventName - Event name
   * @returns {number}
   */
  getListenerCount(eventName) {
    const eventListeners = this.listeners.get(eventName);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Alias for getListenerCount (for compatibility)
   *
   * @param {string} eventName - Event name
   * @returns {number}
   */
  getSubscriberCount(eventName) {
    return this.getListenerCount(eventName);
  }

  /**
   * Check if event has subscribers
   *
   * @param {string} eventName - Event name
   * @returns {boolean}
   */
  hasSubscribers(eventName) {
    return this.getListenerCount(eventName) > 0;
  }

  /**
   * Get all event names with listeners
   *
   * @returns {string[]}
   */
  getEventNames() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Record event in history
   *
   * @param {string} eventName - Event name
   * @param {*} data - Event data
   */
  recordEvent(eventName, data) {
    this.eventHistory.push({
      eventType: eventName,
      data,
      timestamp: new Date(),
    });

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Get event history
   *
   * @param {number} [limit] - Number of recent events
   * @returns {Array}
   */
  getHistory(limit = null) {
    if (limit) {
      return this.eventHistory.slice(-limit).reverse();
    }
    return [...this.eventHistory].reverse();
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Set max history size
   *
   * @param {number} size - Max size
   */
  setMaxHistorySize(size) {
    this.maxHistorySize = size;

    // Trim current history if needed
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }

  /**
   * Wait for event (Promise-based)
   *
   * @param {string} eventName - Event name
   * @param {number} [timeout] - Timeout in ms
   * @returns {Promise}
   */
  waitFor(eventName, timeout = null) {
    return new Promise((resolve, reject) => {
      let timeoutId;

      const unsubscribe = this.once(eventName, data => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`Event "${eventName}" timeout after ${timeout}ms`));
        }, timeout);
      }
    });
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.listeners.clear();
    this.eventHistory = [];
  }

  /**
   * Reset - clear all listeners and history (alias for dispose + init)
   */
  reset() {
    this.listeners.clear();
    this.eventHistory = [];
  }
}
