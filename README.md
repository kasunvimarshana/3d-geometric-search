# 3D Geometric Search & Viewer

A professional 3D geometric search and model viewer application with industry-standard format support.

## Features

- **Industry-Standard Format Support**: glTF/GLB (preferred), STEP (ISO 10303), OBJ/MTL, STL
- **Section Management**: Navigate, isolate, and highlight model sections
- **Interactive Viewer**: Zoom, pan, rotate, full-screen mode
- **Dynamic Model Updates**: Disassembly and reassembly with synchronized state
- **Clean Architecture**: SOLID principles, separation of concerns, modular design
- **Robust Event System**: Centralized event orchestration with proper validation
- **Professional UI**: Minimal, consistent, performance-focused interface

## Architecture

```
src/
├── core/           # Core domain logic
├── domain/         # Domain models and interfaces
├── infrastructure/ # File loaders, parsers, external integrations
├── ui/             # UI components
├── utils/          # Shared utilities
└── main.ts         # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

## Design Principles

- **SOLID Principles**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **DRY**: Don't repeat yourself
- **Separation of Concerns**: Clear boundaries between layers
- **Clean Code**: Readable, maintainable, testable

## License

MIT
