# Testing Guide

## Manual Testing Checklist

### Initial Setup

- [ ] Dependencies installed (`npm install`)
- [ ] Dev server starts (`npm run dev`)
- [ ] Application loads without errors
- [ ] Upload overlay displays

### File Loading

- [ ] Drag-and-drop works
- [ ] File picker works
- [ ] Loading progress displays
- [ ] Error handling for invalid files

#### glTF/GLB Format

- [ ] Basic glTF file loads
- [ ] GLB binary file loads
- [ ] Textures display correctly
- [ ] Hierarchy parsed correctly
- [ ] Materials applied

#### OBJ Format

- [ ] OBJ without MTL loads
- [ ] OBJ with MTL loads
- [ ] Materials from MTL applied
- [ ] Multiple objects handled

#### STL Format

- [ ] ASCII STL loads
- [ ] Binary STL loads
- [ ] Mesh generated correctly
- [ ] Default material applied

#### STEP Format (if implemented)

- [ ] STEP file loads
- [ ] Assembly hierarchy parsed
- [ ] CAD geometry converted
- [ ] PMI data extracted

### Viewport Interactions

- [ ] Left-click drag rotates view
- [ ] Right-click drag pans view
- [ ] Scroll wheel zooms
- [ ] Touch gestures work (mobile)
- [ ] Smooth animation

### Section Selection

- [ ] Click selects section
- [ ] Selected section highlights
- [ ] Multiple selection works (Ctrl+Click)
- [ ] Selection syncs with hierarchy
- [ ] Properties panel updates

### Section Highlighting

- [ ] Hover highlights section
- [ ] Highlight color distinct
- [ ] Highlight removed on mouse out
- [ ] No performance issues

### Section Focus

- [ ] Double-click focuses camera
- [ ] Camera animates smoothly
- [ ] Focus on small parts works
- [ ] Focus on large assemblies works

### Hierarchy Tree

- [ ] Tree renders correctly
- [ ] Expand/collapse works
- [ ] Click selects section
- [ ] Double-click focuses
- [ ] Scroll works for large hierarchies
- [ ] Search/filter (if implemented)

### Properties Panel

- [ ] Displays section properties
- [ ] Shows geometry data
- [ ] Shows material info
- [ ] Shows transform data
- [ ] Updates on selection change

### Statistics Panel

- [ ] Vertex count correct
- [ ] Face count correct
- [ ] Object count correct
- [ ] Load time displayed
- [ ] Updates on model load

### View Controls

- [ ] Reset button works
- [ ] Fit button works
- [ ] Wireframe toggle works
- [ ] Grid toggle works
- [ ] Axes toggle works
- [ ] Fullscreen toggle works

### Keyboard Shortcuts

- [ ] F - Fit to view
- [ ] R - Reset camera
- [ ] W - Wireframe
- [ ] G - Grid
- [ ] A - Axes
- [ ] ESC - Deselect

### State Management

- [ ] State updates propagate
- [ ] History works (if implemented)
- [ ] Undo/redo works (if implemented)
- [ ] State persists (if implemented)

### Event System

- [ ] Events fire correctly
- [ ] Event handlers execute
- [ ] Error events handled
- [ ] No console errors

### Performance

- [ ] Large models load
- [ ] Smooth interaction
- [ ] No memory leaks
- [ ] Frame rate acceptable (>30 FPS)

### Error Handling

- [ ] Invalid file format
- [ ] Corrupted file
- [ ] Large file warning
- [ ] Network errors (if applicable)
- [ ] User-friendly error messages

### UI/UX

- [ ] Layout responsive
- [ ] Buttons clickable
- [ ] Tooltips display
- [ ] Loading indicators work
- [ ] Panels resizable (if implemented)
- [ ] Dark/light mode (if implemented)

### Browser Compatibility

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Mobile (if supported)

- [ ] Touch gestures
- [ ] Responsive layout
- [ ] Performance acceptable

## Automated Testing

### Unit Tests (to be implemented)

```bash
npm test
```

### E2E Tests (to be implemented)

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

## Performance Testing

### Metrics to Monitor

- Initial load time
- Model load time
- Frame rate (FPS)
- Memory usage
- Time to interactive

### Tools

- Chrome DevTools Performance
- Lighthouse
- WebPageTest

## Sample Models for Testing

### Small Models

- Simple cube (< 1KB)
- Basic sphere (< 10KB)
- Simple assembly (< 100KB)

### Medium Models

- Chair model (< 1MB)
- Engine part (< 5MB)
- Building section (< 10MB)

### Large Models

- Full assembly (> 10MB)
- Complex CAD model (> 50MB)
- Entire building (> 100MB)

## Common Issues

### Model Not Loading

- Check file format
- Check file size
- Check browser console
- Verify file is valid

### Performance Issues

- Check model complexity
- Check polygon count
- Monitor FPS
- Check memory usage

### UI Not Updating

- Check event flow
- Check state updates
- Check subscriptions
- Check console for errors

## Reporting Issues

When reporting issues, include:

1. Browser and version
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Console errors
6. Sample file (if applicable)
