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
   * Dispatches an event
   * @param {string} type - Event type
   * @param {Object} payload - Event payload
   * @returns {boolean} - Success status
   */
  dispatch(type, payload = {}) {
    try {
      // Validate event type
      if (!Object.values(EventType).includes(type)) {
        console.warn(`Unknown event type: ${type}`);
        return false;
      }

      // Validate payload
      if (!this.validatePayload(type, payload)) {
        console.warn(`Invalid payload for event type: ${type}`, payload);
        return false;
      }

      const event = new AppEvent(type, payload);

      // Queue events if currently dispatching to prevent recursion
      if (this.isDispatching) {
        this.queue.push(event);
        return true;
      }

      this.isDispatching = true;

      // Add to history
      this.addToHistory(event);

      // Dispatch to listeners
      const listeners = this.listeners.get(type);
      if (listeners && listeners.size > 0) {
        listeners.forEach((callback) => {
          try {
            callback(event);
          } catch (error) {
            console.error(`Error in event listener for ${type}:`, error);
            this.dispatch(EventType.ERROR, {
              error,
              message: `Event listener error: ${error.message}`,
              context: { eventType: type },
            });
          }
        });
      }

      this.isDispatching = false;

      // Process queued events
      this.processQueue();

      return true;
    } catch (error) {
      console.error("Error dispatching event:", error);
      this.isDispatching = false;
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
   * Processes queued events
   */
  processQueue() {
    while (this.queue.length > 0 && !this.isDispatching) {
      const event = this.queue.shift();
      this.isDispatching = true;

      const listeners = this.listeners.get(event.type);
      if (listeners && listeners.size > 0) {
        listeners.forEach((callback) => {
          try {
            callback(event);
          } catch (error) {
            console.error(
              `Error in queued event listener for ${event.type}:`,
              error
            );
          }
        });
      }

      this.isDispatching = false;
    }
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
 * Helper function to dispatch events
 * @param {string} type - Event type
 * @param {Object} payload - Event payload
 * @returns {boolean}
 */
export function dispatch(type, payload) {
  return eventDispatcher.dispatch(type, payload);
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
