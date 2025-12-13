/**
 * Event Bus - Centralized event management
 * Following Observer Pattern and Dependency Inversion
 */

import { IEventHandler } from '../domain/models.js';

export class EventBus extends IEventHandler {
  constructor() {
    super();
    this.listeners = new Map(); // eventType -> Set of callbacks
  }

  /**
   * Subscribe to an event
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  /**
   * Emit an event
   */
  emit(eventType, data = null) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners
   */
  clear() {
    this.listeners.clear();
  }

  /**
   * Get all registered event types
   */
  getEventTypes() {
    return Array.from(this.listeners.keys());
  }
}
