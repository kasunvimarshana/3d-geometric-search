import { EventType } from "./types";

/**
 * Base event interface
 */
export interface DomainEvent {
  type: EventType;
  timestamp: number;
  payload?: unknown;
}

/**
 * Model-related events
 */
export interface ModelLoadStartEvent extends DomainEvent {
  type: EventType.MODEL_LOAD_START;
  payload: {
    filename: string;
    format: string;
  };
}

export interface ModelLoadSuccessEvent extends DomainEvent {
  type: EventType.MODEL_LOAD_SUCCESS;
  payload: {
    modelId: string;
    sectionCount: number;
  };
}

export interface ModelLoadErrorEvent extends DomainEvent {
  type: EventType.MODEL_LOAD_ERROR;
  payload: {
    error: string;
    filename: string;
  };
}

/**
 * Section-related events
 */
export interface SectionSelectEvent extends DomainEvent {
  type: EventType.SECTION_SELECT;
  payload: {
    sectionId: string;
    multi: boolean;
  };
}

export interface SectionDeselectEvent extends DomainEvent {
  type: EventType.SECTION_DESELECT;
  payload: {
    sectionId?: string; // If undefined, deselect all
  };
}

export interface SectionFocusEvent extends DomainEvent {
  type: EventType.SECTION_FOCUS;
  payload: {
    sectionId: string;
  };
}

export interface SectionIsolateEvent extends DomainEvent {
  type: EventType.SECTION_ISOLATE;
  payload: {
    sectionIds: string[];
  };
}

export interface SectionHighlightEvent extends DomainEvent {
  type: EventType.SECTION_HIGHLIGHT;
  payload: {
    sectionId: string;
    duration?: number;
  };
}

export interface SectionDehighlightEvent extends DomainEvent {
  type: EventType.SECTION_DEHIGHLIGHT;
  payload: {
    sectionId?: string; // If undefined, dehighlight all
  };
}

/**
 * View-related events
 */
export interface ViewResetEvent extends DomainEvent {
  type: EventType.VIEW_RESET;
  payload?: {
    animated?: boolean;
  };
}

export interface ViewZoomEvent extends DomainEvent {
  type: EventType.VIEW_ZOOM;
  payload: {
    delta: number;
    point?: { x: number; y: number };
    animated?: boolean;
  };
}

export interface ViewScaleEvent extends DomainEvent {
  type: EventType.VIEW_SCALE;
  payload: {
    scaleFactor: number;
    animated?: boolean;
  };
}

export interface FitToScreenEvent extends DomainEvent {
  type: EventType.VIEW_FIT_TO_SCREEN;
  payload?: {
    animated?: boolean;
    margin?: number;
  };
}

export interface ViewModeChangeEvent extends DomainEvent {
  type: EventType.VIEW_MODE_CHANGE;
  payload: {
    mode: string;
  };
}

/**
 * Animation-related events
 */
export interface AnimationStartEvent extends DomainEvent {
  type: EventType.ANIMATION_START;
  payload: {
    animationType: string;
  };
}

export interface AnimationCompleteEvent extends DomainEvent {
  type: EventType.ANIMATION_COMPLETE;
  payload: {
    animationType: string;
  };
}

/**
 * State-related events
 */
export interface StateUpdateEvent extends DomainEvent {
  type: EventType.STATE_UPDATE;
  payload: {
    path: string;
    value: unknown;
  };
}

export interface ErrorEvent extends DomainEvent {
  type: EventType.ERROR;
  payload: {
    error: string;
    context?: string;
  };
}

/**
 * Union type of all events
 */
export type ApplicationEvent =
  | ModelLoadStartEvent
  | ModelLoadSuccessEvent
  | ModelLoadErrorEvent
  | SectionSelectEvent
  | SectionDeselectEvent
  | SectionFocusEvent
  | SectionIsolateEvent
  | SectionHighlightEvent
  | SectionDehighlightEvent
  | ViewResetEvent
  | ViewZoomEvent
  | ViewScaleEvent
  | FitToScreenEvent
  | ViewModeChangeEvent
  | AnimationStartEvent
  | AnimationCompleteEvent
  | StateUpdateEvent
  | ErrorEvent;
