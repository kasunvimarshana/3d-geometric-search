# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with WebGL support

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## Project Structure

```
src/
├── core/                 # Core business logic
│   ├── entities/         # Domain entities
│   ├── use-cases/        # Application use cases
│   └── interfaces/       # Abstractions
├── domain/               # Domain layer
│   ├── models/           # Domain models
│   ├── services/         # Domain services
│   └── events/           # Domain events
├── infrastructure/       # External concerns
│   ├── loaders/          # Format loaders
│   ├── rendering/        # Rendering engine
│   └── storage/          # Persistence
├── presentation/         # UI layer
│   ├── components/       # React components
│   ├── state/            # State management
│   └── hooks/            # Custom hooks
└── shared/               # Shared utilities
    ├── types/            # TypeScript types
    ├── utils/            # Helper functions
    └── constants/        # Constants
```

## Coding Standards

### TypeScript

- Use strict mode
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values
- Avoid `any` - use `unknown` if type is uncertain
- Document public APIs with JSDoc comments

### React

- Use functional components
- Use hooks for state and side effects
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback`
- Use `React.memo` for pure components

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `ViewerCanvas`)
- **Hooks**: camelCase with "use" prefix (e.g., `useModelLoader`)
- **Utilities**: camelCase (e.g., `formatFileSize`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)
- **Interfaces**: PascalCase with "I" prefix (e.g., `IModelLoader`)

### Code Organization

- One component per file
- Co-locate styles with components
- Group related files in folders
- Export from index files for clean imports

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up-to-date
- Remove commented-out code

## State Management

### Zustand Store

The application uses Zustand for state management with Immer middleware for immutability.

```typescript
// Accessing state
const data = useAppStore((state) => state.data);

// Calling actions
const setData = useAppStore((state) => state.setData);

// Using selectors
const isLoading = useAppStore(selectIsLoading);
```

### State Updates

Always use actions to update state. Never mutate state directly.

```typescript
// ✅ Good
setModel(newModel);

// ❌ Bad
useAppStore.getState().currentModel = newModel;
```

## Component Development

### Creating a New Component

1. Create component file:

```typescript
// src/presentation/components/MyComponent.tsx
import React from "react";
import "./MyComponent.css";

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

2. Create styles:

```css
/* src/presentation/components/MyComponent.css */
.my-component {
  padding: 16px;
}
```

3. Export from parent:

```typescript
// src/presentation/components/index.ts
export { MyComponent } from "./MyComponent";
```

### Component Best Practices

- Keep components small and focused
- Extract complex logic into custom hooks
- Use prop destructuring
- Provide TypeScript types for props
- Add data-testid for testing

## Domain Logic

### Creating a Use Case

1. Define the use case:

```typescript
// src/core/use-cases/MyUseCase.ts
import { EventBus } from "@domain/events/DomainEvents";

export class MyUseCase {
  constructor(
    private readonly dependency: IDependency,
    private readonly eventBus: EventBus
  ) {}

  async execute(input: Input): Promise<Output> {
    // Validate input
    // Execute business logic
    // Publish domain events
    // Return result
  }
}
```

2. Register dependencies
3. Use in components via actions

### Creating a Domain Event

```typescript
// src/domain/events/MyEvent.ts
import { DomainEvent } from "./DomainEvents";

export class MyEvent extends DomainEvent {
  constructor(public readonly data: Data) {
    super("MY_EVENT");
  }
}
```

### Event Handling

```typescript
// Subscribe to events
const unsubscribe = eventBus.subscribe("MY_EVENT", {
  handle: async (event: MyEvent) => {
    // Handle event
  },
});

// Publish events
await eventBus.publish(new MyEvent(data));

// Cleanup
unsubscribe();
```

## Testing

### Unit Testing

```typescript
import { describe, it, expect } from "vitest";
import { Section } from "@core/entities/Section";

describe("Section", () => {
  it("should create a section", () => {
    const section = new Section({ name: "Test" });
    expect(section.name).toBe("Test");
  });

  it("should add children", () => {
    const parent = new Section({ name: "Parent" });
    const childId = "child-123";

    parent.addChild(childId);

    expect(parent.children).toContain(childId);
  });
});
```

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders title", () => {
    render(<MyComponent title="Test" onAction={() => {}} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

## Performance

### Optimization Checklist

- [ ] Use React.memo for pure components
- [ ] Memoize expensive calculations with useMemo
- [ ] Memoize callbacks with useCallback
- [ ] Debounce user input handlers
- [ ] Throttle scroll/resize handlers
- [ ] Lazy load large components
- [ ] Code split with React.lazy
- [ ] Optimize Three.js geometries
- [ ] Dispose of Three.js resources
- [ ] Use requestAnimationFrame for animations

### Profiling

```bash
# React DevTools Profiler
# Chrome DevTools Performance tab
# Three.js Stats.js
```

## Debugging

### VS Code Launch Configuration

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}/src"
}
```

### Browser DevTools

- React DevTools for component hierarchy
- Redux DevTools (works with Zustand)
- Three.js Inspector for scene debugging

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation

### Commit Messages

Follow conventional commits:

```
feat: add section isolation feature
fix: resolve camera reset bug
refactor: extract loader factory
docs: update architecture documentation
```

### Pull Requests

- Keep PRs focused and small
- Write descriptive PR descriptions
- Link related issues
- Request reviews
- Ensure CI passes

## Deployment

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

### Environment Variables

Create `.env` file:

```
VITE_API_URL=https://api.example.com
VITE_ENABLE_DEBUG=false
```

Access in code:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

### Hosting

Deploy to:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

## Troubleshooting

### Common Issues

**Issue**: WebGL not supported
**Solution**: Check browser compatibility, update drivers

**Issue**: Model not loading
**Solution**: Check file format, verify loader implementation

**Issue**: Poor performance
**Solution**: Reduce polygon count, enable LOD, optimize materials

**Issue**: Memory leaks
**Solution**: Dispose Three.js resources, clear event listeners

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
