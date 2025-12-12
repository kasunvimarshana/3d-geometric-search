# Changelog

All notable changes to the 3D Geometric Search project will be documented in this file.

## [1.3.0] - 2025-12-13

### Added

- **Fullscreen Mode**

  - Toggle fullscreen with dedicated button (⛶)
  - Keyboard shortcut (F key) for quick access
  - Cross-browser support (Chrome, Firefox, Safari, Edge)
  - Adaptive UI positioning in fullscreen mode
  - Semi-transparent overlays for controls in fullscreen
  - Automatic resize handling on fullscreen change

- **Keyboard Shortcuts System**

  - Comprehensive keyboard shortcuts for all major functions
  - Interactive help modal with shortcut reference (⌨️ button)
  - F - Toggle fullscreen
  - R - Reset view
  - G - Toggle grid
  - A - Toggle axes
  - W - Toggle wireframe
  - S - Toggle shadows
  - +/= - Zoom in
  - - - Zoom out
  - 0 - Fit to view
  - Space - Toggle auto-rotate
  - Escape - Close modal
  - Visual kbd tags for shortcuts display

- **Enhanced Click Handlers**

  - Double-click viewer to focus on model
  - Click outside modal to close
  - Improved button state management
  - Active state indicators for toggleable buttons
  - Fullscreen button active state tracking

- **Keyboard Help Modal**
  - Beautiful modal design with grid layout
  - Organized shortcuts by category
  - View Controls, Zoom Controls, Display Options, Mouse Controls
  - Gradient-styled kbd elements
  - Smooth open/close animations
  - Backdrop blur effect

### Enhanced

- **Viewer3D Class**

  - Added `toggleFullscreen()` - Cross-browser fullscreen toggle
  - Added `isFullscreenActive()` - Check fullscreen state
  - Added `onFullscreenChange()` - Handle fullscreen events
  - Added `handleKeyboard(event)` - Process keyboard shortcuts
  - Enhanced `init()` with fullscreen event listeners
  - Added double-click handler for quick focus
  - Improved state management for fullscreen mode

- **App Class**

  - Added `showKeyboardHelp()` - Display shortcuts modal
  - Added `hideKeyboardHelp()` - Close shortcuts modal
  - Integrated keyboard event handlers
  - Enhanced button state synchronization
  - Improved fullscreen button visual feedback
  - Added Escape key handling for modal

- **Styling**
  - Added complete modal styling system
  - Fullscreen-specific CSS rules
  - Adaptive control positioning in fullscreen
  - Enhanced kbd element styling with gradients
  - Smooth animations for modal open/close
  - Backdrop blur effects for overlays
  - Responsive grid layout for shortcuts

### Changed

- Controls now respond to both mouse clicks and keyboard shortcuts
- Fullscreen mode hides external UI and adapts viewer controls
- Modal system prevents body scroll when open
- Keyboard shortcuts only active when not typing in inputs

### Improved

- User interaction is more intuitive with multiple input methods
- Fullscreen experience is immersive and well-designed
- Keyboard shortcuts significantly improve workflow efficiency
- Visual feedback for all interactive elements
- Accessibility with keyboard-only navigation support

## [1.2.0] - 2025-12-13

### Added

- **Enhanced Zoom and Scaling Controls**

  - Zoom in/out buttons for precise camera control
  - Zoom level indicator showing real-time zoom percentage (0-100%)
  - Fit-to-view button to automatically frame models
  - Model scaling slider (0.1x to 3x)
  - Real-time zoom level updates during camera movements

- **Camera Preset Views**

  - Quick camera positioning for 6 standard views
  - Front, back, left, right, top, and bottom presets
  - Maintains proper camera up-vector for each view
  - One-click access to standard engineering views

- **Auto-Rotation Features**

  - Toggle auto-rotation with dedicated button
  - Adjustable rotation speed (0.5 to 5.0)
  - Visual indicator when auto-rotation is active
  - Smooth rotation using OrbitControls

