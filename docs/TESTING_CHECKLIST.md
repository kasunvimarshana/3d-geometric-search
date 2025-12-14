# Testing Checklist - 3D Geometric Search

## Event System Testing

### Model Loading Events

- [ ] Load glTF/GLB model - verify MODEL_LOAD_START → MODEL_LOADED
- [ ] Load OBJ model - verify event sequence
- [ ] Load STL model - verify event sequence
- [ ] Load invalid model - verify MODEL_LOAD_ERROR
- [ ] Check event history after load: `eventCoordinator.getEventHistory()`

### Section Events

- [ ] Click section - verify SECTION_SELECTED event
- [ ] Click selected section again - verify SECTION_DESELECTED
- [ ] Isolate section - verify SECTION_ISOLATED event
- [ ] Clear isolation - verify ISOLATION_CLEARED event
- [ ] Check sections in StateManager: `stateManager.getSections()`

### Focus Mode Events

- [ ] Enter focus mode - verify FOCUS_MODE_ENTERED
- [ ] Exit focus mode (Escape) - verify FOCUS_MODE_EXITED
- [ ] Verify camera restoration

### UI Synchronization

- [ ] Model load - verify UI updates automatically
- [ ] Section selection - verify info panel updates
- [ ] Section isolation - verify section list updates
- [ ] Error scenario - verify error message displays

## Feature Testing

### Model Loading

- [ ] Load from URL
- [ ] Load from file upload
- [ ] Load glTF model
- [ ] Load GLB model
- [ ] Load OBJ model
- [ ] Load STL model
- [ ] Handle load error gracefully

### Navigation

- [ ] Orbit camera (left-click drag)
- [ ] Pan camera (right-click drag)
- [ ] Zoom camera (scroll wheel)
- [ ] Reset view (R key or button)
- [ ] Frame object (F key)

### Camera Presets

- [ ] Front view (1 key)
- [ ] Back view (2 key)
- [ ] Left view (3 key)
- [ ] Right view (4 key)
- [ ] Top view (5 key or Shift+Up)
- [ ] Bottom view (6 key or Shift+Down)
- [ ] Isometric view (7 key)

### Section Management

- [ ] View section tree
- [ ] Search sections
- [ ] Select section
- [ ] Highlight section
- [ ] Isolate section
- [ ] Clear isolation
- [ ] Multiple selections

### Focus Mode

- [ ] Double-click section to focus
- [ ] Camera zooms to section
- [ ] Press Escape to exit
- [ ] Camera restores to previous position

### Visual Toggles

- [ ] Toggle wireframe (W key)
- [ ] Toggle grid
- [ ] Toggle axes
- [ ] Toggle fullscreen (F11)

### Export

- [ ] Export as glTF
- [ ] Export as GLB
- [ ] Export as OBJ
- [ ] Export as STL
- [ ] Verify exported file downloads

### Keyboard Shortcuts

- [ ] R - Reset view
- [ ] F - Frame object
- [ ] W - Toggle wireframe
- [ ] H - Toggle help
- [ ] 1-7 - Camera presets
- [ ] Shift+Arrows - Camera views
- [ ] Escape - Exit focus mode
- [ ] F11 - Toggle fullscreen
- [ ] F5 - Refresh view
- [ ] Ctrl+E - Export model
- [ ] Ctrl+/ - Focus search

### State Management

- [ ] Current model stored correctly
- [ ] Sections stored as Map
- [ ] Selected section tracked
- [ ] Isolated section tracked
- [ ] State persists across operations

## Performance Testing

### Rendering

- [ ] Smooth 60fps rendering
- [ ] No frame drops during rotation
- [ ] Efficient shadow rendering
- [ ] Proper anti-aliasing

### Memory

- [ ] No memory leaks on model load/unload
- [ ] Event history doesn't grow unbounded
- [ ] Proper cleanup on dispose

### Large Models

- [ ] Load model with 100+ sections
- [ ] Navigate large section tree
- [ ] Search within large model
- [ ] Isolate sections in large model

## Error Handling

### Network Errors

- [ ] Invalid URL - shows error message
- [ ] Network timeout - shows error message
- [ ] 404 model not found - shows error message

### File Errors

- [ ] Invalid file type - shows error message
- [ ] Corrupted file - shows error message
- [ ] Empty file - shows error message

### User Errors

- [ ] No model loaded - controls disabled appropriately
- [ ] Invalid search - handles gracefully
- [ ] Double isolation - handles correctly

## Browser Compatibility

### Desktop Browsers

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

### Screen Sizes

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Small screen (1280x720)

### WebGL Support

- [ ] WebGL 1.0 minimum
- [ ] WebGL 2.0 preferred
- [ ] Fallback message if unsupported

## Debug Mode Testing

### Enable Debug Mode

```javascript
// In browser console:
this.eventCoordinator.setDebugMode(true);
```

### Verify Debug Logging

- [ ] All events logged to console
- [ ] Event data visible
- [ ] Validation results shown
- [ ] State transitions logged

### Event History

```javascript
// View event history:
this.eventCoordinator.getEventHistory();

// Filter events:
this.eventCoordinator.getEventHistory({ eventType: 'model:loaded' });
this.eventCoordinator.getEventHistory({ limit: 10 });
```

### State Snapshots

```javascript
// Create snapshot:
const snapshot = this.eventCoordinator.createSnapshot();

// Restore snapshot:
this.eventCoordinator.restoreSnapshot(snapshot);
```

## Accessibility Testing

### Keyboard Navigation

- [ ] All features accessible via keyboard
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] Shortcuts documented

### Screen Readers

- [ ] Buttons have aria-labels
- [ ] Sections have descriptive names
- [ ] Error messages announced

## Documentation Testing

### User Documentation

- [ ] README clear and concise
- [ ] FEATURE_GUIDE covers all features
- [ ] MULTI_FORMAT_SUPPORT accurate
- [ ] STEP_FORMAT_GUIDE helpful

### Developer Documentation

- [ ] ARCHITECTURE.md explains structure
- [ ] EVENT_ARCHITECTURE.md comprehensive
- [ ] Code comments clear
- [ ] API references accurate

## Regression Testing

### After Changes

- [ ] Re-run all feature tests
- [ ] Check for console errors
- [ ] Verify event flow still works
- [ ] Test error scenarios

## Production Checklist

### Before Deployment

- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation up-to-date
- [ ] Build succeeds
- [ ] Source maps generated
- [ ] Environment variables configured

### Post-Deployment

- [ ] Production build loads
- [ ] All features work in production
- [ ] Error tracking enabled
- [ ] Analytics configured (if applicable)

---

## How to Use This Checklist

1. **Run through systematically**: Test each section in order
2. **Document failures**: Note any issues found
3. **Re-test after fixes**: Verify fixes don't break other features
4. **Keep updated**: Add new tests as features added

## Quick Test Script

```javascript
// Run in browser console for quick verification
(async function quickTest() {
  console.log('🧪 Starting Quick Test...');

  // Enable debug mode
  this.eventCoordinator.setDebugMode(true);

  // Test event history
  console.log('Event History:', this.eventCoordinator.getEventHistory({ limit: 5 }));

  // Test state
  console.log('Current Model:', this.stateManager.getCurrentModel());
  console.log('Sections:', this.stateManager.getSections().length);

  // Test snapshot
  const snapshot = this.eventCoordinator.createSnapshot();
  console.log('State Snapshot:', snapshot);

  console.log('✅ Quick Test Complete!');
})();
```

---

**Last Updated:** December 14, 2025  
**Version:** 2.0.0+
