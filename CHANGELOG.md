# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-12-15

### Added
- Complete clean architecture implementation with clear layer separation
- Domain layer with models, interfaces, and events
- Application layer with services for model, view, and operations management
- Infrastructure layer with format-specific loaders (glTF, OBJ, STL, STEP placeholder)
- Presentation layer with reusable UI components and controllers
- Comprehensive event bus system for centralized event management
- Three.js-based renderer with camera controls and visual effects
- Professional, minimal UI with responsive design
- Section tree navigation with expand/collapse functionality
- Properties panel for section details
- Loading overlay with spinner
- Status bar with model information
- View controls (zoom, reset, fit, fullscreen)
- Display options (wireframe, grid, axes)
- Model operations (disassemble, reassemble)
- TypeScript strict mode throughout
- ESLint and Prettier configuration
- Vite build system with HMR
- Comprehensive documentation (README, ARCHITECTURE, CONTRIBUTING, DEVELOPMENT)

### Changed
- Rebuilt entire application from ground up
- Replaced legacy architecture with clean architecture
- Improved type safety with strict TypeScript
- Enhanced error handling and event propagation
- Better separation of concerns across all layers

### Technical Details
- SOLID principles implementation
- DRY (Don't Repeat Yourself) throughout
- Event-driven architecture
- Dependency injection
- Interface-based design
- Modular, testable components
- Industry-standard 3D format support
- Graceful error handling
- Predictable state management

## [1.0.0] - Previous Version

### Notes
- Legacy implementation (not maintained)
- Replaced by 2.0.0 complete rewrite
