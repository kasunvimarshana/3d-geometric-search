/**
 * EventBus - Centralized event management system
 * Provides consistent, efficient, and resilient event handling across the application
 *
 * Features:
 * - Event namespacing for better organization
 * - Automatic cleanup and memory leak prevention
 * - Event throttling and debouncing
 * - Error handling and logging
 * - Event replay for debugging
 * - Wildcard event listeners
 */

class EventBus {
  constructor(options = {}) {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.wildcardListeners = new Set();
    this.eventHistory = [];
    this.maxHistorySize = options.maxHistorySize || 100;
    this.enableLogging = options.enableLogging || false;
    this.enableHistory = options.enableHistory || false;
  }

  /**
   * Register an event listener
   * @param {string} event - Event name (supports wildcards with *)
   * @param {Function} handler - Event handler function
   * @param {Object} options - Listener options
   * @returns {Function} Unsubscribe function
   */
  on(event, handler, options = {}) {
    if (typeof handler !== "function") {
      console.error("[EventBus] Handler must be a function");
      return () => {};
    }

    const listener = {
      handler: this._wrapHandler(handler, options),
      originalHandler: handler,
      options,
      context: options.context || null,
    };

    // Handle wildcard listeners
    if (event.includes("*")) {
      this.wildcardListeners.add({ pattern: event, listener });
      return () => this.off(event, handler);
    }

    // Regular listeners
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(listener);

    if (this.enableLogging) {
      console.log(`[EventBus] Registered listener for: ${event}`);
    }

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @param {Object} options - Listener options
   * @returns {Function} Unsubscribe function
   */
  once(event, handler, options = {}) {
    const wrappedHandler = (...args) => {
      handler(...args);
      this.off(event, wrappedHandler);
    };

    return this.on(event, wrappedHandler, { ...options, once: true });
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Handler to remove (optional)
   */
  off(event, handler = null) {
    if (!handler) {
      // Remove all listeners for this event
      this.listeners.delete(event);
      this.wildcardListeners.forEach((wc) => {
        if (wc.pattern === event) {
          this.wildcardListeners.delete(wc);
        }
      });
      return;
    }

    // Remove specific handler
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        if (listener.originalHandler === handler) {
          listeners.delete(listener);
          break;
        }
      }
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    // Remove from wildcard listeners
    this.wildcardListeners.forEach((wc) => {
      if (wc.pattern === event && wc.listener.originalHandler === handler) {
        this.wildcardListeners.delete(wc);
      }
    });

    if (this.enableLogging) {
      console.log(`[EventBus] Removed listener for: ${event}`);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @param {Object} options - Emission options
   */
  emit(event, data = null, options = {}) {
    if (this.enableHistory) {
      this._recordEvent(event, data);
    }

    if (this.enableLogging) {
      console.log(`[EventBus] Emitting: ${event}`, data);
    }

    const results = [];
    let errorOccurred = false;

    // Call regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          const result = listener.handler(data, event);
          results.push(result);
        } catch (error) {
          errorOccurred = true;
          console.error(`[EventBus] Error in listener for '${event}':`, error);
          if (options.throwOnError) {
            throw error;
          }
        }
      }
    }

    // Call wildcard listeners
    for (const wc of this.wildcardListeners) {
      if (this._matchPattern(event, wc.pattern)) {
        try {
          const result = wc.listener.handler(data, event);
          results.push(result);
        } catch (error) {
          errorOccurred = true;
          console.error(
            `[EventBus] Error in wildcard listener for '${event}':`,
            error
          );
          if (options.throwOnError) {
            throw error;
          }
        }
      }
    }

    return {
      success: !errorOccurred,
      results,
      listenersExecuted: results.length,
    };
  }

  /**
   * Emit an event asynchronously
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @returns {Promise}
   */
  async emitAsync(event, data = null) {
    const listeners = this.listeners.get(event) || [];
    const promises = [];

    for (const listener of listeners) {
      promises.push(
        Promise.resolve(listener.handler(data, event)).catch((error) => {
          console.error(
            `[EventBus] Async error in listener for '${event}':`,
            error
          );
          return null;
        })
      );
    }

    // Handle wildcard listeners
    for (const wc of this.wildcardListeners) {
      if (this._matchPattern(event, wc.pattern)) {
        promises.push(
          Promise.resolve(wc.listener.handler(data, event)).catch((error) => {
            console.error(
              `[EventBus] Async error in wildcard listener for '${event}':`,
              error
            );
            return null;
          })
        );
      }
    }

    return Promise.all(promises);
  }

