/**
 * Domain Events
 * Pure domain event definitions following Domain-Driven Design
 */

/**
 * Base Domain Event
 * All domain events extend from this base class
 */
export class DomainEvent {
  constructor(eventName, data = {}, timestamp = new Date()) {
    this.eventName = eventName;
    this.data = Object.freeze({ ...data });
    this.timestamp = timestamp;
    this.id = `${eventName}-${timestamp.getTime()}-${Math.random().toString(36).substr(2, 9)}`;
    Object.freeze(this);
  }

  toJSON() {
    return {
      id: this.id,
      eventName: this.eventName,
      data: this.data,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Model Domain Events
 */

export class ModelLoadStartedEvent extends DomainEvent {
  constructor(modelId, modelName) {
    super('MODEL_LOAD_STARTED', { modelId, modelName });
  }
}

export class ModelLoadProgressEvent extends DomainEvent {
  constructor(modelId, progress, loaded, total) {
    super('MODEL_LOAD_PROGRESS', { modelId, progress, loaded, total });
  }
}

export class ModelLoadedEvent extends DomainEvent {
  constructor(model, object3D, sections) {
    super('MODEL_LOADED', { model, object3D, sections });
  }
}

export class ModelLoadFailedEvent extends DomainEvent {
  constructor(modelId, error) {
    super('MODEL_LOAD_FAILED', { modelId, error: error.message });
  }
}

export class ModelUnloadedEvent extends DomainEvent {
  constructor(modelId) {
    super('MODEL_UNLOADED', { modelId });
  }
}

export class ModelUpdatedEvent extends DomainEvent {
  constructor(model, changes) {
    super('MODEL_UPDATED', { model, changes });
  }
}

/**
 * Section Domain Events
 */

export class SectionsDiscoveredEvent extends DomainEvent {
  constructor(modelId, sections) {
    super('SECTIONS_DISCOVERED', {
      modelId,
      sectionCount: sections.length,
      sections: sections.map(s => s.toJSON()),
    });
  }
}

export class SectionSelectedEvent extends DomainEvent {
  constructor(sectionId, section) {
    super('SECTION_SELECTED', { sectionId, section: section?.toJSON() });
  }
}

export class SectionDeselectedEvent extends DomainEvent {
  constructor(sectionId) {
    super('SECTION_DESELECTED', { sectionId });
  }
}

export class SectionHighlightedEvent extends DomainEvent {
  constructor(sectionId, highlighted) {
    super('SECTION_HIGHLIGHTED', { sectionId, highlighted });
  }
}

export class SectionIsolatedEvent extends DomainEvent {
  constructor(sectionId, isolated) {
    super('SECTION_ISOLATED', { sectionId, isolated });
  }
}

export class SectionVisibilityChangedEvent extends DomainEvent {
  constructor(sectionId, isVisible) {
    super('SECTION_VISIBILITY_CHANGED', { sectionId, isVisible });
  }
}

/**
 * Assembly Domain Events
 */

export class ModelDisassembledEvent extends DomainEvent {
  constructor(modelId, assembly) {
    super('MODEL_DISASSEMBLED', { modelId, assembly: assembly?.toJSON() });
  }
}

export class ModelReassembledEvent extends DomainEvent {
  constructor(modelId) {
    super('MODEL_REASSEMBLED', { modelId });
  }
}

/**
 * Navigation Domain Events
 */

export class FocusModeEnteredEvent extends DomainEvent {
  constructor(targetId, targetType) {
    super('FOCUS_MODE_ENTERED', { targetId, targetType });
  }
}

export class FocusModeExitedEvent extends DomainEvent {
  constructor() {
    super('FOCUS_MODE_EXITED', {});
  }
}

export class CameraMovedEvent extends DomainEvent {
  constructor(position, target) {
    super('CAMERA_MOVED', { position, target });
  }
}

export class ViewResetEvent extends DomainEvent {
  constructor() {
    super('VIEW_RESET', {});
  }
}

export class CameraPresetChangedEvent extends DomainEvent {
  constructor(preset) {
    super('CAMERA_PRESET_CHANGED', { preset });
  }
}

/**
 * Error Domain Event
 */

export class DomainErrorEvent extends DomainEvent {
  constructor(error, context = {}) {
    super('DOMAIN_ERROR', {
      message: error.message,
      stack: error.stack,
      ...context,
    });
  }
}

/**
 * Event Factory
 * Helper for creating domain events
 */
export class DomainEventFactory {
  static createModelLoadStarted(modelId, modelName) {
    return new ModelLoadStartedEvent(modelId, modelName);
  }

  static createModelLoadProgress(modelId, progress, loaded, total) {
    return new ModelLoadProgressEvent(modelId, progress, loaded, total);
  }

  static createModelLoaded(model, object3D, sections) {
    return new ModelLoadedEvent(model, object3D, sections);
  }

  static createModelLoadFailed(modelId, error) {
    return new ModelLoadFailedEvent(modelId, error);
  }

  static createSectionsDiscovered(modelId, sections) {
    return new SectionsDiscoveredEvent(modelId, sections);
  }

  static createSectionSelected(sectionId, section) {
    return new SectionSelectedEvent(sectionId, section);
  }

  static createSectionDeselected(sectionId) {
    return new SectionDeselectedEvent(sectionId);
  }

  static createError(error, context) {
    return new DomainErrorEvent(error, context);
  }
}
