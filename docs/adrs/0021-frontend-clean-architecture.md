# ADR 0021: Frontend Architecture - Clean Architecture

**Date:** 2025-05-09  
**Status:** Accepted  
**Deciders:** Architecture Lab Team

## Context

Clean Architecture (Robert C. Martin, 2012) enforces strict separation between business logic and framework details. For React frontends, this means isolating domain rules from UI components, making the core application independent of React, routing, or HTTP libraries.

This is Frontend #2 in the Architecture Lab comparison project.

## Decision

We implement **Clean Architecture** for React with the following layers:

### Layer Structure

```
src/
├── domain/                    # Enterprise business rules (innermost)
│   ├── entities/
│   │   └── index.ts           # User, Project, Task, Comment types
│   └── ports/                 # Repository interfaces
│       ├── IAuthRepository.ts
│       ├── IProjectRepository.ts
│       ├── ITaskRepository.ts
│       └── ICommentRepository.ts
├── application/               # Application business rules
│   └── use-cases/
│       ├── auth.use-cases.ts       # SignIn, SignUp, GetProfile
│       ├── project.use-cases.ts    # CreateProject, ArchiveProject
│       ├── task.use-cases.ts       # CreateTask, ToggleTask
│       └── comment.use-cases.ts    # AddComment, DeleteComment
├── infrastructure/            # External agencies (outermost)
│   ├── api/
│   │   └── api-client.ts           # HTTP fetch wrapper
│   ├── repositories/
│   │   ├── HttpAuthRepository.ts   # Implements IAuthRepository
│   │   ├── HttpProjectRepository.ts
│   │   ├── HttpTaskRepository.ts
│   │   └── HttpCommentRepository.ts
│   └── di/
│       └── container.ts            # Dependency injection setup
└── presentation/              # UI layer (React-specific)
    ├── pages/
    │   ├── SignInPage.tsx
    │   ├── SignUpPage.tsx
    │   ├── ProjectsPage.tsx
    │   └── TasksPage.tsx
    ├── components/
    │   ├── Header.tsx
    │   └── ProtectedRoute.tsx
    └── contexts/
        └── AuthContext.tsx
```

### Dependency Rule

**Dependencies flow inward only:**

```
presentation → application → domain
     ↓              ↓
infrastructure ────┘
```

- **Domain** depends on nothing (pure TypeScript)
- **Application** depends only on domain
- **Infrastructure** depends on domain (implements ports)
- **Presentation** depends on application (calls use cases)

### Implementation Details

**Technology Stack:**
- React 18+ (UI framework)
- React Router 7+ (navigation)
- TypeScript 5+ (strict mode)
- Manual DI (no IoC container, simple factory)
- Fetch API (HTTP client)

**Domain Layer (Pure Types):**
```typescript
// domain/entities/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// domain/ports/IAuthRepository.ts
export interface IAuthRepository {
  signIn(email: string, password: string): Promise<{ user: User; token: string }>;
  signUp(data: SignUpDto): Promise<{ user: User; token: string }>;
  getProfile(): Promise<User>;
}
```

**Application Layer (Use Cases):**
```typescript
// application/use-cases/auth.use-cases.ts
import { IAuthRepository } from '@domain/ports';

export class AuthUseCases {
  constructor(private authRepo: IAuthRepository) {}
  
  async signIn(email: string, password: string) {
    return this.authRepo.signIn(email, password);
  }
  
  async signUp(data: SignUpDto) {
    return this.authRepo.signUp(data);
  }
  
  async getProfile() {
    return this.authRepo.getProfile();
  }
}
```

**Infrastructure Layer (Adapters):**
```typescript
// infrastructure/repositories/HttpAuthRepository.ts
import { IAuthRepository } from '@domain/ports';
import { apiClient } from '../api/api-client';

export class HttpAuthRepository implements IAuthRepository {
  async signIn(email: string, password: string) {
    return apiClient.post('/auth/signin', { email, password });
  }
  
  async signUp(data: SignUpDto) {
    return apiClient.post('/auth/signup', data);
  }
  
  async getProfile() {
    return apiClient.get('/auth/profile');
  }
}
```

