/**
 * Domain Layer Exports
 * Central export point for all domain entities, value objects, and interfaces
 */

// Models
export { Model } from './models/Model.js';
export { Section } from './models/Section.js';
export { Assembly } from './models/Assembly.js';

// Value Objects
export { Vector3D } from './values/Vector3D.js';
export { BoundingBox } from './values/BoundingBox.js';

// Interfaces
export {
  IModelLoader,
  IFormatHandler,
  ISectionManager,
  INavigationService,
  IExportService,
  IStateManager,
  IEventBus,
} from './interfaces/index.js';

// Domain Events
export {
  DomainEvent,
  ModelLoadStartedEvent,
  ModelLoadProgressEvent,
  ModelLoadedEvent,
  ModelLoadFailedEvent,
  ModelUnloadedEvent,
  ModelUpdatedEvent,
  SectionsDiscoveredEvent,
  SectionSelectedEvent,
  SectionDeselectedEvent,
  SectionHighlightedEvent,
  SectionIsolatedEvent,
  SectionVisibilityChangedEvent,
  ModelDisassembledEvent,
  ModelReassembledEvent,
  FocusModeEnteredEvent,
  FocusModeExitedEvent,
  CameraMovedEvent,
  ViewResetEvent,
  CameraPresetChangedEvent,
  DomainErrorEvent,
  DomainEventFactory,
} from './events/DomainEvents.js';