- **Focus and Framing Tools**

  - Focus on Model button to center view on current model
  - Automatic camera distance calculation
  - Bounding box-based framing
  - Smart camera positioning

- **Enhanced UI Organization**
  - Reorganized viewer controls into logical groups
  - Inline control groups for related buttons
  - Camera presets bar with labeled view buttons
  - Model controls section in advanced panel
  - Improved visual hierarchy

### Enhanced

- **Viewer3D Class**

  - Added `zoomIn()`, `zoomOut()`, `resetZoom()` methods
  - Added `getZoomLevel()` for real-time zoom tracking
  - Added `fitToView()` for automatic framing
  - Added `setCameraView(view)` for preset camera positions
  - Added `toggleAutoRotate()` and `setAutoRotateSpeed()`
  - Added `scaleModel(scale)` for dynamic model scaling
  - Added `focusOnModel()` to center camera on current model
  - Enhanced OrbitControls with auto-rotate support
  - Improved camera positioning algorithms

- **App Class**

  - Added `updateZoomIndicator()` method
  - Integrated zoom controls event listeners
  - Added camera preset button handlers
  - Implemented model scaling controls
  - Added auto-rotate toggle with visual feedback
  - Connected focus button to viewer methods
  - Enhanced controls change listener for zoom updates

- **Configuration**

  - Added zoom-related settings (min/max distance, speed)
  - Added auto-rotation speed configuration
  - Added model scale limits (min/max/default)
  - Updated viewer configuration with new parameters

- **Styling**
  - Added `.control-group-inline` for button grouping
  - Styled `.camera-presets` bar with responsive layout
  - Created `.btn-preset` style for view buttons
  - Added `.zoom-indicator` overlay styling
  - Enhanced button hover and active states
  - Improved responsive design for controls

### Changed

- Reorganized viewer control layout for better usability
- Improved control button grouping and spacing
- Enhanced visual feedback for interactive elements
- Updated advanced controls panel with model section

### Improved

- Camera interaction is now more intuitive with presets
- Zoom control provides precise view adjustment
- Model scaling allows better detail inspection
- Auto-rotation enables hands-free model viewing
- Focus feature quickly centers attention on models

## [1.1.0] - 2025-12-13

### Added

- **Advanced Viewer Controls**

  - Grid toggle button for showing/hiding grid helper
  - Axes toggle button for coordinate system visualization
  - Shadow toggle for enabling/disabling shadow rendering
  - Screenshot capture functionality
  - Settings panel with advanced lighting controls
  - Background color picker
  - Ambient light intensity slider
  - Directional light intensity slider

- **Export Manager Module** (`js/exportManager.js`)

  - Export models to glTF/GLB format
  - Export models to OBJ format
  - Export models to STL format (ASCII/binary)
  - Export geometry analysis data as JSON or CSV
  - Batch analysis export for all models
  - Similarity results export
  - HTML report generation with thumbnails
  - Screenshot export with custom dimensions

- **Configuration Module** (`js/config.js`)

  - Centralized configuration management
  - Viewer settings (camera, background, shadows)
  - Lighting configuration (ambient, directional, hemisphere, spotlight)
  - Model loader settings
  - Geometry analysis parameters
  - UI preferences
  - Export settings
  - Performance options
  - Debug settings
  - Color scheme definitions
  - Config getter/setter utilities
  - Configuration validation

- **Utilities Module** (`js/utils.js`)

  - File validation functions (type and size)
  - File size formatting
  - Number formatting with locale
  - Debounce and throttle functions
  - Unique ID generation
  - Deep clone utility
  - Toast notification system
  - File download helpers
  - Clipboard copy functionality
  - Vector formatting
  - Math utilities (clamp, lerp)
  - Query string parser
  - Safe JSON parser
  - Element creation helper

- **UI Enhancements**

  - Empty state display when library is empty
  - Section headers with action buttons
  - Export all data button
  - Generate HTML report button
  - Clear library button
  - Export similarity results button
  - Advanced controls panel (collapsible)
  - Toast notifications for user feedback
  - Additional model info display (volume)
  - Action buttons styling

