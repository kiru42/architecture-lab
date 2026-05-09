# ADR 0022: Frontend Architecture - Feature-Sliced Design

**Date:** 2025-05-09  
**Status:** Accepted  
**Deciders:** Architecture Lab Team

## Context

Feature-Sliced Design (FSD) is a modern frontend architecture methodology that organizes code by business features and technical layers simultaneously. It addresses the scalability problems of traditional layer-based architectures by enforcing strict import rules and promoting high module cohesion.

This is Frontend #3 in the Architecture Lab comparison project.

## Decision

We implement **Feature-Sliced Design (FSD)** with the following layer hierarchy:

### Layer Structure

```
src/
├── app/                      # Layer 1: Application initialization
│   ├── App.tsx               # Router + global providers
│   └── providers/
│       └── AuthProvider.tsx  # Auto-load user on mount
├── pages/                    # Layer 2: Route pages
│   ├── signin/
│   │   └── index.tsx
│   ├── signup/
│   │   └── index.tsx
│   ├── projects/
│   │   └── index.tsx
│   └── tasks/
│       └── [projectId].tsx
├── widgets/                  # Layer 3: Complex UI compositions
│   ├── Header.tsx            # Nav + user menu + sign out
│   ├── ProjectList.tsx       # Projects list + form
│   ├── TaskList.tsx          # Tasks list + form
│   └── CommentSection.tsx    # Comments list + form
├── features/                 # Layer 4: User interactions
│   ├── auth/
│   │   └── ui/
│   │       ├── SignInForm.tsx
│   │       └── SignUpForm.tsx
│   ├── projects/
│   │   └── ui/
│   │       ├── ProjectForm.tsx
│   │       └── ProjectItem.tsx
│   ├── tasks/
│   │   └── ui/
│   │       ├── TaskForm.tsx
│   │       └── TaskItem.tsx
│   └── comments/
│       └── ui/
│           ├── CommentForm.tsx
│           └── CommentItem.tsx
├── entities/                 # Layer 5: Business entities
│   ├── user/
│   │   ├── model/
│   │   │   └── store.ts      # Zustand: useUserStore
│   │   └── api/
│   │       └── index.ts      # Auth API (signup, signin, getProfile)
│   ├── project/
│   │   ├── model/
│   │   │   └── store.ts      # Zustand: useProjectStore
│   │   └── api/
│   │       └── index.ts      # Project CRUD API
│   ├── task/
│   │   ├── model/
│   │   │   └── store.ts      # Zustand: useTaskStore
│   │   └── api/
│   │       └── index.ts      # Task CRUD API
│   └── comment/
│       ├── model/
│       │   └── store.ts      # Zustand: useCommentStore
│       └── api/
│           └── index.ts      # Comment CRUD API
└── shared/                   # Layer 6: Reusable infrastructure
    ├── api/
    │   └── client.ts         # HTTP client with JWT auth
    ├── types/
    │   └── index.ts          # TypeScript interfaces
    └── ui/
        ├── Button.tsx
        ├── Input.tsx
        └── Card.tsx
```

### FSD Import Rules

**Strict top-down dependencies:**

```
app → pages → widgets → features → entities → shared
```

✅ **Allowed:**
- `pages/projects` can import from `widgets/ProjectList`, `features/projects`, `entities/project`, `shared/ui`
- `widgets/ProjectList` can import from `features/projects`, `entities/project`, `shared/ui`
- `features/projects` can import from `entities/project`, `shared/ui`
- `entities/project` can import from `shared/api`, `shared/types`

❌ **Forbidden:**
- `entities/project` CANNOT import from `features/projects` (upward dependency)
- `widgets/ProjectList` CANNOT import from `pages/projects` (upward)
- `features/projects` CANNOT import from `features/tasks` (cross-feature coupling)

### Implementation Details

**Technology Stack:**
- React 18+ (UI framework)
- React Router 7+ (navigation)
- Zustand 5+ (state management)
- TypeScript 5+ (strict mode)
- Tailwind CSS 3+ (styling)
- Fetch API (HTTP client)

**Entities Layer (Data Model + API):**
```typescript
// entities/project/model/store.ts
import { create } from 'zustand';

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectDto) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,
  fetchProjects: async () => {
    set({ loading: true });
    const projects = await projectApi.getAll();
    set({ projects, loading: false });
  },
  createProject: async (data) => {
    const project = await projectApi.create(data);
    set((state) => ({ projects: [...state.projects, project] }));
  },
  archiveProject: async (id) => {
    await projectApi.update(id, { archived: true });
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? { ...p, archived: true } : p)
    }));
  },
}));
```

