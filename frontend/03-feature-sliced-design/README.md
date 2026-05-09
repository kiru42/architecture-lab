# TaskFlow - Feature-Sliced Design (FSD)

A project management application built with React and Feature-Sliced Design architecture.

## Architecture Overview

This project follows the **Feature-Sliced Design** methodology, organizing code into 6 layers:

### Layer Structure (Top to Bottom)

```
src/
├── app/                    # Application initialization layer
│   ├── App.tsx            # Router & route protection
│   └── providers/         # Global providers (AuthProvider)
│
├── pages/                  # Route pages
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page
│   ├── projects/          # Projects list page
│   └── tasks/             # Tasks page (dynamic route)
│
├── widgets/                # Complex UI compositions
│   ├── Header.tsx         # Navigation header with user menu
│   ├── ProjectList.tsx    # Complete project list with form
│   ├── TaskList.tsx       # Complete task list with form
│   └── CommentSection.tsx # Comments with form
│
├── features/               # User interactions & business features
│   ├── auth/              # Authentication flows
│   │   └── ui/            # SignInForm, SignUpForm
│   ├── projects/          # Project management
│   │   └── ui/            # ProjectForm, ProjectItem
│   ├── tasks/             # Task management
│   │   └── ui/            # TaskForm, TaskItem
│   └── comments/          # Comment management
│       └── ui/            # CommentForm, CommentItem
│
├── entities/               # Business entities with state
│   ├── user/
│   │   ├── model/store.ts # Zustand store for user state
│   │   └── api/index.ts   # Auth API calls
│   ├── project/
│   │   ├── model/store.ts # Project state management
│   │   └── api/index.ts   # Project CRUD API
│   ├── task/
│   │   ├── model/store.ts # Task state management
│   │   └── api/index.ts   # Task CRUD API
│   └── comment/
│       ├── model/store.ts # Comment state management
│       └── api/index.ts   # Comment CRUD API
│
└── shared/                 # Reusable infrastructure
    ├── api/
    │   └── client.ts      # HTTP client with auth
    ├── types/
    │   └── index.ts       # TypeScript types & DTOs
    └── ui/                # Reusable UI components
        ├── Button.tsx
        ├── Input.tsx
        └── Card.tsx
```

## Key Architecture Principles

### 1. **Layered Imports** (Import Rule)
- Higher layers can import from lower layers
- Lower layers CANNOT import from higher layers
- Forbidden: `shared` → `entities`, `entities` → `features`, etc.

### 2. **Public API**
- Each slice exports its public API through index files
- Internal implementation details are hidden

### 3. **State Management**
- **Zustand** stores in `entities/*/model/store.ts`
- Each entity manages its own state
- No global state except user authentication

### 4. **Separation of Concerns**
- **Shared**: No business logic, pure utilities
- **Entities**: Business entities, state, API calls
- **Features**: User interactions, forms, CRUD operations
- **Widgets**: Composed features, complex UI
- **Pages**: Route-level composition
- **App**: Initialization, providers, routing

## Technology Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety (strict mode)
- **React Router v6** - Routing with protected routes
- **Zustand v4** - State management
- **Tailwind CSS v3** - Styling
- **Vite** - Build tool
- **ESLint** - Linting

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs on http://localhost:5003

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## API Integration

- **Base URL**: `/api` (proxied to `localhost:3000`)
- **Authentication**: JWT stored in `localStorage` (key: `token`)
- **Headers**: Automatic Bearer token injection via API client

### Endpoints Used

#### Auth
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/profile` - Get current user

#### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks?projectId=X` - List tasks by project
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Comments
- `GET /api/comments?taskId=X` - List comments by task
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

## Features

### Authentication
- Sign up with email/password
- Sign in with credentials
- Persistent sessions (JWT)
- Auto-load user on mount
- Protected routes

### Project Management
- Create projects
- Archive/unarchive projects
- Delete projects
- View active vs archived projects

### Task Management
- Create tasks with title, description, due date
- Mark tasks as complete/incomplete
- Delete tasks
- Filter by active/completed

### Comments
- Add comments to tasks
- Delete comments
- View comment history

## FSD Benefits in This Project

1. **Scalability**: Easy to add new features without touching existing code
2. **Maintainability**: Clear boundaries between layers
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Shared components and entities are highly reusable
5. **Team Collaboration**: Different teams can work on different layers
6. **Onboarding**: New developers can understand structure quickly

## Comparison with Other Architectures

This is part of the `architecture-lab` project comparing:
- Atomic Design
- Feature-Based
- **Feature-Sliced Design** (this implementation)

Each frontend implements the same TaskFlow application with different architectural approaches.

## License

MIT
