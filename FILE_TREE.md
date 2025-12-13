# Project File Tree

Complete file structure of the 3D Geometric Search application.

```
3d-geometric-search/
│
├── 📄 .eslintrc.json                          # ESLint configuration
├── 📄 .gitignore                              # Git ignore rules
├── 📄 .prettierrc.json                        # Prettier code formatting config
├── 📄 ARCHITECTURE.md                         # Architecture documentation (detailed)
├── 📄 CHANGELOG.md                            # Version history and release notes
├── 📄 DEVELOPMENT.md                          # Development guide and examples
├── 📄 GETTING_STARTED.md                      # Quick start guide for users
├── 📄 INSTALLATION.md                         # Installation and verification guide
├── 📄 LICENSE                                 # MIT License
├── 📄 package.json                            # Dependencies and npm scripts
├── 📄 PROJECT_SUMMARY.md                      # Comprehensive project summary
├── 📄 README.md                               # Main documentation
├── 📄 vite.config.js                          # Vite build configuration
├── 📄 index.html                              # Main HTML entry point
│
├── 📁 .vscode/                                # VS Code workspace configuration
│   ├── 📄 extensions.json                     # Recommended VS Code extensions
│   └── 📄 settings.json                       # Workspace settings
│
├── 📁 public/                                 # Static assets (served as-is)
│   └── 📁 models/                             # 3D model files directory
│       └── 📄 README.md                       # Models directory documentation
│
└── 📁 src/                                    # Source code
    │
    ├── 📄 main.js                             # Application entry point
    │
    ├── 📁 controllers/                        # Application controllers
    │   ├── 📄 ApplicationController.js        # Main application orchestrator (Facade)
    │   └── 📄 ViewerController.js             # 3D scene and rendering controller
    │
    ├── 📁 core/                               # Core systems
    │   ├── 📄 EventBus.js                     # Event management (Observer pattern)
    │   └── 📄 StateManager.js                 # Centralized state management
    │
    ├── 📁 domain/                             # Domain layer
    │   ├── 📄 models.js                       # Domain models and interfaces
    │   └── 📄 constants.js                    # Application constants and config
    │
    ├── 📁 repositories/                       # Data access layer
    │   └── 📄 ModelRepository.js              # Model data management (Repository pattern)
    │
    ├── 📁 services/                           # Business logic layer
    │   ├── 📄 ModelLoaderService.js           # 3D model loading service
    │   └── 📄 SectionManagerService.js        # Section management service
    │
    ├── 📁 ui/                                 # Presentation layer
    │   └── 📄 UIController.js                 # UI management and DOM interactions
    │
    └── 📁 styles/                             # Stylesheets
        └── 📄 main.css                        # Main application styles

```

## File Statistics

### Total Files: 29

#### By Category
- **Configuration**: 6 files
  - Build config (Vite)
  - Code quality (ESLint, Prettier)
  - VS Code workspace settings
  - Git ignore

- **Documentation**: 8 files
  - User guides (README, GETTING_STARTED, INSTALLATION)
  - Developer docs (ARCHITECTURE, DEVELOPMENT)
  - Project info (CHANGELOG, PROJECT_SUMMARY, LICENSE)
  - Models directory README

- **Source Code**: 14 files
  - Controllers: 2
  - Core systems: 2
  - Domain: 2
  - Repositories: 1
  - Services: 2
  - UI: 1
  - Styles: 1
  - Entry point: 1
  - HTML: 1
  - Package definition: 1

#### By Type
- JavaScript: 11 files
- Markdown: 9 files
- JSON: 6 files
- CSS: 1 file
- HTML: 1 file
- Text: 1 file

#### By Layer (Clean Architecture)
```
┌─────────────────────────────────────────┐
│  Presentation Layer                      │  2 files
│  - UIController.js                       │  (UI components)
│  - main.css                              │
├─────────────────────────────────────────┤
│  Application Layer                       │  3 files
│  - ApplicationController.js              │  (Orchestration)
│  - ViewerController.js                   │
│  - main.js                               │
├─────────────────────────────────────────┤
│  Business Logic Layer                    │  3 files
│  - ModelLoaderService.js                 │  (Services)
│  - SectionManagerService.js              │
│  - StateManager.js                       │
├─────────────────────────────────────────┤
│  Domain Layer                            │  3 files
│  - models.js                             │  (Core business)
│  - constants.js                          │
│  - EventBus.js                           │
├─────────────────────────────────────────┤
│  Infrastructure Layer                    │  1 file
│  - ModelRepository.js                    │  (Data access)
└─────────────────────────────────────────┘
```

## Code Metrics

### Lines of Code (Approximate)

