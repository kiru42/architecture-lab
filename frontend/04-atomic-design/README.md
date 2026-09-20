# TaskFlow - Atomic Design Frontend

This is a React + TypeScript implementation of TaskFlow using **Atomic Design** methodology.

## Architecture

### Atomic Design Hierarchy

#### 1. **Atoms** (`/src/atoms`)
Basic building blocks - smallest UI elements:
- `Button` - Primary, secondary, and danger variants
- `Input` - Text, email, password types with error states
- `Label` - Form labels with optional required indicator
- `Checkbox` - Checkbox input with optional label
- `Card` - Container component with shadow and border
- `Badge` - Small status/label indicators

#### 2. **Molecules** (`/src/molecules`)
Combinations of atoms working together:
- `FormField` - Label + Input + error message
- `SearchBox` - Input + Button for search
- `UserBadge` - Badge + Label for user display
- `ProjectCard` - Card + Button + Label for projects
- `TaskCard` - Card + Checkbox + Label for tasks

#### 3. **Organisms** (`/src/organisms`)
Complex sections with business logic:
- `Header` - Logo + UserBadge + SignOut button
- `SignInForm` - FormFields + Button + validation
- `SignUpForm` - FormFields + Button + validation
- `ProjectList` - ProjectCards + create form + state management
- `TaskList` - TaskCards + create form + state management
- `CommentSection` - Comment list + form + state management

#### 4. **Templates** (`/src/templates`)
Page layouts without data:
- `AuthLayout` - Centered form container for auth pages
- `DashboardLayout` - Header + 3-column grid layout

#### 5. **Pages** (`/src/pages`)
Specific instances with real data:
- `SignInPage` - AuthLayout + SignInForm
- `SignUpPage` - AuthLayout + SignUpForm
- `ProjectsPage` - DashboardLayout + ProjectList + TaskList + CommentSection

### Additional Layers

#### **Hooks** (`/src/hooks`)
Business logic and state management:
- `useAuth` - Authentication state and actions
- `useProjects` - Project CRUD operations
- `useTasks` - Task CRUD operations
- `useComments` - Comment CRUD operations

#### **Services** (`/src/services`)
API communication layer:
- `authService` - Auth endpoints
- `projectService` - Project endpoints
- `taskService` - Task endpoints
- `commentService` - Comment endpoints
- `apiClient` - Shared HTTP client

#### **Types** (`/src/types`)
TypeScript interfaces matching Prisma schema:
- `User`, `Project`, `Task`, `Comment`
- Component prop types

## Design Principles

1. **Reusability**: Atoms are highly reusable across the app
2. **Composability**: Molecules combine atoms, organisms combine molecules
3. **Single Responsibility**: Each component has one clear purpose
4. **Design System**: Atoms define the visual language (colors, spacing, typography)
5. **Separation of Concerns**: UI (atoms/molecules) separated from logic (hooks/services)

## Tech Stack

- **React 18** with TypeScript
- **React Router v7** for routing
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **JWT** authentication (localStorage)

## Port

Development server runs on **port 5004**

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Integration

Backend should run on `http://localhost:5004` with endpoints:
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/comments?taskId=:id`
- `POST /api/comments`
- `DELETE /api/comments/:id`

## State Management

Pure React hooks (no Redux/MobX):
- `useState` for component state
- `useEffect` for side effects
- Custom hooks for business logic
- Context could be added for theme/global state if needed

## Styling Strategy

Tailwind CSS with utility classes:
- Atoms define base design tokens
- Consistent spacing, colors, and typography
- Responsive design with Tailwind breakpoints
- Dark mode ready (can be extended)

## Component Communication

- **Props down**: Data flows from parent to child
- **Callbacks up**: Events bubble up through callbacks
- **Hooks for state**: Business logic isolated in custom hooks
- **Services for API**: All API calls in service layer
