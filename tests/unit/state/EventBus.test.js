/**
 * Unit Tests for EventBus State Management
 *
 * @group unit
 * @group state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBus } from '@state/EventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('subscribe()', () => {
    it('should subscribe to events', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);

      eventBus.publish('test-event', { data: 'test' });

      expect(handler).toHaveBeenCalledWith({ data: 'test' });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);

      eventBus.publish('test-event', { data: 'test' });

      expect(handler1).toHaveBeenCalledWith({ data: 'test' });
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should return unsubscribe function', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe('test-event', handler);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      eventBus.publish('test-event', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should support wildcard subscriptions', () => {
      const handler = vi.fn();
      eventBus.subscribe('*', handler);

      eventBus.publish('event1', { data: 1 });
      eventBus.publish('event2', { data: 2 });

      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('unsubscribe()', () => {
    it('should unsubscribe from events', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);

      eventBus.unsubscribe('test-event', handler);
      eventBus.publish('test-event', { data: 'test' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should only unsubscribe specific handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);

      eventBus.unsubscribe('test-event', handler1);
      eventBus.publish('test-event', { data: 'test' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('publish()', () => {
    it('should publish events to subscribers', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);

      eventBus.publish('test-event', { value: 42 });

      expect(handler).toHaveBeenCalledWith({ value: 42 });
    });

    it('should handle events with no subscribers', () => {
      expect(() => {
        eventBus.publish('no-subscribers', { data: 'test' });
      }).not.toThrow();
    });

    it('should record event in history', () => {
      eventBus.publish('test-event', { data: 'test' });

      const history = eventBus.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].eventType).toBe('test-event');
      expect(history[0].data).toEqual({ data: 'test' });
    });

    it('should include timestamp in history', () => {
      const beforeTime = Date.now();
      eventBus.publish('test-event', { data: 'test' });
      const afterTime = Date.now();

      const history = eventBus.getHistory();
      const timestamp = history[0].timestamp.getTime();

      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it('should handle errors in handlers gracefully', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const goodHandler = vi.fn();

      eventBus.subscribe('test-event', errorHandler);
      eventBus.subscribe('test-event', goodHandler);

      expect(() => {
        eventBus.publish('test-event', { data: 'test' });
      }).not.toThrow();

      expect(errorHandler).toHaveBeenCalled();
      expect(goodHandler).toHaveBeenCalled();
    });
  });

  describe('getHistory()', () => {
    it('should return event history', () => {
      eventBus.publish('event1', { data: 1 });
      eventBus.publish('event2', { data: 2 });

      const history = eventBus.getHistory();

      expect(history).toHaveLength(2);
      expect(history[0].eventType).toBe('event2');
      expect(history[1].eventType).toBe('event1');
    });

    it('should limit history size', () => {
      // Publish more events than max history size (default 100)
      for (let i = 0; i < 150; i++) {
        eventBus.publish('test-event', { count: i });
      }

      const history = eventBus.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('should return limited number of events when specified', () => {
      for (let i = 0; i < 20; i++) {
        eventBus.publish('test-event', { count: i });
      }

      const history = eventBus.getHistory(5);
      expect(history).toHaveLength(5);
    });

    it('should return most recent events first', () => {
      eventBus.publish('event1', { order: 1 });
      eventBus.publish('event2', { order: 2 });
      eventBus.publish('event3', { order: 3 });

      const history = eventBus.getHistory();

      expect(history[0].data.order).toBe(3);
      expect(history[1].data.order).toBe(2);
      expect(history[2].data.order).toBe(1);
    });
  });

  describe('clearHistory()', () => {
    it('should clear event history', () => {
      eventBus.publish('event1', { data: 1 });
      eventBus.publish('event2', { data: 2 });

      eventBus.clearHistory();

      const history = eventBus.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('hasSubscribers()', () => {
    it('should return true when event has subscribers', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);

      expect(eventBus.hasSubscribers('test-event')).toBe(true);
    });

    it('should return false when event has no subscribers', () => {
      expect(eventBus.hasSubscribers('no-subscribers')).toBe(false);
    });

    it('should return false after all handlers unsubscribed', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.subscribe('test-event', handler);

      expect(eventBus.hasSubscribers('test-event')).toBe(true);

      unsubscribe();

      expect(eventBus.hasSubscribers('test-event')).toBe(false);
    });
  });

  describe('getSubscriberCount()', () => {
    it('should return correct subscriber count', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();

      eventBus.subscribe('test-event', handler1);
      eventBus.subscribe('test-event', handler2);
      eventBus.subscribe('test-event', handler3);

      expect(eventBus.getSubscriberCount('test-event')).toBe(3);
    });

    it('should return 0 for events with no subscribers', () => {
      expect(eventBus.getSubscriberCount('no-subscribers')).toBe(0);
    });

    it('should update count after unsubscribe', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      eventBus.subscribe('test-event', handler1);
      const unsubscribe2 = eventBus.subscribe('test-event', handler2);

      expect(eventBus.getSubscriberCount('test-event')).toBe(2);

      unsubscribe2();

      expect(eventBus.getSubscriberCount('test-event')).toBe(1);
    });
  });

  describe('reset()', () => {
    it('should clear all subscribers and history', () => {
      const handler = vi.fn();
      eventBus.subscribe('test-event', handler);
      eventBus.publish('test-event', { data: 'test' });

      eventBus.reset();

      expect(eventBus.hasSubscribers('test-event')).toBe(false);
      expect(eventBus.getHistory()).toHaveLength(0);

      eventBus.publish('test-event', { data: 'test2' });
      expect(handler).toHaveBeenCalledTimes(1); // Only the first call
    });
  });
});
