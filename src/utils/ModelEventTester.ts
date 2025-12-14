/**
 * Model Event System Test Utility
 *
 * This utility helps verify that all model events are properly
 * published and handled. Use in browser console for testing.
 */

import { DomainEvent, EventType } from '@domain/events/DomainEvents';
import { IEventBus } from '@domain/interfaces/IEventBus';

interface EventLogEntry {
  type: string;
  timestamp: Date;
  payload?: unknown;
}

interface EventBusDiagnostics {
  handlerCount: number;
  eventTypes: string[];
  historySize: number;
  isProcessing: boolean;
  queueSize: number;
}

interface ExtendedEventBus extends IEventBus {
  getDiagnostics?: () => EventBusDiagnostics;
}

interface ModelServiceLike {
  loadModel?: (file: File) => Promise<void>;
  selectSection?: (sectionId: string) => void;
}

interface OperationsServiceLike {
  disassemble?: (model: unknown) => void;
}

export class ModelEventTester {
  private eventLog: EventLogEntry[] = [];
  private unsubscribers: Array<() => void> = [];

  constructor(private eventBus: IEventBus) {
    if (import.meta.env.DEV) {
      console.warn('[EventTester] Initialized. Use .startLogging() to begin.');
    }
  }

  /**
   * Start logging all model-related events
   */
  startLogging(eventTypesToLog: EventType[] = Object.values(EventType)): void {
    this.clearLog();

    eventTypesToLog.forEach((type) => {
      const unsubscribe = this.eventBus.subscribe(type, (event: DomainEvent) => {
        const logEntry: EventLogEntry = {
          type: event.type,
          timestamp: event.timestamp,
          payload: event.payload,
        };
        this.eventLog.push(logEntry);
        if (import.meta.env.DEV) {
          console.warn(`[EventTester] 📡 ${type}`, event.payload ? event.payload : '');
        }
      });
      this.unsubscribers.push(unsubscribe);
    });

    if (import.meta.env.DEV) {
      console.warn('[EventTester] ✅ Logging started for', eventTypesToLog.length, 'event types');
    }
  }

  /**
   * Stop logging and cleanup
   */
  stopLogging(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    if (import.meta.env.DEV) {
      console.warn('[EventTester] ⏹️ Logging stopped');
    }
  }

  /**
   * Get all logged events
   */
  getLog(): EventLogEntry[] {
    return [...this.eventLog];
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(type: string): EventLogEntry[] {
    return this.eventLog.filter((e) => e.type === type);
  }

  /**
   * Print summary of events
   */
  printSummary(): void {
    if (import.meta.env.DEV) {
      console.warn('\n=== Event Log Summary ===');
      console.warn(`Total Events: ${this.eventLog.length}`);

      const grouped = this.eventLog.reduce(
        (acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // In dev mode, console.table is useful for debugging
      // eslint-disable-next-line no-console
      console.table(grouped);
    }
  }

  /**
   * Clear the log
   */
  clearLog(): void {
    this.eventLog = [];
    if (import.meta.env.DEV) {
      console.warn('[EventTester] 🗑️ Log cleared');
    }
  }

  /**
   * Test model loading flow
   */
  async testModelLoad(file: File, modelService: ModelServiceLike): Promise<void> {
    if (import.meta.env.DEV) {
      console.warn('\n=== Testing Model Load Flow ===');
      this.clearLog();

      try {
        if (modelService?.loadModel) {
          await modelService.loadModel(file);
          console.warn('✅ Model load completed');
          this.printSummary();
        }
      } catch (error) {
        console.error('❌ Model load failed:', error);
        this.printSummary();
      }
    }
  }

  /**
   * Test section selection flow
   */
  testSectionSelect(sectionId: string, modelService: ModelServiceLike): void {
    if (import.meta.env.DEV) {
      console.warn('\n=== Testing Section Selection ===');
      const beforeCount = this.eventLog.length;

      modelService?.selectSection?.(sectionId);

      const newEvents = this.eventLog.slice(beforeCount);
      console.warn('Events published:', newEvents.length);
      newEvents.forEach((e) => console.warn('  -', e.type));
    }
  }

  /**
   * Test disassembly flow
   */
  testDisassembly(model: unknown, operationsService: OperationsServiceLike): void {
    if (import.meta.env.DEV) {
      console.warn('\n=== Testing Disassembly Flow ===');
      const beforeCount = this.eventLog.length;

      operationsService?.disassemble?.(model);

      const newEvents = this.eventLog.slice(beforeCount);
      console.warn('Events published:', newEvents.length);
      newEvents.forEach((e) => console.warn('  -', e.type));
    }
  }

  /**
   * Verify event system health
   */
  verifyEventSystem(): void {
    if (import.meta.env.DEV) {
      console.warn('\n=== Event System Health Check ===');

      const extendedBus = this.eventBus as ExtendedEventBus;
      const diagnostics = extendedBus.getDiagnostics?.();
      if (diagnostics) {
        console.warn('📊 Event Bus Diagnostics:');
        console.warn('  Handler Count:', diagnostics.handlerCount);
        console.warn('  Event Types:', diagnostics.eventTypes.length);
        console.warn('  History Size:', diagnostics.historySize);
        console.warn('  Is Processing:', diagnostics.isProcessing);
        console.warn('  Queue Size:', diagnostics.queueSize);
        console.warn('\n  Registered Event Types:');
        diagnostics.eventTypes.forEach((type: string) => console.warn('    -', type));
      } else {
        console.warn('⚠️ getDiagnostics() not available');
      }
    }
  }
}

/**
 * Usage in browser console:
 *
 * // Access the app instance (exposed in dev mode)
 * const tester = new ModelEventTester(window.app.eventBus);
 *
 * // Start logging all events
 * tester.startLogging();
 *
 * // Interact with the app (load model, select sections, etc.)
 * // Events will be logged to console
 *
 * // View summary
 * tester.printSummary();
 *
 * // Check specific events
 * tester.getEventsByType('section:selected');
 *
 * // Verify system health
 * tester.verifyEventSystem();
 *
 * // Stop logging
 * tester.stopLogging();
 */

// Make available globally in dev mode
if (import.meta.env.DEV) {
  (window as unknown as { ModelEventTester: typeof ModelEventTester }).ModelEventTester =
    ModelEventTester;
  console.warn(
    '💡 ModelEventTester available globally. Use: new ModelEventTester(window.app.eventBus)'
  );
}