**Features Layer (User Interactions):**
```tsx
// features/projects/ui/ProjectForm.tsx
import { useState } from 'react';
import { useProjectStore } from '@entities/project/model/store';
import { Button, Input } from '@shared/ui';

export function ProjectForm() {
  const [name, setName] = useState('');
  const createProject = useProjectStore(state => state.createProject);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createProject({ name });
    setName('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <Input value={name} onChange={e => setName(e.target.value)} />
      <Button type="submit">Create Project</Button>
    </form>
  );
}
```

**Widgets Layer (Compositions):**
```tsx
// widgets/ProjectList.tsx
import { useEffect } from 'react';
import { useProjectStore } from '@entities/project/model/store';
import { ProjectForm } from '@features/projects/ui/ProjectForm';
import { ProjectItem } from '@features/projects/ui/ProjectItem';

export function ProjectList() {
  const { projects, loading, fetchProjects } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <ProjectForm />
      <div className="space-y-4">
        {projects.map(project => (
          <ProjectItem key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

**Pages Layer (Routes):**
```tsx
// pages/projects/index.tsx
import { ProjectList } from '@widgets/ProjectList';
import { Header } from '@widgets/Header';

export function ProjectsPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <ProjectList />
      </main>
    </div>
  );
}
```

## Consequences

### Advantages

✅ **Scalability**: Easy to add features without touching existing code  
✅ **Clear Boundaries**: Import rules prevent coupling  
✅ **Team Collaboration**: Multiple devs can work on different features independently  
✅ **Reusability**: Entities/widgets/features composable across pages  
✅ **Maintainability**: Changes isolated to feature slices  
✅ **State Management**: Zustand provides simple, type-safe stores per entity

### Trade-offs

⚠️ **Deep Folder Structure**: 6 layers, nested directories (harder navigation)  
⚠️ **Learning Curve**: Team must understand FSD methodology (not just React)  
⚠️ **Over-Abstraction Risk**: Easy to create too many layers for simple features  
⚠️ **Tooling Needed**: ESLint rules to enforce import restrictions (not built-in)

### Comparison to Other Patterns

| Aspect | Feature-Sliced Design | Clean Architecture | Component-Layered |
|--------|----------------------|--------------------|--------------------|
| **Scalability** | Excellent | Excellent | Poor |
| **Complexity** | Medium | High | Low |
| **Import rules** | Strict (enforced) | Strict (manual) | None |
| **State management** | Zustand stores | Use cases | React hooks |
| **Feature isolation** | High (by design) | Medium | Low |
| **Folder depth** | Deep (6 layers) | Deep (4 layers) | Shallow (2 levels) |
| **Team size** | 3+ devs | 5+ devs | 1-3 devs |

## When to Use

✅ **Large frontends** (20+ pages)  
✅ **Growing teams** (3+ frontend devs)  
✅ **Feature-rich apps** (many independent workflows)  
✅ **Long-term projects** (need sustainable architecture)  
✅ **Rapid feature additions** (want to scale without refactoring)

❌ Avoid for:
- Prototypes (too much ceremony)
- Small teams (overhead not justified)
- Simple apps (5-10 pages max)
- Tight deadlines (slower initial setup)

## FSD vs Clean Architecture

| Aspect | FSD | Clean Architecture |
|--------|-----|---------------------|
| **Organization** | By feature + layer | By layer only |
| **Mental model** | "What feature?" → "What layer?" | "What layer?" |
| **Cross-cutting concerns** | `shared/` layer | `infrastructure/` |
| **Business logic** | Zustand stores | Use cases |
| **Testing** | Test stores | Test use cases |
| **DI** | React hooks (implicit) | Manual container (explicit) |

## Linting Setup

To enforce FSD import rules:

```javascript
// eslint.config.js
module.exports = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          { target: './src/entities', from: './src/features' },
          { target: './src/entities', from: './src/widgets' },
          { target: './src/features', from: './src/widgets' },
          { target: './src/features', from: './src/pages' },
          // ...
        ]
      }
    ]
  }
};
```

## Migration Path

**From Component-Layered:**
1. Move components → `features/*/ui/`
2. Extract hooks → `entities/*/model/` (convert to Zustand)
3. Move services → `entities/*/api/`
4. Create widgets by composing features
5. Create pages by composing widgets

**To Micro-Frontends:**
- Each feature slice can become a micro-frontend
- `entities/` and `shared/` become shared libraries
- `pages/` routes to micro-frontend modules

## Status

**Accepted** - Implemented on 2025-05-09 (Frontend #3).

## References

- [Feature-Sliced Design Official Documentation](https://feature-sliced.design/)
- [FSD vs Clean Architecture Comparison](https://feature-sliced.design/docs/about/understanding/architecture-comparison)
- [Real-world FSD Examples](https://github.com/feature-sliced/examples)
- [Zustand Official Docs](https://docs.pmnd.rs/zustand/getting-started/introduction)
