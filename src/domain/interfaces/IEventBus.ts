/**
 * Event Bus Interface
 * 
 * Contract for centralized event management.
 * Enables decoupled communication between components.
 */

import { DomainEvent, EventType } from '../events/DomainEvents';

export type EventHandler<T = unknown> = (event: DomainEvent & { payload?: T }) => void;

export interface IEventBus {
  publish(event: DomainEvent): void;
  subscribe<T = unknown>(eventType: EventType, handler: EventHandler<T>): () => void;
  unsubscribe(eventType: EventType, handler: EventHandler): void;
  clear(): void;
}