- **Documentation**
  - Comprehensive developer documentation (DEVELOPER.md)
  - Architecture overview
  - Module documentation
  - API reference
  - Data flow diagrams
  - Configuration guide
  - Performance considerations
  - Error handling guide
  - Browser compatibility info
  - Future enhancements roadmap
  - Development guidelines
  - Troubleshooting section

### Enhanced

- **Viewer3D Class**

  - Shadow mapping support with configurable shadow map size
  - Multiple lighting options (ambient, directional, hemisphere, spotlight)
  - Configurable camera parameters from Config
  - Enable/disable shadows dynamically
  - Preserve drawing buffer for screenshots
  - Grid and axes helper management
  - Enhanced light intensity controls
  - Background color customization

- **App Class**

  - Integration with ExportManager
  - Integration with utility functions
  - File validation before loading
  - Better error handling with toast notifications
  - Success feedback for all operations
  - Library management (clear all function)
  - Similarity results tracking
  - Advanced controls toggle
  - Empty state management

- **Model Info Display**

  - Added volume display
  - Better formatting with locale support
  - Responsive flex layout
  - Additional metadata display

- **Library Section**

  - Action buttons for bulk operations
  - Better empty state with helpful messaging
  - Visual feedback for operations
  - Improved card layout

- **CSS Styling**
  - Added styles for new buttons (btn-secondary)
  - Advanced controls panel styling
  - Toast notification styles (success, error, warning, info)
  - Section header styling
  - Empty state styling
  - Better responsive design
  - Animation for advanced controls
  - Improved button hover effects

### Changed

- Model library now stores additional metadata (fileSize)
- Viewer initialization uses Config module for all settings
- Event listeners provide user feedback via toasts
- Library grid updates empty state automatically
- Delete confirmation now shows toast after deletion

### Improved

- **Code Organization**

  - Modular architecture with clear separation of concerns
  - Centralized configuration management
  - Reusable utility functions
  - Better error handling throughout
  - Consistent code style

- **Maintainability**

  - Comprehensive inline documentation
  - JSDoc comments for all major functions
  - Clear variable and function naming
  - Configuration-driven behavior
  - Easy to extend and modify

- **User Experience**

  - Immediate feedback for all actions
  - Clear error messages
  - Helpful empty states
  - Intuitive controls
  - Better visual hierarchy

- **Performance**
  - Configurable performance settings
  - Optimized rendering pipeline
  - Efficient event handling (debounce/throttle available)
  - Screenshot with preserved buffer

### Fixed

- Enhanced error handling for file loading
- Better validation of file types
- Improved model cleanup on deletion
- Fixed viewer controls layout on small screens

### Developer Experience

- New configuration system for easy customization
- Utility library for common operations
- Export manager for data handling
- Comprehensive documentation
- Clear code structure

## [1.0.0] - Initial Release

### Added

- Initial release with core functionality
- 3D model viewer using Three.js
- Support for glTF/GLB, OBJ, and STL formats
- Geometric analysis engine
- Similarity search algorithm
- Model library management
- Basic export capabilities
- Responsive UI design
- Drag and drop upload

---

## Future Roadmap

### Version 1.2.0 (Planned)

- [ ] STEP file format support (via OpenCascade.js)
- [ ] Advanced analysis features (curvature, symmetry)
- [ ] Performance optimizations with Web Workers
- [ ] Model comparison view (side-by-side)
- [ ] Search filters and sorting options
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality

### Version 1.3.0 (Planned)

- [ ] Cloud storage integration
- [ ] User accounts and saved projects
- [ ] Collaborative features
- [ ] AI-powered similarity search
- [ ] Automatic model categorization
- [ ] FBX and 3DS format support
- [ ] Animation support

### Version 2.0.0 (Future)

- [ ] Backend API integration
- [ ] Database for model storage
- [ ] Multi-user support
- [ ] Advanced rendering options
- [ ] VR/AR support
- [ ] Plugin system
- [ ] Custom analysis pipelines
