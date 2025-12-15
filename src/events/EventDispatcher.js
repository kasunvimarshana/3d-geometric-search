/**
 * Event System
 * Centralized, type-safe event dispatcher with validation
 */

/**
 * Application event types
 */
export const EventType = {
  // Model lifecycle events
  MODEL_LOAD_START: "model:load:start",
  MODEL_LOAD_SUCCESS: "model:load:success",
  MODEL_LOAD_ERROR: "model:load:error",
  MODEL_UNLOAD: "model:unload",
  MODEL_UPDATE: "model:update",

  // Selection events
  SELECTION_CHANGE: "selection:change",
  SELECTION_CLEAR: "selection:clear",

  // Focus events
  FOCUS_NODE: "focus:node",
  FOCUS_CLEAR: "focus:clear",

  // Visibility events
  NODE_SHOW: "node:show",
  NODE_HIDE: "node:hide",
  NODE_ISOLATE: "node:isolate",
  SHOW_ALL: "show:all",

  // State events
  NODE_HIGHLIGHT: "node:highlight",
  NODE_UNHIGHLIGHT: "node:unhighlight",

  // Transform events
  DISASSEMBLE: "transform:disassemble",
  REASSEMBLE: "transform:reassemble",

  // Camera events
  CAMERA_RESET: "camera:reset",
  CAMERA_FIT: "camera:fit",
  CAMERA_ZOOM: "camera:zoom",

  // UI events
  FULLSCREEN_ENTER: "ui:fullscreen:enter",
  FULLSCREEN_EXIT: "ui:fullscreen:exit",

  // Error events
  ERROR: "error",

  // State events
  STATE_CHANGE: "state:change",
};

/**
 * Event validation schemas
 */
const EventSchemas = {
  [EventType.MODEL_LOAD_START]: ["file"],
  [EventType.MODEL_LOAD_SUCCESS]: ["model"],
  [EventType.MODEL_LOAD_ERROR]: ["error"],
  [EventType.SELECTION_CHANGE]: ["nodeIds"],
  [EventType.FOCUS_NODE]: ["nodeId"],
  [EventType.NODE_SHOW]: ["nodeIds"],
  [EventType.NODE_HIDE]: ["nodeIds"],
  [EventType.NODE_ISOLATE]: ["nodeId"],
  [EventType.NODE_HIGHLIGHT]: ["nodeId"],
  [EventType.NODE_UNHIGHLIGHT]: ["nodeId"],
  [EventType.ERROR]: ["error", "message"],
};

/**
 * Event class
 */
