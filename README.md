# 3D Geometric Search Application

A modern, reactive 3D geometric search application built with clean architecture principles, supporting industry-standard 3D formats including glTF/GLB, STEP, OBJ/MTL, and STL.

## Architecture

This application follows clean architecture with clear separation of concerns:

```
src/
├── core/              # Core domain logic (framework-agnostic)
│   ├── entities/      # Domain entities
│   ├── use-cases/     # Application business rules
│   └── interfaces/    # Contracts and abstractions
├── domain/            # Domain models and services
│   ├── models/        # 3D model representations
│   ├── services/      # Domain services
│   └── events/        # Domain events
├── infrastructure/    # External concerns
│   ├── loaders/       # Format-specific loaders
│   ├── rendering/     # Three.js rendering engine
│   └── storage/       # Persistence layer
├── presentation/      # UI layer
│   ├── components/    # React components
│   ├── hooks/         # Custom React hooks
│   ├── state/         # State management (Zustand)
│   └── styles/        # Global styles
└── shared/            # Shared utilities
    ├── types/         # TypeScript types
    ├── utils/         # Helper functions
    └── constants/     # Application constants
```

## Key Features

- **Multi-Format Support**: glTF/GLB, STEP (AP203, AP214, AP242), OBJ/MTL, STL
- **Section Management**: Hierarchical sections with bidirectional navigation
- **Interactive Viewer**: Zoom, pan, rotate, fit-to-screen, full-screen
- **Model Operations**: Disassembly, reassembly, isolation, highlighting
- **Reactive State**: Centralized state management with uni-directional data flow
- **Clean UI**: Professional, minimal interface focused on usability

## Design Principles

- **SOLID**: Single responsibility, open-closed, Liskov substitution, interface segregation, dependency inversion
- **DRY**: Don't repeat yourself
- **Separation of Concerns**: Clear boundaries between layers
- **Testability**: Modular, injectable dependencies
- **Maintainability**: Clean code, clear naming, comprehensive documentation

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Testing

```bash
npm run test
```
