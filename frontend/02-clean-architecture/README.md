# TaskFlow - Clean Architecture (React)

A project management application built with React implementing **Clean Architecture** (Robert C. Martin, 2012) on the frontend: business rules isolated from React, routing and HTTP details.

## Architecture Overview

Four concentric layers, dependencies pointing **inward only**:

```
src/
├── domain/                       # Enterprise business rules (innermost, pure TS)
│   ├── entities/
│   │   └── index.ts              # User, Project, Task, Comment, AuthResponse types
│   └── ports/                    # Repository/socket interfaces (contracts)
│       ├── IAuthRepository.ts
│       ├── IProjectRepository.ts
│       ├── ITaskRepository.ts
│       ├── ICommentRepository.ts
│       ├── INotificationSocket.ts
│       └── index.ts
│
├── application/                  # Application business rules (use cases)
│   └── use-cases/
│       ├── auth.use-cases.ts             # SignUp, SignIn, GetProfile, SignOut, IsAuthenticated
│       ├── project.use-cases.ts          # List, Create, Update
│       ├── task.use-cases.ts             # List, Create, Update, ToggleCompletion
│       ├── comment.use-cases.ts          # List, Create, Delete
│       ├── notification.use-cases.ts     # WatchTaskAssignments (live notifications)
│       └── index.ts
│
├── infrastructure/               # External agencies (outermost)
│   ├── api/
│   │   └── api-client.ts         # Fetch wrapper (get/post/patch/delete)
│   ├── repositories/             # Port implementations
│   │   ├── HttpAuthRepository.ts
│   │   ├── HttpProjectRepository.ts
│   │   ├── HttpTaskRepository.ts
│   │   ├── HttpCommentRepository.ts
│   │   ├── SocketIoNotificationSocket.ts # Implements INotificationSocket (Socket.IO)
│   │   └── index.ts
│   ├── storage/
│   │   └── tokenStorage.ts       # JWT persistence
│   └── di/
│       └── container.ts          # Manual DI factory (16 use cases)
│
├── presentation/                 # UI layer (React-specific)
│   ├── App.tsx                   # Router + protected routes
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── NotificationCenter.tsx
│   │   ├── ProjectForm.tsx / ProjectList.tsx
│   │   ├── TaskForm.tsx / TaskList.tsx / TaskDetail.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   ├── auth-context.ts        # Context + useAuth() (kept apart for HMR)
│   │   └── AuthProvider.tsx       # Provider wired to use cases
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   ├── useComments.ts
│   │   └── useTaskAssignments.ts
│   └── pages/
│       ├── SignInPage.tsx
│       ├── SignUpPage.tsx
│       └── DashboardPage.tsx
│
├── main.tsx                      # React entry point
└── index.css
```

## The Dependency Rule

```
presentation ──▶ application ──▶ domain
      │                              ▲
      └──▶ infrastructure ───────────┘
```

- **Domain** depends on nothing — pure TypeScript interfaces and types
- **Application** depends only on domain (use cases hold port references)
- **Infrastructure** depends on domain (implements ports) + owns HTTP/socket concerns
- **Presentation** depends on application (calls use cases), never on repositories directly

The domain never imports React, `fetch`, `socket.io-client`, or `react-router`. That is the whole point.

## Key Architecture Principles

### 1. Ports & Adapters for the UI
The domain declares **ports** (interfaces); infrastructure provides **adapters** (HTTP + Socket.IO implementations). Swapping REST for GraphQL, or Socket.IO for SSE, means writing a new adapter — nothing in `application/` or `domain/` changes.

```typescript
// domain/ports/IAuthRepository.ts
export interface IAuthRepository {
  signIn(email: string, password: string): Promise<AuthResponse>;
  signUp(data: SignUpDto): Promise<AuthResponse>;
  getProfile(token: string): Promise<User>;
}
```

### 2. Use Cases as Classes
Each operation is a single-responsibility class receiving its port via the constructor — trivially testable without React, HTTP or a live socket.

```typescript
// application/use-cases/auth.use-cases.ts
export class SignInUseCase {
  constructor(private authRepo: IAuthRepository) {}
  execute(email: string, password: string) {
    return this.authRepo.signIn(email, password);
  }
}
```

### 3. Manual Dependency Injection
No IoC container — a simple factory composes stateless adapters (singletons) with use cases (factories).

```typescript
// infrastructure/di/container.ts
const authRepository = new HttpAuthRepository();
const notificationSocket = new SocketIoNotificationSocket();

export const container = {
  signInUseCase: () => new SignInUseCase(authRepository),
  watchTaskAssignmentsUseCase: () => new WatchTaskAssignmentsUseCase(notificationSocket),
  // ...16 use cases total
};
```

### 4. Presentation Depends on Use Cases Only
Components and hooks pull use cases from the container; no component imports a repository. The context and its `useAuth()` accessor are deliberately split from the provider (their own module) — a module that exports a component next to anything else cannot be hot-reloaded, and folding them together would make every `useAuth` import drag the provider in.