export class AppEvent {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
    this.timestamp = Date.now();
    this.id = `${type}-${this.timestamp}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}

/**
 * Event Dispatcher
 * Centralized event bus with validation and error handling
 */
export class EventDispatcher {
  constructor() {
    this.listeners = new Map();
    this.eventHistory = [];
    this.maxHistory = 100;
    this.isDispatching = false;
    this.queue = [];
    this.priorityQueue = []; // High-priority events
    this.debounceTimers = new Map(); // Debounce timers for events
    this.lastEventTime = new Map(); // Track last event dispatch time
    this.eventRetryCount = new Map(); // Track retry attempts
    this.maxRetries = 3;
    this.isDestroyed = false;
    this.errorHandlers = new Set(); // Custom error handlers
  }

  /**
   * Registers an event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(eventType, callback) {
    if (!eventType || typeof callback !== "function") {
      console.warn("Invalid event listener registration");
      return () => {};
    }

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Registers a one-time event listener
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  once(eventType, callback) {
    const unsubscribe = this.on(eventType, (event) => {
      unsubscribe();
      callback(event);
    });
    return unsubscribe;
  }

  /**
   * Dispatches an event with priority, debouncing, and retry logic
   * @param {string} type - Event type
   * @param {Object} payload - Event payload
   * @param {Object} options - Dispatch options
   * @returns {boolean} - Success status
   */
  dispatch(type, payload = {}, options = {}) {
    const {
      priority = "normal", // 'high', 'normal', 'low'
      debounce = 0, // Debounce delay in ms
      throttle = 0, // Throttle delay in ms
      retry = false, // Enable retry on failure
      silent = false, // Suppress error logging
    } = options;

    try {
      // Check if dispatcher is destroyed
      if (this.isDestroyed) {
        if (!silent)
          console.warn("Cannot dispatch event: EventDispatcher is destroyed");
        return false;
      }

      // Validate event type
      if (!Object.values(EventType).includes(type)) {
        if (!silent) console.warn(`Unknown event type: ${type}`);
        return false;
      }

      // Validate payload
      if (!this.validatePayload(type, payload)) {
        if (!silent)
          console.warn(`Invalid payload for event type: ${type}`, payload);
        return false;
      }

      // Handle debouncing
      if (debounce > 0) {
        return this.debounceDispatch(type, payload, debounce, options);
      }

      // Handle throttling
      if (throttle > 0) {
        const lastTime = this.lastEventTime.get(type) || 0;
        const now = Date.now();
        if (now - lastTime < throttle) {
          if (!silent) console.debug(`Event ${type} throttled`);
          return false;
        }
        this.lastEventTime.set(type, now);
      }

      const event = new AppEvent(type, payload);
      event.priority = priority;
      event.retry = retry;

      // Queue high-priority events in priority queue
      if (this.isDispatching) {
        if (priority === "high") {
          this.priorityQueue.push(event);
        } else {
          this.queue.push(event);
        }
        return true;
      }

      return this.executeDispatch(event, silent);
    } catch (error) {
      if (!silent) console.error("Error dispatching event:", error);
      this.handleDispatchError(error, type, payload);
      return false;
    }
  }

  /**
   * Executes the actual event dispatch
   * @private
   */
  executeDispatch(event, silent = false) {
    try {
      this.isDispatching = true;

      // Add to history
      this.addToHistory(event);

      // Dispatch to listeners
      const listeners = this.listeners.get(event.type);
      if (listeners && listeners.size > 0) {
        const listenerArray = Array.from(listeners);

        for (const callback of listenerArray) {
          try {
            // Check if listener still exists (might have been removed)
            if (listeners.has(callback)) {
              callback(event);
            }
          } catch (error) {
            if (!silent) {
              console.error(
                `Error in event listener for ${event.type}:`,
                error
              );
            }

            // Call custom error handlers
            this.notifyErrorHandlers(error, event);

            // Retry if enabled
            if (event.retry && this.shouldRetry(event)) {
              this.retryDispatch(event);
            } else {
              // Dispatch error event (but prevent infinite recursion)
              if (event.type !== EventType.ERROR) {
                this.dispatch(
                  EventType.ERROR,
                  {
                    error,
                    message: `Event listener error: ${error.message}`,
                    context: { eventType: event.type, payload: event.payload },
                  },
                  { silent: true }
                );
              }
            }
          }
        }
      }

      this.isDispatching = false;

      // Process queued events (priority first)
      this.processQueue();

      return true;
    } catch (error) {
      if (!silent) console.error("Error in executeDispatch:", error);
      this.isDispatching = false;
      this.handleDispatchError(error, event.type, event.payload);
      return false;
    }
  }

  /**
   * Validates event payload
   * @param {string} type - Event type
   * @param {Object} payload - Payload to validate
   * @returns {boolean}
   */
  validatePayload(type, payload) {
    const schema = EventSchemas[type];

    if (!schema) {
      return true; // No schema defined, allow any payload
    }

    // Check required fields
    for (const field of schema) {
      if (!(field in payload)) {
        console.warn(`Missing required field '${field}' for event ${type}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Processes queued events with priority handling
   */
  processQueue() {
    let processed = 0;
    const maxProcess = 10; // Prevent infinite loops

    while (
      (this.priorityQueue.length > 0 || this.queue.length > 0) &&
      !this.isDispatching &&
      processed < maxProcess
    ) {
      // Process high-priority events first
      const event =
        this.priorityQueue.length > 0
          ? this.priorityQueue.shift()
          : this.queue.shift();

      if (event) {
        this.executeDispatch(event);
        processed++;
      }
    }

    // If still events in queue, schedule next batch
    if (this.priorityQueue.length > 0 || this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 0);
    }
  }

  /**
   * Debounces event dispatch
   * @private
   */
  debounceDispatch(type, payload, delay, options) {
    // Clear existing timer
    if (this.debounceTimers.has(type)) {
      clearTimeout(this.debounceTimers.get(type));
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(type);
      this.dispatch(type, payload, { ...options, debounce: 0 });
    }, delay);

    this.debounceTimers.set(type, timer);
    return true;
  }

  /**
   * Checks if event should be retried
   * @private
   */
  shouldRetry(event) {
    const retryKey = `${event.type}-${event.id}`;
    const retryCount = this.eventRetryCount.get(retryKey) || 0;

    if (retryCount >= this.maxRetries) {
      this.eventRetryCount.delete(retryKey);
      return false;
    }

    return true;
  }

  /**
   * Retries event dispatch
   * @private
   */
  retryDispatch(event) {
    const retryKey = `${event.type}-${event.id}`;
    const retryCount = this.eventRetryCount.get(retryKey) || 0;
    this.eventRetryCount.set(retryKey, retryCount + 1);

    const delay = Math.min(100 * Math.pow(2, retryCount), 3000); // Exponential backoff

    setTimeout(() => {
      console.debug(
        `Retrying event ${event.type} (attempt ${retryCount + 1}/${
          this.maxRetries
        })`
      );
      this.executeDispatch(event);
    }, delay);
  }

  /**
   * Handles dispatch errors
   * @private
   */
  handleDispatchError(error, type, payload) {
    this.notifyErrorHandlers(error, { type, payload });

    // Reset dispatching flag to prevent deadlock
    this.isDispatching = false;
  }

  /**
   * Notifies custom error handlers
   * @private
   */
  notifyErrorHandlers(error, event) {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error, event);
      } catch (e) {
        console.error("Error in error handler:", e);
      }
    });
  }

  /**
   * Registers a custom error handler
   * @param {Function} handler - Error handler function
   * @returns {Function} - Unsubscribe function
   */
  onError(handler) {
    if (typeof handler !== "function") {
      console.warn("Invalid error handler");
      return () => {};
    }

    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  /**
   * Adds event to history
   * @param {AppEvent} event - Event to add
   */
  addToHistory(event) {
    this.eventHistory.push(event);

    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }
  }

  /**
   * Gets event history
   * @param {string} [type] - Optional event type filter
   * @returns {AppEvent[]}
   */
  getHistory(type = null) {
    if (type) {
      return this.eventHistory.filter((e) => e.type === type);
    }
    return [...this.eventHistory];
  }

  /**
   * Clears event history
   */
  clearHistory() {
    this.eventHistory = [];
  }

  /**
   * Removes all listeners
   */
  clear() {
    this.listeners.clear();
    this.queue = [];
    this.priorityQueue = [];

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    this.lastEventTime.clear();
    this.eventRetryCount.clear();
  }

  /**
   * Destroys the event dispatcher and cleans up all resources
   */
  destroy() {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.clear();
    this.eventHistory = [];
    this.errorHandlers.clear();

    console.debug("EventDispatcher destroyed");
  }

  /**
   * Gets listener count for an event type
   * @param {string} type - Event type
   * @returns {number}
   */
  getListenerCount(type) {
    const listeners = this.listeners.get(type);
    return listeners ? listeners.size : 0;
  }
}

/**
 * Create a singleton instance
 */
export const eventDispatcher = new EventDispatcher();

/**
 * Helper function to dispatch events with options
 * @param {string} type - Event type
 * @param {Object} payload - Event payload
 * @param {Object} options - Dispatch options
 * @returns {boolean}
 */
export function dispatch(type, payload, options = {}) {
  return eventDispatcher.dispatch(type, payload, options);
}

/**
 * Helper function to subscribe to events
 * @param {string} type - Event type
 * @param {Function} callback - Callback function
 * @returns {Function} - Unsubscribe function
 */
export function on(type, callback) {
  return eventDispatcher.on(type, callback);
}

/**
 * Helper function to subscribe once
 * @param {string} type - Event type
 * @param {Function} callback - Callback function
 * @returns {Function} - Unsubscribe function
 */
export function once(type, callback) {
  return eventDispatcher.once(type, callback);
}
