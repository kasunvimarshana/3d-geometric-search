# 3D Geometric Search

A professional 3D geometric search and visualization application built with clean architecture principles, supporting industry-standard 3D file formats.

## Features

- **Industry-Standard Format Support**: glTF/GLB, STEP (ISO 10303), OBJ/MTL, STL
- **Clean Architecture**: Strict separation of concerns with domain, application, infrastructure, and presentation layers
- **Interactive Visualization**: Section navigation, highlighting, zoom, disassembly/reassembly
- **Professional UI**: Minimal, clean interface focused on usability and performance
- **Robust Event Handling**: Centralized, predictable event management
- **Type-Safe**: Built with TypeScript for maximum reliability

## Architecture

```
src/
├── domain/           # Core business logic and entities
│   ├── models/       # Domain models
│   ├── interfaces/   # Contracts and abstractions
│   └── events/       # Domain events
├── application/      # Application services and use cases
│   ├── services/     # Business logic orchestration
│   └── usecases/     # Specific application operations
├── infrastructure/   # External concerns (3D loaders, parsers)
│   ├── loaders/      # 3D format loaders
│   ├── parsers/      # Format-specific parsers
│   └── adapters/     # External library adapters
└── presentation/     # UI components and view logic
    ├── components/   # UI components
    ├── controllers/  # View controllers
    └── styles/       # CSS styles
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Supported Formats

- **glTF/GLB** (preferred): Modern, web-optimized format for real-time rendering
- **STEP** (.stp, .step): CAD format (AP203, AP214, AP242)
- **OBJ/MTL**: Geometry and material definitions
- **STL**: 3D printing and manufacturing

## Usage

1. Click "Load Model" to select a 3D file
2. Navigate the model structure in the sidebar
3. Select sections to highlight and focus
4. Use view controls to zoom, rotate, and fit the view
5. Try disassemble/reassemble operations for complex models

## Design Principles

- **SOLID**: Single responsibility, open/closed, dependency inversion
- **DRY**: No code duplication, reusable components
- **Clean Code**: Readable, maintainable, self-documenting
- **Separation of Concerns**: Clear boundaries between layers
- **Event-Driven**: Predictable, centralized event handling

## License

MIT