  /**
   * Remove all listeners
   */
  clear() {
    this.listeners.clear();
    this.onceListeners.clear();
    this.wildcardListeners.clear();
    if (this.enableLogging) {
      console.log("[EventBus] Cleared all listeners");
    }
  }

  /**
   * Get event history
   * @returns {Array} Event history
   */
  getHistory() {
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Replay events from history
   * @param {Function} filter - Optional filter function
   */
  replay(filter = null) {
    const events = filter
      ? this.eventHistory.filter(filter)
      : this.eventHistory;

    events.forEach(({ event, data }) => {
      this.emit(event, data);
    });
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    const listeners = this.listeners.get(event);
    return listeners ? listeners.size : 0;
  }

  /**
   * Get all registered events
   * @returns {Array}
   */
  getEvents() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if event has listeners
   * @param {string} event - Event name
   * @returns {boolean}
   */
  hasListeners(event) {
    return this.listenerCount(event) > 0;
  }

  /**
   * Create a throttled event emitter
   * @param {string} event - Event name
   * @param {number} delay - Throttle delay in ms
   * @returns {Function}
   */
  createThrottledEmitter(event, delay) {
    let lastCall = 0;
    return (data) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        this.emit(event, data);
      }
    };
  }

  /**
   * Create a debounced event emitter
   * @param {string} event - Event name
   * @param {number} delay - Debounce delay in ms
   * @returns {Function}
   */
  createDebouncedEmitter(event, delay) {
    let timeout = null;
    return (data) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        this.emit(event, data);
        timeout = null;
      }, delay);
    };
  }

  // Private methods

  _wrapHandler(handler, options) {
    let wrappedHandler = handler;

    // Apply throttle
    if (options.throttle) {
      wrappedHandler = this._throttle(wrappedHandler, options.throttle);
    }

    // Apply debounce
    if (options.debounce) {
      wrappedHandler = this._debounce(wrappedHandler, options.debounce);
    }

    // Apply context binding
    if (options.context) {
      const originalHandler = wrappedHandler;
      wrappedHandler = (...args) =>
        originalHandler.apply(options.context, args);
    }

    // Apply error handling
    const finalHandler = (...args) => {
      try {
        return wrappedHandler(...args);
      } catch (error) {
        console.error("[EventBus] Handler error:", error);
        if (options.errorHandler) {
          options.errorHandler(error);
        }
        if (options.throwOnError) {
          throw error;
        }
      }
    };

    return finalHandler;
  }

  _throttle(func, wait) {
    let timeout = null;
    let lastCall = 0;

    return function (...args) {
      const now = Date.now();
      const remaining = wait - (now - lastCall);

      if (remaining <= 0) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        lastCall = now;
        return func.apply(this, args);
      } else if (!timeout) {
        timeout = setTimeout(() => {
          lastCall = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };
  }

  _debounce(func, wait) {
    let timeout = null;

    return function (...args) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        timeout = null;
        func.apply(this, args);
      }, wait);
    };
  }

  _matchPattern(event, pattern) {
    const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(event);
  }

  _recordEvent(event, data) {
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now(),
    });

    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
}

/**
 * Event Handler Manager - Manages DOM event listeners with automatic cleanup
 *
 * Features:
 * - Automatic cleanup using AbortController
 * - Handler tracking per element and event type
 * - Batch registration with addMultiple()
 * - Performance monitoring with getStats()
 * - Memory leak prevention with proper cleanup
 *
 * Usage:
 * ```javascript
 * const manager = new EventHandlerManager();
 *
 * // Single handler
 * manager.add(button, 'click', handleClick);
 *
 * // Multiple handlers
 * manager.addMultiple(element, {
 *   'click': handleClick,
 *   'mouseover': handleHover
 * });
 *
 * // Monitor usage
 * const stats = manager.getStats();
 * console.log(`Tracking ${stats.totalHandlers} handlers on ${stats.elements} elements`);
 *
 * // Cleanup
 * manager.clear();
 * ```
 */
class EventHandlerManager {
  constructor() {
    this.handlers = new Map();
    this.abortControllers = new Map();
  }