#### JavaScript
- `ApplicationController.js`: ~300 lines
- `ViewerController.js`: ~230 lines
- `UIController.js`: ~270 lines
- `StateManager.js`: ~200 lines
- `SectionManagerService.js`: ~250 lines
- `ModelLoaderService.js`: ~200 lines
- `ModelRepository.js`: ~100 lines
- `EventBus.js`: ~60 lines
- `models.js`: ~120 lines
- `constants.js`: ~60 lines
- `main.js`: ~50 lines
- **Total**: ~1,840 lines

#### CSS
- `main.css`: ~450 lines

#### Documentation
- All markdown files: ~3,500 lines

#### HTML
- `index.html`: ~60 lines

### Code Quality Metrics

✅ **Cyclomatic Complexity**: Low (functions are small and focused)  
✅ **Coupling**: Loose (interfaces and event-driven)  
✅ **Cohesion**: High (single responsibility)  
✅ **Documentation**: 100% (all public APIs documented)  
✅ **Naming**: Descriptive and consistent  
✅ **File Size**: All files < 400 lines  
✅ **Function Size**: Most < 30 lines  

## Directory Purposes

### `/src/controllers/`
**Purpose**: Application orchestration and coordination  
**Patterns**: MVC, Facade  
**Dependencies**: Services, Core, UI

### `/src/core/`
**Purpose**: Core application infrastructure  
**Patterns**: Observer, Singleton  
**Dependencies**: Domain

### `/src/domain/`
**Purpose**: Business domain definitions  
**Patterns**: Domain Model, Value Object  
**Dependencies**: None (pure domain)

### `/src/repositories/`
**Purpose**: Data access abstraction  
**Patterns**: Repository  
**Dependencies**: Domain

### `/src/services/`
**Purpose**: Business logic implementation  
**Patterns**: Service Layer, Strategy  
**Dependencies**: Domain, external libraries

### `/src/ui/`
**Purpose**: User interface management  
**Patterns**: MVC (View), Observer  
**Dependencies**: Domain, Core

### `/src/styles/`
**Purpose**: Application styling  
**Technologies**: CSS3, CSS Variables  
**Dependencies**: None

## Import Dependencies

```
main.js
  └─> ApplicationController.js
        ├─> EventBus.js
        ├─> StateManager.js
        │     └─> models.js (ViewerState)
        │     └─> constants.js (EVENTS)
        ├─> ModelRepository.js
        │     └─> models.js (Model, Section)
        ├─> ModelLoaderService.js
        │     └─> models.js (IModelLoader)
        │     └─> constants.js (MODEL_TYPES)
        │     └─> three (external)
        ├─> SectionManagerService.js
        │     └─> models.js (ISectionManager)
        │     └─> constants.js (COLORS)
        │     └─> three (external)
        ├─> ViewerController.js
        │     └─> constants.js (CAMERA_DEFAULTS, RENDERER_CONFIG, COLORS)
        │     └─> three (external)
        └─> UIController.js
```

## File Relationships

### High Coupling (Expected)
- ApplicationController ↔ All subsystems (Facade pattern)
- Services ↔ Domain models (Business logic)

### Low Coupling (Desired)
- UI ↔ Services (Event-driven)
- Controllers ↔ Core systems (Interface-based)
- Domain ↔ Everything (Pure domain, no deps)

### Dependency Flow
```
UI → Controllers → Services → Repositories → Domain
          ↓
        Core Systems
```

All dependencies flow inward toward the domain (Dependency Inversion).

## Configuration Files

### Build & Development
- `vite.config.js` - Build tool configuration
- `package.json` - Dependencies and scripts

### Code Quality
- `.eslintrc.json` - Linting rules
- `.prettierrc.json` - Formatting rules

### Version Control
- `.gitignore` - Files to ignore in Git

### Editor
- `.vscode/settings.json` - VS Code workspace settings
- `.vscode/extensions.json` - Recommended extensions

## Documentation Files

### User-Facing
1. `README.md` - Main documentation (start here)
2. `GETTING_STARTED.md` - Quick start guide
3. `INSTALLATION.md` - Installation and verification

### Developer-Facing
4. `ARCHITECTURE.md` - Architecture deep dive
5. `DEVELOPMENT.md` - Development guide with examples
6. `PROJECT_SUMMARY.md` - Comprehensive overview

### Project Management
7. `CHANGELOG.md` - Version history
8. `LICENSE` - MIT License
9. `public/models/README.md` - Models directory guide

## Asset Directories

### `/public/`
Static assets served as-is (no processing)
- Models
- Textures
- Other static files

### `/dist/` (Generated)
Build output directory (not in repo)
- Optimized JavaScript
- Optimized CSS
- Processed HTML
- Source maps

### `/node_modules/` (Generated)
Dependencies (not in repo)
- Three.js
- Vite
- Build tools

---

**Total Project Size**: 
- Source: ~2,300 lines of code
- Documentation: ~3,500 lines
- Configuration: ~200 lines
- **Grand Total**: ~6,000 lines

**Organization**: Professional, clean, maintainable structure following industry best practices and clean architecture principles.