### 5. Inward-Only Imports
`presentation` → `application` → `domain` (and `infrastructure` → `domain`). Enforced by `eslint` (`--max-warnings 0`). Lower layers never import higher ones.

## Technology Stack

- **React 18** — UI library
- **React Router v6** — routing with protected routes
- **TypeScript 5** — strict mode
- **Vite 6** — build tool (dev server on port 5002)
- **Tailwind CSS v3** — styling
- **Socket.IO client** — live task-assignment notifications
- **Native Fetch** — HTTP client (no axios)
- **Vitest + Testing Library** — test runner
- **Manual DI** — no IoC container

## Getting Started

### Prerequisites
- Node.js 20+ (see `.nvmrc`)
- Backend API running on `localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on http://localhost:5002

### Test / Lint / Build

```bash
npm test        # vitest run — 17 tests
npm run lint    # eslint --max-warnings 0
npm run build
```

## API Integration

- **Base URL**: `/api` (dev-proxied to `localhost:3000` by Vite, prefix stripped; in Docker nginx proxies it)
- **Socket.IO**: its own proxy entry with `ws: true` on `/socket.io` (not under `/api`)
- **Authentication**: JWT returned as `accessToken`, persisted via `tokenStorage` and passed to repository calls as a Bearer token
- **HTTP**: a single `apiClient` wraps `fetch` with `get/post/patch/delete` helpers

### Endpoints Used

#### Auth
- `POST /api/auth/signup` — user registration
- `POST /api/auth/signin` — user login
- `GET /api/auth/profile` — current user

#### Projects
- `GET /api/projects` · `POST /api/projects` · `PATCH /api/projects/:id`

#### Tasks
- `GET /api/tasks?projectId=X` · `POST /api/tasks` · `PATCH /api/tasks/:id`

#### Comments
- `GET /api/comments?taskId=X` · `POST /api/comments` · `DELETE /api/comments/:id`

#### Notifications
- Socket.IO channel for live task-assignment events (`WatchTaskAssignmentsUseCase`)

## Features

### Authentication
- Sign up / sign in with email + password
- Persistent session via JWT (`tokenStorage`)
- Auto-load user on mount
- Protected routes (`ProtectedRoute`)

### Project Management
- List, create, update projects
- Archive / unarchive

### Task Management
- Create tasks (title, description, due date)
- Toggle completion
- Task detail view

### Comments
- Add / delete comments on tasks

### Notifications
- Live task-assignment notifications via Socket.IO (`NotificationCenter`)

## Clean Architecture Benefits in This Project

1. **Testability**: use cases tested in isolation by mocking a port (no React, no HTTP) — 17 tests
2. **Framework independence**: the domain could be reused with Vue/Next.js untouched
3. **Clear boundaries**: the Dependency Rule + strict ESLint prevent accidental coupling
4. **Business logic clarity**: rules live in one place, independent of UI churn
5. **Swappable infrastructure**: change HTTP transport or notification channel without touching use cases

## Trade-offs Observed

⚠️ **Boilerplate**: a port + adapter + use case per operation — 16 use cases, 5 ports, 5 adapters
⚠️ **Folder depth**: 4 top-level layers before you reach a feature
⚠️ **Manual DI**: no auto-wiring; the container must be maintained by hand
⚠️ **Over-engineering risk**: heavy for a simple CRUD app
⚠️ **More moving parts**: notification + auth each add a port/adapter pair

## Testing Strategy

```bash
npm test   # vitest run
```

Tests live next to the code they cover, mocking the port — the whole point of the architecture.

| Suite | Tests | Layer |
|-------|-------|-------|
| `application/use-cases/auth.use-cases.test.ts` | 5 | Application |
| `application/use-cases/notification.use-cases.test.ts` | 4 | Application |
| `infrastructure/repositories/HttpAuthRepository.test.ts` | 5 | Infrastructure |
| `infrastructure/repositories/SocketIoNotificationSocket.test.ts` | 3 | Infrastructure |
| **Total** | **17** | |

The domain is pure types and needs no tests. Application tests mock a port; infrastructure tests exercise the adapters (fetch mocked) — including the socket wrapper.

## Comparison with Other Architectures

Part of the `architecture-lab` project comparing 4 frontend approaches on the same TaskFlow app:

| Aspect | **Clean Architecture** | Component-Layered | Feature-Sliced Design | Atomic Design |
|--------|------------------------|-------------------|-----------------------|---------------|
| **Testability** | Excellent (isolated) | Poor (hooks coupled) | Good (stores testable) | Good (components) |
| **Complexity** | High | Low | Medium | Medium |
| **Framework independence** | High | Low | Medium | Low |
| **Folder depth** | Deep (4 layers) | Shallow (2) | Deep (6) | Deep (5) |
| **State** | Use cases + Context + DI | Hooks + localStorage | Zustand stores | Component state |
| **Tests** | 17 | 16 | — | — |
| **Best for** | Complex/durable business rules | Small apps, speed | Large feature teams | Design systems |

## License

MIT