  /**
   * Add an event listener with automatic tracking
   * @param {Element} element - DOM element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event listener options
   * @returns {Function} Cleanup function
   */
  add(element, event, handler, options = {}) {
    if (!element) {
      console.warn("[EventHandlerManager] Element is null or undefined");
      return () => {};
    }

    const elementId = this._getElementId(element);
    const abortController = new AbortController();

    const enhancedOptions = {
      ...options,
      signal: abortController.signal,
    };

    try {
      element.addEventListener(event, handler, enhancedOptions);

      // Track the handler
      if (!this.handlers.has(elementId)) {
        this.handlers.set(elementId, new Map());
      }

      const eventHandlers = this.handlers.get(elementId);
      if (!eventHandlers.has(event)) {
        eventHandlers.set(event, new Set());
      }

      eventHandlers.get(event).add({
        handler,
        options: enhancedOptions,
        abortController,
      });

      this.abortControllers.set(
        this._getHandlerId(elementId, event, handler),
        abortController
      );

      // Return cleanup function
      return () => this.remove(element, event, handler);
    } catch (error) {
      console.error(
        "[EventHandlerManager] Error adding event listener:",
        error
      );
      return () => {};
    }
  }

  /**
   * Remove an event listener
   * @param {Element} element - DOM element
   * @param {string} event - Event name
   * @param {Function} handler - Event handler (optional)
   */
  remove(element, event, handler = null) {
    if (!element) return;

    const elementId = this._getElementId(element);
    const eventHandlers = this.handlers.get(elementId);

    if (!eventHandlers) return;

    if (handler) {
      // Remove specific handler
      const handlers = eventHandlers.get(event);
      if (handlers) {
        for (const h of handlers) {
          if (h.handler === handler) {
            h.abortController.abort();
            handlers.delete(h);
            this.abortControllers.delete(
              this._getHandlerId(elementId, event, handler)
            );
            break;
          }
        }
        if (handlers.size === 0) {
          eventHandlers.delete(event);
        }
      }
    } else {
      // Remove all handlers for this event
      const handlers = eventHandlers.get(event);
      if (handlers) {
        handlers.forEach((h) => {
          h.abortController.abort();
        });
        eventHandlers.delete(event);
      }
    }

    if (eventHandlers.size === 0) {
      this.handlers.delete(elementId);
    }
  }

  /**
   * Remove all event listeners for an element
   * @param {Element} element - DOM element
   */
  removeAll(element) {
    if (!element) return;

    const elementId = this._getElementId(element);
    const eventHandlers = this.handlers.get(elementId);

    if (eventHandlers) {
      eventHandlers.forEach((handlers, event) => {
        handlers.forEach((h) => {
          h.abortController.abort();
        });
      });
      this.handlers.delete(elementId);
    }
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.handlers.clear();
    this.abortControllers.clear();
  }

  /**
   * Add multiple event listeners at once for better organization
   * @param {Element} element - DOM element
   * @param {Object} eventHandlers - Map of event names to handlers
   * @param {Object} options - Event listener options
   * @returns {Function} Cleanup function for all handlers
   */
  addMultiple(element, eventHandlers, options = {}) {
    const cleanupFunctions = [];

    for (const [event, handler] of Object.entries(eventHandlers)) {
      cleanupFunctions.push(this.add(element, event, handler, options));
    }

    return () => cleanupFunctions.forEach((cleanup) => cleanup());
  }

  /**
   * Get statistics about registered handlers for monitoring
   * @returns {Object} Handler statistics
   */
  getStats() {
    let totalHandlers = 0;
    const elementCount = this.handlers.size;

    this.handlers.forEach((eventMap) => {
      eventMap.forEach((handlerSet) => {
        totalHandlers += handlerSet.size;
      });
    });

    return {
      elements: elementCount,
      totalHandlers,
      controllers: this.abortControllers.size,
    };
  }

  /**
   * Get listener count
   * @returns {number}
   */
  getListenerCount() {
    let count = 0;
    this.handlers.forEach((eventHandlers) => {
      eventHandlers.forEach((handlers) => {
        count += handlers.size;
      });
    });
    return count;
  }

  _getElementId(element) {
    if (!element._eventManagerId) {
      element._eventManagerId = `element_${Date.now()}_${Math.random()}`;
    }
    return element._eventManagerId;
  }

  _getHandlerId(elementId, event, handler) {
    return `${elementId}_${event}_${handler.toString().slice(0, 50)}`;
  }
}

// Export to global scope for use in non-module scripts
if (typeof window !== "undefined") {
  window.EventBus = EventBus;
  window.EventHandlerManager = EventHandlerManager;
  window.eventBus = new EventBus({
    enableLogging: false,
    enableHistory: true,
    maxHistorySize: 100,
  });
  window.globalEventBus = window.eventBus; // Alias for compatibility
}
