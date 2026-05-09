# ADR 0020: Frontend Architecture - Component-Layered

**Date:** 2025-05-09  
**Status:** Proposed  
**Deciders:** Architecture Lab Team

## Context

The Component-Layered architecture represents the simplest organizational pattern for React applications. It groups components by their technical role (UI layer, business logic layer, data layer) without enforcing strict boundaries. This is the baseline architecture for comparison against more sophisticated patterns.

This is Frontend #1 in the Architecture Lab comparison project.

## Decision

We implement a **Component-Layered** architecture with the following structure:

### Directory Structure

```
src/
├── components/          # Presentational UI components
│   ├── auth/
│   │   ├── SignInForm.tsx
│   │   └── SignUpForm.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   └── ProjectForm.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   └── TaskForm.tsx
│   └── common/
│       ├── Header.tsx
│       └── Button.tsx
├── hooks/               # Custom React hooks (business logic)
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useComments.ts
├── services/            # API communication layer
│   ├── authService.ts
│   ├── projectService.ts
│   ├── taskService.ts
│   └── commentService.ts
├── types/               # TypeScript interfaces
│   └── index.ts
├── utils/               # Helper functions
│   └── api.ts
├── App.tsx              # Root component + routing
└── main.tsx
```

### Key Principles

1. **Separation by Technical Layer**: Components, hooks, services, types in separate folders
2. **No Strict Boundaries**: Layers can import freely (pragmatic, not dogmatic)
3. **Custom Hooks for Logic**: Business logic extracted from components into reusable hooks
4. **Services for API**: All fetch calls centralized in service modules
5. **React Router for Navigation**: Simple declarative routing

### Implementation Details

**Technology Stack:**
- React 18+ (functional components + hooks)
- React Router 7+ (routing)
- TypeScript 5+ (type safety)
- Tailwind CSS 3+ (styling)
- Fetch API (HTTP client)

**Component Pattern:**
```tsx
// Presentational component
export function ProjectList({ projects, onArchive, onDelete }) {
  return (
    <div className="space-y-4">
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

**Hook Pattern:**
```tsx
// Business logic hook
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fetchProjects = async () => {
    setLoading(true);
    const data = await projectService.getAll();
    setProjects(data);
    setLoading(false);
  };
  
  return { projects, loading, fetchProjects };
}
```

**Service Pattern:**
```typescript
// API service
export const projectService = {
  async getAll() {
    const res = await fetch('/api/projects', {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    return res.json();
  },
  
  async create(data: CreateProjectDto) {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
```

## Consequences

### Advantages

✅ **Simple to Understand**: Minimal abstraction, easy for beginners  
✅ **Fast Development**: No ceremony, write code quickly  
✅ **Flexible**: No strict rules, adapt to needs  
✅ **Small Bundle Size**: No extra libraries for architecture  
✅ **Easy Debugging**: Linear flow from component → hook → service

### Trade-offs

⚠️ **No Enforced Boundaries**: Easy to create tight coupling  
⚠️ **Scales Poorly**: Large apps become hard to navigate (flat folder structure)  
⚠️ **Inconsistent Patterns**: Different developers may organize differently  
⚠️ **No Domain Modeling**: Business logic scattered across hooks  
⚠️ **Testing Complexity**: Hard to isolate logic from React hooks

### Comparison to Other Patterns

| Aspect | Component-Layered | Clean Architecture | Feature-Sliced Design |
|--------|-------------------|--------------------|-----------------------|
| **Complexity** | Low | High | Medium |
| **Scalability** | Poor | Excellent | Excellent |
| **Learning curve** | Shallow | Steep | Moderate |
| **Boundaries** | Weak (logical) | Strong (enforced) | Strong (enforced) |
| **Folder depth** | Shallow (2 levels) | Deep (4-5 levels) | Deep (5-6 levels) |
| **Team size** | 1-3 devs | 5+ devs | 3+ devs |

## When to Use

✅ **Small apps** (< 10 pages)  
✅ **Prototypes/MVPs** (speed over structure)  
✅ **Solo developers** (no team coordination needed)  
✅ **Simple CRUD apps** (no complex business logic)

❌ Avoid for:
- Large teams (no enforced conventions)
- Complex domains (business logic gets tangled)
- Long-term maintenance (refactoring is painful)

## Migration Path

**To Clean Architecture:**
1. Move services → `infrastructure/repositories/`
2. Extract domain types → `domain/entities/`
3. Create use cases → `application/use-cases/`
4. Wrap components → `presentation/pages/`

**To Feature-Sliced Design:**
1. Group by feature → `features/projects/`, `features/tasks/`
2. Extract shared UI → `shared/ui/`
3. Create entity stores → `entities/project/model/`
4. Compose widgets → `widgets/ProjectList/`

## Status

**Proposed** - Not yet implemented. This ADR documents the planned architecture.

## References

- [React Official Docs - Thinking in React](https://react.dev/learn/thinking-in-react)
- [Bulletproof React - Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
