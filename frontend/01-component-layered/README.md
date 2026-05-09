# Component-Layered Frontend Architecture

This is the **simplest baseline architecture** for TaskFlow, using a traditional component-layered approach with direct fetch calls and React hooks.

## Architecture Overview

```
src/
├── types/              # TypeScript interfaces
│   └── index.ts        # User, Project, Task, Comment
├── services/           # API calls using fetch
│   ├── authService.ts
│   ├── projectService.ts
│   ├── taskService.ts
│   └── commentService.ts
├── hooks/              # Business logic hooks
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useComments.ts
├── components/         # React components by feature
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   └── SigninForm.tsx
│   ├── projects/
│   │   ├── ProjectList.tsx
│   │   └── ProjectForm.tsx
│   ├── tasks/
│   │   ├── TaskList.tsx
│   │   ├── TaskForm.tsx
│   │   └── TaskDetail.tsx
│   └── common/
│       ├── Header.tsx
│       └── Loading.tsx
├── pages/
│   └── Dashboard.tsx
├── App.tsx             # Router + routes
├── main.tsx            # React entry point
└── index.css           # Tailwind imports
```

## Key Characteristics

- **No state management libraries**: Pure React hooks (useState, useEffect)
- **Direct fetch calls**: No abstraction layers or API clients
- **Simple routing**: React Router v7 with basic protected routes
- **Tailwind CSS**: Utility-first styling
- **JWT auth**: Token stored in localStorage

## Tech Stack

- React 18
- TypeScript
- React Router v7
- Tailwind CSS
- Vite

## Getting Started

```bash
# Install dependencies
npm install

# Run development server (port 5001)
npm run dev

# Build for production
npm run build
```

## API Integration

All API calls point to `http://localhost:5001/api` and include JWT token from localStorage.

## Features

- User authentication (signup/signin)
- Project management (create, update, archive, delete)
- Task management (create, update, complete, delete)
- Comment system (create, delete)
- Real-time UI updates via local state

## Simplicity First

This architecture prioritizes:
- ✅ Minimal abstraction
- ✅ Direct API calls
- ✅ Component-level state
- ✅ Feature-based organization
- ✅ Easy to understand and debug
