import { UUID } from "@shared/types/interfaces";

/**
 * Event base class
 * Follows Open-Closed Principle - open for extension, closed for modification
 */
export abstract class DomainEvent {
  public readonly timestamp: Date;
  public readonly eventType: string;

  constructor(eventType: string) {
    this.timestamp = new Date();
    this.eventType = eventType;
  }
}

/**
 * Model loaded event
 */
export class ModelLoadedEvent extends DomainEvent {
  constructor(public readonly modelId: UUID) {
    super("MODEL_LOADED");
  }
}

/**
 * Model unloaded event
 */
export class ModelUnloadedEvent extends DomainEvent {
  constructor(public readonly modelId: UUID) {
    super("MODEL_UNLOADED");
  }
}

/**
 * Section selected event
 */
export class SectionSelectedEvent extends DomainEvent {
  constructor(
    public readonly sectionIds: UUID[],
    public readonly previousIds: UUID[]
  ) {
    super("SECTION_SELECTED");
  }
}

/**
 * Section visibility changed event
 */
export class SectionVisibilityChangedEvent extends DomainEvent {
  constructor(
    public readonly sectionId: UUID,
    public readonly visible: boolean
  ) {
    super("SECTION_VISIBILITY_CHANGED");
  }
}

/**
 * Section isolated event
 */
export class SectionIsolatedEvent extends DomainEvent {
  constructor(public readonly sectionIds: UUID[]) {
    super("SECTION_ISOLATED");
  }
}

/**
 * Camera changed event
 */
export class CameraChangedEvent extends DomainEvent {
  constructor(
    public readonly position: { x: number; y: number; z: number },
    public readonly target: { x: number; y: number; z: number }
  ) {
    super("CAMERA_CHANGED");
  }
}

/**
 * Event handler interface
 */
export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): void | Promise<void>;
}

/**
 * Event bus for managing domain events
 * Follows Dependency Inversion Principle - depends on abstractions
 */
export class EventBus {
  private handlers: Map<string, Set<IEventHandler<DomainEvent>>> = new Map();

  /**
   * Subscribe to an event
   */
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: IEventHandler<T>
  ): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Publish an event
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType);
    if (!handlers) return;

    const promises: Promise<void>[] = [];
    handlers.forEach((handler) => {
      const result = handler.handle(event);
      if (result instanceof Promise) {
        promises.push(result);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}