**Dependency Injection:**
```typescript
// infrastructure/di/container.ts
import { AuthUseCases } from '@application/use-cases';
import { HttpAuthRepository } from '@infrastructure/repositories';

export const container = {
  authUseCases: new AuthUseCases(new HttpAuthRepository()),
  projectUseCases: new ProjectUseCases(new HttpProjectRepository()),
  // ...
};
```

**Presentation Layer (React):**
```tsx
// presentation/pages/ProjectsPage.tsx
import { container } from '@infrastructure/di/container';

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    // Call use case (not repository directly)
    container.projectUseCases.getAll().then(setProjects);
  }, []);
  
  const handleCreate = async (name: string) => {
    await container.projectUseCases.create({ name });
    // Refresh list...
  };
  
  return <ProjectList projects={projects} onCreate={handleCreate} />;
}
```

## Consequences

### Advantages

✅ **Testability**: Use cases testable without React/HTTP (mock repositories)  
✅ **Framework Independence**: Can swap React for Vue/Angular without changing domain  
✅ **Clear Boundaries**: Strict layers prevent accidental coupling  
✅ **Business Logic Clarity**: Domain rules isolated from UI concerns  
✅ **Maintainability**: Changes to UI don't affect business logic

### Trade-offs

⚠️ **High Complexity**: 4 layers, many abstractions (overkill for simple apps)  
⚠️ **Boilerplate**: Interfaces, use cases, repositories for every operation  
⚠️ **Learning Curve**: Team must understand Clean Architecture principles  
⚠️ **Manual DI**: No auto-wiring, must maintain DI container manually  
⚠️ **Over-Engineering Risk**: Easy to add unnecessary abstractions

### Comparison to Other Patterns

| Aspect | Clean Architecture | Component-Layered | Feature-Sliced Design |
|--------|-------------------|-------------------|-----------------------|
| **Testability** | Excellent (isolated) | Poor (hooks coupled) | Good (stores testable) |
| **Complexity** | High | Low | Medium |
| **Framework independence** | High | Low | Medium |
| **Folder depth** | Deep (4 levels) | Shallow (2 levels) | Deep (6 levels) |
| **State management** | Use cases | React hooks | Zustand stores |
| **Reusability** | High | Medium | High |

## When to Use

✅ **Complex business logic** (multi-step workflows, validation rules)  
✅ **Long-term projects** (5+ years maintenance)  
✅ **Large teams** (need strict boundaries)  
✅ **High test coverage** (unit tests for use cases)  
✅ **Framework migration** (might move from React to Next.js)

❌ Avoid for:
- Prototypes (too much ceremony)
- Simple CRUD (unnecessary abstractions)
- Solo developers (overhead not justified)
- Tight deadlines (slower initial development)

## Testing Strategy

**Domain Layer:**
```typescript
// domain/entities are pure types (no tests needed)
```

**Application Layer:**
```typescript
// Mock repositories, test use cases in isolation
const mockRepo = { signIn: jest.fn() };
const useCases = new AuthUseCases(mockRepo);
await useCases.signIn('test@example.com', 'password');
expect(mockRepo.signIn).toHaveBeenCalled();
```

**Infrastructure Layer:**
```typescript
// Integration tests with real HTTP (or MSW mocks)
const repo = new HttpAuthRepository();
const result = await repo.signIn('test@example.com', 'password');
expect(result.token).toBeDefined();
```

**Presentation Layer:**
```typescript
// React Testing Library (test components with mocked DI)
render(<ProjectsPage />);
expect(screen.getByText('Projects')).toBeInTheDocument();
```

## Migration Path

**From Component-Layered:**
1. Extract service functions → repositories (implement ports)
2. Create use cases that call repositories
3. Move types → `domain/entities/`
4. Refactor components to call use cases instead of services

**To Feature-Sliced Design:**
- Hard (different mental model: layers vs features)
- Better to rewrite than migrate

## Status

**Accepted** - Implemented on 2025-05-09 (Frontend #2).

## References

- [Clean Architecture (Robert C. Martin, 2012)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React + Clean Architecture Example](https://github.com/eduardomoroni/react-clean-architecture)
- [Frontend Clean Architecture (Dev.to)](https://dev.to/bespoyasov/clean-architecture-on-frontend-4311)
