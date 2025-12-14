/**
 * Domain Events
 * 
 * Represents various events that occur in the domain.
 * These events are used to notify listeners about state changes.
 */

export enum EventType {
  // Model lifecycle events
  MODEL_LOADING = 'model:loading',
  MODEL_LOADED = 'model:loaded',
  MODEL_LOAD_ERROR = 'model:error',
  MODEL_UPDATED = 'model:updated',
  MODEL_CLEARED = 'model:cleared',

  // Selection events
  SECTION_SELECTED = 'section:selected',
  SECTION_DESELECTED = 'section:deselected',
  SECTION_FOCUSED = 'section:focused',
  SECTION_HIGHLIGHTED = 'section:highlighted',

  // View events
  VIEW_RESET = 'view:reset',
  VIEW_ZOOM_CHANGED = 'view:zoom',
  VIEW_FIT = 'view:fit',
  VIEW_FULLSCREEN = 'view:fullscreen',

  // Operation events
  MODEL_DISASSEMBLED = 'model:disassembled',
  MODEL_REASSEMBLED = 'model:reassembled',

  // Display events
  DISPLAY_OPTION_CHANGED = 'display:option_changed',
}

export interface DomainEvent {
  readonly type: EventType;
  readonly timestamp: Date;
  readonly payload?: unknown;
}

export class ModelLoadingEvent implements DomainEvent {
  readonly type = EventType.MODEL_LOADING;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { filename: string }) {}
}

export class ModelLoadedEvent implements DomainEvent {
  readonly type = EventType.MODEL_LOADED;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { 
    filename: string; 
    sectionCount: number;
    format: string;
  }) {}
}

export class ModelLoadErrorEvent implements DomainEvent {
  readonly type = EventType.MODEL_LOAD_ERROR;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { error: Error }) {}
}

export class SectionSelectedEvent implements DomainEvent {
  readonly type = EventType.SECTION_SELECTED;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { sectionId: string }) {}
}

export class SectionFocusedEvent implements DomainEvent {
  readonly type = EventType.SECTION_FOCUSED;
  readonly timestamp = new Date();
  
  constructor(public readonly payload: { sectionId: string }) {}
}

export class ViewResetEvent implements DomainEvent {
  readonly type = EventType.VIEW_RESET;
  readonly timestamp = new Date();
  readonly payload = undefined;
}

export class ModelDisassembledEvent implements DomainEvent {
  readonly type = EventType.MODEL_DISASSEMBLED;
  readonly timestamp = new Date();
  readonly payload = undefined;
}

export class ModelReassembledEvent implements DomainEvent {
  readonly type = EventType.MODEL_REASSEMBLED;
  readonly timestamp = new Date();
  readonly payload = undefined;
}
