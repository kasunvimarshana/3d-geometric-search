/**
 * Domain events for the 3D geometric search application
 * All model changes flow through this centralized event system
 */

import type { Model3D, ModelSection, ViewState } from "./types";

export enum EventType {
  // Model lifecycle events
  MODEL_LOADING = "model:loading",
  MODEL_LOADED = "model:loaded",
  MODEL_LOAD_ERROR = "model:load-error",
  MODEL_UPDATED = "model:updated",
  MODEL_UNLOADED = "model:unloaded",

  // Section events
  SECTION_SELECTED = "section:selected",
  SECTION_DESELECTED = "section:deselected",
  SECTION_FOCUSED = "section:focused",
  SECTION_HIGHLIGHTED = "section:highlighted",
  SECTION_DEHIGHLIGHTED = "section:dehighlighted",
  SECTION_VISIBILITY_CHANGED = "section:visibility-changed",

  // View events
  VIEW_STATE_CHANGED = "view:state-changed",
  VIEW_RESET = "view:reset",
  VIEW_FULLSCREEN_TOGGLE = "view:fullscreen-toggle",

  // Model transformation events
  MODEL_DISASSEMBLED = "model:disassembled",
  MODEL_REASSEMBLED = "model:reassembled",

  // Navigation events
  NAVIGATE_TO_SECTION = "navigate:to-section",
  NAVIGATE_PARENT = "navigate:parent",
  NAVIGATE_CHILD = "navigate:child",
}

export interface BaseEvent {
  type: EventType;
  timestamp: Date;
  source?: string;
}

export interface ModelLoadingEvent extends BaseEvent {
  type: EventType.MODEL_LOADING;
  filePath: string;
}

export interface ModelLoadedEvent extends BaseEvent {
  type: EventType.MODEL_LOADED;
  model: Model3D;
}

export interface ModelLoadErrorEvent extends BaseEvent {
  type: EventType.MODEL_LOAD_ERROR;
  error: Error;
  filePath: string;
}

export interface ModelUpdatedEvent extends BaseEvent {
  type: EventType.MODEL_UPDATED;
  model: Model3D;
}

export interface SectionSelectedEvent extends BaseEvent {
  type: EventType.SECTION_SELECTED;
  sectionId: string;
  section: ModelSection;
}

export interface SectionDeselectedEvent extends BaseEvent {
  type: EventType.SECTION_DESELECTED;
  sectionId: string;
}

export interface SectionFocusedEvent extends BaseEvent {
  type: EventType.SECTION_FOCUSED;
  sectionId: string;
  section: ModelSection;
}

export interface SectionHighlightedEvent extends BaseEvent {
  type: EventType.SECTION_HIGHLIGHTED;
  sectionId: string;
}

export interface SectionDehighlightedEvent extends BaseEvent {
  type: EventType.SECTION_DEHIGHLIGHTED;
  sectionId: string;
}

export interface ViewStateChangedEvent extends BaseEvent {
  type: EventType.VIEW_STATE_CHANGED;
  viewState: ViewState;
}

export interface ViewResetEvent extends BaseEvent {
  type: EventType.VIEW_RESET;
}

export interface ModelDisassembledEvent extends BaseEvent {
  type: EventType.MODEL_DISASSEMBLED;
}

export interface ModelReassembledEvent extends BaseEvent {
  type: EventType.MODEL_REASSEMBLED;
}

export interface NavigateToSectionEvent extends BaseEvent {
  type: EventType.NAVIGATE_TO_SECTION;
  sectionId: string;
}

export type DomainEvent =
  | ModelLoadingEvent
  | ModelLoadedEvent
  | ModelLoadErrorEvent
  | ModelUpdatedEvent
  | SectionSelectedEvent
  | SectionDeselectedEvent
  | SectionFocusedEvent
  | SectionHighlightedEvent
  | SectionDehighlightedEvent
  | ViewStateChangedEvent
  | ViewResetEvent
  | ModelDisassembledEvent
  | ModelReassembledEvent
  | NavigateToSectionEvent;

export type EventListener<T extends DomainEvent = DomainEvent> = (
  event: T
) => void;
