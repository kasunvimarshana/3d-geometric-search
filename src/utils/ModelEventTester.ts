/**
 * Model Event System Test Utility
 *
 * This utility helps verify that all model events are properly
 * published and handled. Use in browser console for testing.
 */

export class ModelEventTester {
  private eventLog: Array<{ type: string; timestamp: Date; payload?: unknown }> = [];
  private unsubscribers: Array<() => void> = [];

  constructor(private eventBus: any) {
    console.log('[EventTester] Initialized. Use .startLogging() to begin.');
  }

  /**
   * Start logging all model-related events
   */
  startLogging(): void {
    const eventTypes = [
      'model:loading',
      'model:loaded',
      'model:error',
      'model:updated',
      'model:cleared',
      'section:selected',
      'section:deselected',
      'section:focused',
      'selection:cleared',
      'model:disassembled',
      'model:reassembled',
      'operation:error',
    ];

    eventTypes.forEach((type) => {
      const unsubscribe = this.eventBus.subscribe(type, (event: any) => {
        const logEntry = {
          type: event.type,
          timestamp: event.timestamp,
          payload: event.payload,
        };
        this.eventLog.push(logEntry);
        console.log(`[EventTester] 📡 ${type}`, event.payload ? event.payload : '');
      });
      this.unsubscribers.push(unsubscribe);
    });

    console.log('[EventTester] ✅ Logging started for', eventTypes.length, 'event types');
  }

  /**
   * Stop logging and cleanup
   */
  stopLogging(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    console.log('[EventTester] ⏹️ Logging stopped');
  }

  /**
   * Get all logged events
   */
  getLog(): typeof this.eventLog {
    return [...this.eventLog];
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(type: string): typeof this.eventLog {
    return this.eventLog.filter((e) => e.type === type);
  }

  /**
   * Print summary of events
   */
  printSummary(): void {
    console.log('\n=== Event Log Summary ===');
    console.log(`Total Events: ${this.eventLog.length}`);

    const grouped = this.eventLog.reduce(
      (acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.table(grouped);
  }

  /**
   * Clear the log
   */
  clearLog(): void {
    this.eventLog = [];
    console.log('[EventTester] 🗑️ Log cleared');
  }

  /**
   * Test model loading flow
   */
  async testModelLoad(file: File, modelService: any): Promise<void> {
    console.log('\n=== Testing Model Load Flow ===');
    this.clearLog();

    try {
      await modelService.loadModel(file);
      console.log('✅ Model load completed');
      this.printSummary();
    } catch (error) {
      console.error('❌ Model load failed:', error);
      this.printSummary();
    }
  }

  /**
   * Test section selection flow
   */
  testSectionSelect(sectionId: string, modelService: any): void {
    console.log('\n=== Testing Section Selection ===');
    const beforeCount = this.eventLog.length;

    modelService.selectSection(sectionId);

    const newEvents = this.eventLog.slice(beforeCount);
    console.log('Events published:', newEvents.length);
    newEvents.forEach((e) => console.log('  -', e.type));
  }

  /**
   * Test disassembly flow
   */
  testDisassembly(model: any, operationsService: any): void {
    console.log('\n=== Testing Disassembly Flow ===');
    const beforeCount = this.eventLog.length;

    operationsService.disassemble(model);

    const newEvents = this.eventLog.slice(beforeCount);
    console.log('Events published:', newEvents.length);
    newEvents.forEach((e) => console.log('  -', e.type));
  }

  /**
   * Verify event system health
   */
  verifyEventSystem(): void {
    console.log('\n=== Event System Health Check ===');

    const diagnostics = this.eventBus.getDiagnostics?.();
    if (diagnostics) {
      console.log('📊 Event Bus Diagnostics:');
      console.log('  Handler Count:', diagnostics.handlerCount);
      console.log('  Event Types:', diagnostics.eventTypes.length);
      console.log('  History Size:', diagnostics.historySize);
      console.log('  Is Processing:', diagnostics.isProcessing);
      console.log('  Queue Size:', diagnostics.queueSize);
      console.log('\n  Registered Event Types:');
      diagnostics.eventTypes.forEach((type: string) => console.log('    -', type));
    } else {
      console.warn('⚠️ getDiagnostics() not available');
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
  (window as any).ModelEventTester = ModelEventTester;
  console.log(
    '💡 ModelEventTester available globally. Use: new ModelEventTester(window.app.eventBus)'
  );
}
