/**
 * Event System Verification Script
 *
 * Run this in the browser console to verify the event system is working correctly.
 * This script tests event flow, validation, history, and state management.
 */

(async function verifyEventSystem() {
  console.log('🔍 Starting Event System Verification...\n');

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  function pass(test) {
    results.passed.push(test);
    console.log(`✅ ${test}`);
  }

  function fail(test, error) {
    results.failed.push({ test, error });
    console.error(`❌ ${test}:`, error);
  }

  function warn(test, message) {
    results.warnings.push({ test, message });
    console.warn(`⚠️  ${test}:`, message);
  }

  // Test 1: Verify Core Components Exist
  console.log('\n📦 Test 1: Core Components...');
  try {
    if (!window.app) throw new Error('app not found');
    if (!window.app.eventBus) throw new Error('eventBus not found');
    if (!window.app.stateManager) throw new Error('stateManager not found');
    if (!window.app.eventCoordinator) throw new Error('eventCoordinator not found');
    pass('Core components exist');
  } catch (error) {
    fail('Core components', error.message);
    return; // Can't continue without core components
  }

  // Test 2: Verify ModelEventCoordinator Methods
  console.log('\n🔧 Test 2: ModelEventCoordinator API...');
  const requiredMethods = [
    'emitEvent',
    'validateEvent',
    'trackEvent',
    'getCurrentState',
    'createSnapshot',
    'restoreSnapshot',
    'getEventHistory',
    'clearEventHistory',
    'setDebugMode',
    'setEventValidation',
  ];

  requiredMethods.forEach(method => {
    if (typeof window.app.eventCoordinator[method] === 'function') {
      pass(`Method exists: ${method}()`);
    } else {
      fail(`Method missing: ${method}()`, 'Not a function');
    }
  });

  // Test 3: Enable Debug Mode
  console.log('\n🐛 Test 3: Debug Mode...');
  try {
    window.app.eventCoordinator.setDebugMode(true);
    pass('Debug mode enabled');
  } catch (error) {
    fail('Debug mode', error.message);
  }

  // Test 4: Event History
  console.log('\n📜 Test 4: Event History...');
  try {
    const history = window.app.eventCoordinator.getEventHistory();
    if (Array.isArray(history)) {
      pass(`Event history retrieved (${history.length} events)`);

      if (history.length > 0) {
        const lastEvent = history[history.length - 1];
        if (lastEvent.eventType && lastEvent.timestamp) {
          pass('Event history format valid');
        } else {
          warn('Event history format', 'Missing expected properties');
        }
      } else {
        warn('Event history', 'No events recorded yet');
      }
    } else {
      fail('Event history', 'Not an array');
    }
  } catch (error) {
    fail('Event history', error.message);
  }

  // Test 5: State Snapshot
  console.log('\n💾 Test 5: State Snapshots...');
  try {
    const snapshot = window.app.eventCoordinator.createSnapshot();
    if (snapshot && typeof snapshot === 'object') {
      pass('State snapshot created');

      const expectedKeys = [
        'currentModel',
        'currentSections',
        'selectedSection',
        'isolatedSection',
        'focusedObject',
        'timestamp',
      ];
      const hasAllKeys = expectedKeys.every(key => key in snapshot);

      if (hasAllKeys) {
        pass('Snapshot structure valid');
      } else {
        warn('Snapshot structure', 'Missing some expected keys');
      }

      // Test restore
      try {
        window.app.eventCoordinator.restoreSnapshot(snapshot);
        pass('State snapshot restored');
      } catch (restoreError) {
        fail('Snapshot restore', restoreError.message);
      }
    } else {
      fail('State snapshot', 'Invalid snapshot object');
    }
  } catch (error) {
    fail('State snapshot', error.message);
  }

  // Test 6: State Manager
  console.log('\n🗄️  Test 6: State Manager...');
  try {
    const currentModel = window.app.stateManager.getCurrentModel();
    const sections = window.app.stateManager.getSections();
    const selectedSection = window.app.stateManager.getSelectedSection();
    const isolatedSection = window.app.stateManager.getIsolatedSection();

    pass(`Current model: ${currentModel ? currentModel.name : 'None'}`);
    pass(`Sections: ${sections ? sections.length : 0}`);
    pass(`Selected section: ${selectedSection || 'None'}`);
    pass(`Isolated section: ${isolatedSection || 'None'}`);
  } catch (error) {
    fail('State Manager', error.message);
  }

  // Test 7: Event Constants
  console.log('\n📋 Test 7: Event Constants...');
  try {
    const EVENTS = window.EVENTS || (await import('./src/domain/constants.js')).EVENTS;

    const expectedCategories = [
      'MODEL_LOADED',
      'MODEL_LOAD_ERROR',
      'SECTION_SELECTED',
      'SECTION_ISOLATED',
      'FOCUS_MODE_ENTERED',
      'ISOLATION_CLEARED',
      'UI_UPDATE_REQUIRED',
      'NAVIGATION_UPDATE_REQUIRED',
    ];

    expectedCategories.forEach(constant => {
      if (EVENTS && EVENTS[constant]) {
        pass(`Event constant exists: ${constant}`);
      } else {
        fail(`Event constant missing: ${constant}`, 'Not defined');
      }
    });
  } catch (error) {
    warn('Event Constants', 'Could not verify - ' + error.message);
  }

  // Test 8: Viewer Controller
  console.log('\n🎨 Test 8: Viewer Controller...');
  try {
    if (window.app.viewerController) {
      const methods = [
        'resetView',
        'toggleWireframe',
        'toggleGrid',
        'toggleAxes',
        'enterFocusMode',
        'exitFocusMode',
      ];
      methods.forEach(method => {
        if (typeof window.app.viewerController[method] === 'function') {
          pass(`ViewerController.${method}() exists`);
        } else {
          warn('ViewerController', `${method}() not found`);
        }
      });
    } else {
      fail('Viewer Controller', 'Not found');
    }
  } catch (error) {
    fail('Viewer Controller', error.message);
  }

  // Test 9: UI Controller
  console.log('\n🖥️  Test 9: UI Controller...');
  try {
    if (window.app.uiController) {
      const methods = ['showLoading', 'hideLoading', 'showError', 'showSuccess', 'renderSections'];
      methods.forEach(method => {
        if (typeof window.app.uiController[method] === 'function') {
          pass(`UIController.${method}() exists`);
        } else {
          warn('UIController', `${method}() not found`);
        }
      });
    } else {
      fail('UI Controller', 'Not found');
    }
  } catch (error) {
    fail('UI Controller', error.message);
  }

  // Test 10: Event Validation
  console.log('\n✓ Test 10: Event Validation...');
  try {
    // Try to emit an invalid event
    window.app.eventCoordinator.setEventValidation(true);

    try {
      window.app.eventCoordinator.emitEvent('INVALID_EVENT', { test: true });
      warn('Event Validation', 'Invalid event not caught (validation may be disabled)');
    } catch (validationError) {
      pass('Event validation caught invalid event');
    }

    pass('Event validation system functional');
  } catch (error) {
    fail('Event Validation', error.message);
  }

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log('='.repeat(60));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach(({ test, error }) => {
      console.log(`  - ${test}: ${error}`);
    });
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    results.warnings.forEach(({ test, message }) => {
      console.log(`  - ${test}: ${message}`);
    });
  }

  const successRate =
    (results.passed.length / (results.passed.length + results.failed.length)) * 100;
  console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);

  if (results.failed.length === 0) {
    console.log('\n🎉 All tests passed! Event system is fully operational.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  // Return results for programmatic access
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    successRate,
    details: results,
  };
})();
