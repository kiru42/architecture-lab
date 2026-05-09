# Feature-Sliced Design Architecture Diagram

## Layer Dependencies (Top → Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│                         APP LAYER                           │
│  • App.tsx (Router, Routes, ProtectedRoute)                 │
│  • providers/AuthProvider.tsx (User initialization)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        PAGES LAYER                          │
│  • signin/      • signup/      • projects/      • tasks/    │
│  Route-level compositions, lazy loading ready               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       WIDGETS LAYER                         │
│  • Header (nav + user menu)                                 │
│  • ProjectList (list + form)                                │
│  • TaskList (list + form)                                   │
│  • CommentSection (list + form)                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      FEATURES LAYER                         │
│  auth/          projects/       tasks/        comments/     │
│  • SignInForm   • ProjectForm   • TaskForm    • CommentForm │
│  • SignUpForm   • ProjectItem   • TaskItem    • CommentItem │
│                                                              │
│  User interactions & business features                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      ENTITIES LAYER                         │
│  user/           project/        task/         comment/     │
│  ├─ model/       ├─ model/       ├─ model/    ├─ model/    │
│  │  store.ts     │  store.ts     │  store.ts  │  store.ts  │
│  └─ api/         └─ api/         └─ api/      └─ api/      │
│     index.ts        index.ts        index.ts     index.ts   │
│                                                              │
│  Business entities with Zustand state & API calls           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       SHARED LAYER                          │
│  api/            types/          ui/                        │
│  • client.ts     • index.ts      • Button.tsx               │
│                  (TS types)      • Input.tsx                │
│                                  • Card.tsx                 │
│                                                              │
│  Reusable infrastructure (no business logic)                │
└─────────────────────────────────────────────────────────────┘
```

## Import Rules

✅ **Allowed:**
- app → pages → widgets → features → entities → shared
- Same layer: Different slices CAN import each other

❌ **Forbidden:**
- Lower layer → Higher layer (e.g., shared → entities)
- Circular dependencies between slices

## State Management Flow

```
User Action
    ↓
Feature Component (UI)
    ↓
Entity API Call
    ↓
Update Zustand Store
    ↓
Re-render Components
```

## Example: Creating a Project

```
1. User clicks "Create Project" in ProjectForm (features/projects/ui)
2. Form calls projectApi.create() (entities/project/api)
3. API client sends POST request (shared/api/client)
4. Response updates useProjectStore (entities/project/model)
5. ProjectList widget re-renders (widgets/ProjectList)
6. New ProjectItem appears (features/projects/ui)
```

## File Naming Conventions

- **Components**: PascalCase.tsx (Button.tsx, ProjectForm.tsx)
- **Stores**: store.ts (useUserStore, useProjectStore)
- **API**: index.ts (centralized exports)
- **Types**: index.ts (centralized type exports)
- **Pages**: index.tsx (default export for routes)

## Zustand Store Pattern

```typescript
// entities/*/model/store.ts
export const useEntityStore = create<EntityState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  
  // Actions
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  updateItem: (id, data) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, ...data } : i)
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
```

## API Client Pattern

```typescript
// shared/api/client.ts
class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T>
  async get<T>(endpoint: string): Promise<T>
  async post<T>(endpoint: string, data?: unknown): Promise<T>
  async patch<T>(endpoint: string, data?: unknown): Promise<T>
  async delete<T>(endpoint: string): Promise<T>
}
```

## Route Protection Pattern

```typescript
// app/App.tsx
<ProtectedRoute>      // Checks isAuthenticated
  <ProjectsPage />    // Only renders if logged in
</ProtectedRoute>

<PublicRoute>         // Redirects if authenticated
  <SignInPage />      // Only renders if NOT logged in
</PublicRoute>
```
