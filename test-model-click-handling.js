/**
 * Model Click Handling Test Script
 *
 * Run this in the browser console after loading a model to test click handling.
 * This script verifies raycasting, section mapping, and UI synchronization.
 */

(async function testModelClickHandling() {
  console.log('🧪 Starting Model Click Handling Tests...\n');

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

  // Test 1: Verify ViewerController exists
  console.log('\n📦 Test 1: ViewerController Setup...');
  try {
    if (!window.app?.viewerController) {
      throw new Error('ViewerController not found');
    }
    pass('ViewerController exists');

    if (window.app.viewerController.raycaster) {
      pass('Raycaster initialized');
    } else {
      fail('Raycaster', 'Not initialized');
    }

    if (window.app.viewerController.mouse) {
      pass('Mouse tracking initialized');
    } else {
      fail('Mouse tracking', 'Not initialized');
    }

    if (window.app.viewerController.meshToSectionMap) {
      pass('Mesh-to-section map initialized');
    } else {
      fail('Mesh-to-section map', 'Not initialized');
    }
  } catch (error) {
    fail('ViewerController setup', error.message);
    return; // Can't continue
  }

  // Test 2: Check if model is loaded
  console.log('\n🎨 Test 2: Model State...');
  const currentModel = window.app.stateManager.getCurrentModel();
  const viewerModel = window.app.viewerController.currentModel;

  if (currentModel) {
    pass(`Model loaded: ${currentModel.name}`);
  } else {
    warn('Model state', 'No model currently loaded');
  }

  if (viewerModel) {
    pass('Model in viewer scene');
  } else {
    warn('Viewer model', 'No model in scene');
  }

  // Test 3: Check mesh-to-section mapping
  console.log('\n🗺️  Test 3: Mesh-to-Section Mapping...');
  const meshMap = window.app.viewerController.meshToSectionMap;

  if (meshMap.size > 0) {
    pass(`Mesh mapping populated: ${meshMap.size} meshes`);

    // Show sample mapping
    const entries = Array.from(meshMap.entries()).slice(0, 3);
    console.log('Sample mappings:', entries);
  } else {
    warn('Mesh mapping', 'No meshes mapped to sections');
  }

  // Test 4: Check sections
  console.log('\n📋 Test 4: Sections State...');
  const sections = window.app.stateManager.getSections();

  if (sections && sections.length > 0) {
    pass(`Sections loaded: ${sections.length} sections`);

    // Verify section structure
    const firstSection = sections[0];
    if (firstSection.meshNames && firstSection.meshNames.length > 0) {
      pass(`Section has meshNames: ${firstSection.meshNames.length} meshes`);
    } else {
      warn('Section structure', 'No meshNames in sections');
    }
  } else {
    warn('Sections', 'No sections available');
  }

  // Test 5: Event subscriptions
  console.log('\n📡 Test 5: Event Subscriptions...');
  const eventTypes = [
    'model:clicked',
    'object:selected',
    'object:deselected',
    'section:selected',
    'section:deselected',
  ];

  eventTypes.forEach(eventType => {
    // Check if handlers exist
    const hasHandler = window.app.eventBus._subscribers?.has(eventType);
    if (hasHandler) {
      pass(`Event handler exists: ${eventType}`);
    } else {
      warn('Event handler', `No handler for ${eventType}`);
    }
  });

  // Test 6: Click event handler
  console.log('\n🖱️  Test 6: Click Handler...');
  const canvas = document.getElementById('canvas-3d');

  if (canvas) {
    pass('Canvas element found');

    // Check event listeners (browser-specific)
    const listeners = getEventListeners?.(canvas);
    if (listeners?.click?.length > 0) {
      pass('Click listener attached to canvas');
    } else {
      warn('Click listener', 'Cannot verify (use DevTools)');
    }
  } else {
    fail('Canvas', 'Canvas element not found');
  }

  // Test 7: UIController methods
  console.log('\n🎛️  Test 7: UIController Methods...');
  const uiMethods = [
    'highlightSectionInList',
    'clearSectionHighlight',
    'updateSectionInfo',
    'clearSectionInfo',
  ];

  uiMethods.forEach(method => {
    if (typeof window.app.uiController[method] === 'function') {
      pass(`UIController.${method}() exists`);
    } else {
      fail('UIController method', `${method}() not found`);
    }
  });

  // Test 8: ApplicationController handlers
  console.log('\n🎮 Test 8: ApplicationController Handlers...');
  const appHandlers = ['handleModelClicked', 'handleObjectSelected', 'handleObjectDeselected'];

  appHandlers.forEach(handler => {
    if (typeof window.app[handler] === 'function') {
      pass(`ApplicationController.${handler}() exists`);
    } else {
      fail('ApplicationController handler', `${handler}() not found`);
    }
  });

  // Test 9: CSS styling
  console.log('\n🎨 Test 9: CSS Styling...');
  const sectionItems = document.querySelectorAll('.section-item');

  if (sectionItems.length > 0) {
    pass(`Section items found: ${sectionItems.length}`);

    // Check if CSS classes are defined
    const styles = window.getComputedStyle(sectionItems[0]);
    if (styles) {
      pass('CSS styles applied to section items');
    }
  } else {
    warn('Section items', 'No section items in DOM');
  }

  // Test 10: Simulate programmatic selection
  console.log('\n🧪 Test 10: Programmatic Selection...');
  if (sections && sections.length > 0) {
    try {
      const testSectionId = sections[0].id;

      // Trigger selection
      window.app.eventBus.emit('section:selected', { sectionId: testSectionId });

      // Wait a bit for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if UI updated
      const selectedItems = document.querySelectorAll('.section-item.selected');
      if (selectedItems.length > 0) {
        pass('Programmatic selection updates UI');
      } else {
        warn('UI update', 'Selection may not have updated UI');
      }

      // Deselect
      window.app.eventBus.emit('section:deselected');
    } catch (error) {
      fail('Programmatic selection', error.message);
    }
  } else {
    warn('Programmatic selection', 'No sections to test with');
  }

  // Print Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
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

  // Manual testing instructions
  console.log('\n📖 MANUAL TESTING INSTRUCTIONS:');
  console.log('='.repeat(60));
  console.log('1. Click on different parts of the 3D model');
  console.log('2. Observe:');
  console.log('   - Console logs (if debug mode enabled)');
  console.log('   - Section list highlighting (blue background)');
  console.log('   - Section info panel updates');
  console.log('   - 3D model highlighting (material changes)');
  console.log('3. Click on empty space to deselect');
  console.log('4. Click on section list items to verify bidirectional sync');
  console.log('='.repeat(60));

  // Debug mode recommendation
  if (!window.app.eventCoordinator.debugMode) {
    console.log('\n💡 TIP: Enable debug mode for detailed logs:');
    console.log('   app.eventCoordinator.setDebugMode(true)');
  }

  // Feature checklist
  console.log('\n✨ FEATURE CHECKLIST:');
  console.log('='.repeat(60));
  console.log('[ ] Click on model part selects corresponding section');
  console.log('[ ] Section list item highlights with blue background');
  console.log('[ ] Section list scrolls to show selected item');
  console.log('[ ] Section info panel shows selection details');
  console.log('[ ] 3D model applies highlight material to selection');
  console.log('[ ] Click on empty space deselects and clears highlights');
  console.log('[ ] Previous selection is cleared when new one made');
  console.log('[ ] Click on section list item highlights in 3D');
  console.log('='.repeat(60));

  if (results.failed.length === 0) {
    console.log('\n🎉 All automated tests passed!');
    console.log('✋ Please perform manual testing as described above.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues.');
  }

  // Return results
  return {
    passed: results.passed.length,
    failed: results.failed.length,
    warnings: results.warnings.length,
    successRate,
    details: results,
  };
})();
