# Atomic Design Architecture

## Overview

This project implements Brad Frost's **Atomic Design** methodology, which breaks UI components into a hierarchical system inspired by chemistry.

## Directory Structure

```
src/
├── atoms/              # Basic building blocks (Button, Input, Label, etc.)
├── molecules/          # Combinations of atoms (FormField, SearchBox, etc.)
├── organisms/          # Complex components with logic (Header, SignInForm, etc.)
├── templates/          # Page layouts (AuthLayout, DashboardLayout)
├── pages/              # Specific page instances (SignInPage, ProjectsPage, etc.)
├── hooks/              # Custom React hooks for business logic
├── services/           # API communication layer
├── types/              # TypeScript type definitions
├── App.tsx             # Root component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles (Tailwind directives)
```

## Component Hierarchy

### Level 1: Atoms
**Purpose**: Smallest, most reusable UI elements

- `Button.tsx` - Variants: primary, secondary, danger
- `Input.tsx` - Types: text, email, password, date
- `Label.tsx` - With optional required indicator
- `Checkbox.tsx` - With optional inline label
- `Card.tsx` - Container with shadow and hover states
- `Badge.tsx` - Status indicators with color variants

**Design Tokens** (defined in atoms):
- Colors: blue-600 (primary), gray-200 (secondary), red-600 (danger)
- Spacing: px-4 py-2 (button), px-3 py-2 (input)
- Typography: font-medium (button), text-sm (label)
- Border radius: rounded-md (inputs/buttons), rounded-lg (cards)

### Level 2: Molecules
**Purpose**: Functional groups of atoms

- `FormField` = Label + Input + error message
- `SearchBox` = Input + Button
- `UserBadge` = Badge + Label (user avatar + name)
- `ProjectCard` = Card + Button + Label
- `TaskCard` = Card + Checkbox + Label

**Key Characteristics**:
- No business logic (only presentation)
- Receive data and callbacks via props
- Reusable across different contexts

### Level 3: Organisms
**Purpose**: Complex sections with state and business logic

- `Header` - Logo + UserBadge + SignOut button
- `SignInForm` - FormFields + validation + auth hook
- `SignUpForm` - FormFields + validation + auth hook
- `ProjectList` - ProjectCards + create form + useProjects hook
- `TaskList` - TaskCards + create form + useTasks hook
- `CommentSection` - Comment list + form + useComments hook

**Key Characteristics**:
- Contain business logic via custom hooks
- Manage local state (useState)
- Handle user interactions
- Coordinate between multiple molecules

### Level 4: Templates
**Purpose**: Page layouts without data

- `AuthLayout` - Centered card on gray background
- `DashboardLayout` - Header + 3-column responsive grid

**Key Characteristics**:
- Define page structure
- Responsive design (mobile-first)
- Reusable across multiple pages

### Level 5: Pages
**Purpose**: Specific instances with real data and routing

- `SignInPage` - AuthLayout + SignInForm + navigation
- `SignUpPage` - AuthLayout + SignUpForm + navigation
- `ProjectsPage` - DashboardLayout + all organisms

**Key Characteristics**:
- Connected to React Router
- Orchestrate organisms
- Handle page-level state

## Supporting Layers

### Hooks (`/hooks`)
Custom React hooks for business logic:

- `useAuth()` - Authentication state, signIn, signUp, signOut
- `useProjects()` - Fetch, create, archive projects
- `useTasks()` - Fetch, create, update, toggle tasks
- `useComments()` - Fetch, create, delete comments

**Benefits**:
- Logic reusability
- Testable in isolation
- Separation from UI

### Services (`/services`)
API communication abstraction:

- `authService` - Auth endpoints
- `projectService` - Project CRUD
- `taskService` - Task CRUD
- `commentService` - Comment CRUD
- `apiClient` - Shared HTTP client with auth headers

**Benefits**:
- Centralized API logic
- Easy to mock for testing
- Type-safe responses

### Types (`/types`)
TypeScript interfaces:

- Match Prisma schema (User, Project, Task, Comment)
- Component prop types
- Auth response types

## Data Flow

```
User Action
    ↓
Page Component
    ↓
Organism (with hook)
    ↓
Service (API call)
    ↓
Hook (update state)
    ↓
Organism (re-render)
    ↓
Molecule (updated props)
    ↓
Atom (updated UI)
```

## Styling Strategy

**Tailwind CSS Utility Classes**:
- Atoms define base design tokens
- Molecules inherit and extend
- Organisms combine without adding much styling
- Responsive: mobile-first with lg: breakpoints

**Design System Consistency**:
- Color palette: blue (primary), gray (neutral), red (danger), green (success)
- Spacing scale: 1-4 (tight), 6-8 (normal), 12+ (loose)
- Typography: text-sm/base/lg/xl/2xl
- Shadows: shadow-md (cards), shadow-lg (hover)

## State Management

**React Hooks Only** (no Redux/MobX):
- `useState` - Local component state
- `useEffect` - Side effects (data fetching)
- Custom hooks - Business logic
- Context API - Could be added for theme/global state

## Routing

**React Router v7**:
- `ProtectedRoute` - Requires authentication
- `PublicRoute` - Redirects if authenticated
- Routes: `/signin`, `/signup`, `/projects`

## Authentication

**JWT in localStorage**:
- Token stored on login
- Sent in Authorization header
- Cleared on logout
- Validated on app load (useAuth hook)

## Benefits of Atomic Design

1. **Consistency**: Atoms ensure uniform UI elements
2. **Reusability**: Build once, use everywhere
3. **Scalability**: Easy to add new features
4. **Testability**: Each level can be tested independently
5. **Documentation**: Clear component hierarchy
6. **Team Collaboration**: Designers and developers speak same language
7. **Maintenance**: Changes in atoms cascade properly

## Trade-offs

**Pros**:
- Clear component organization
- Strong design system
- High reusability
- Easy to onboard new developers

**Cons**:
- More files to navigate
- Can feel over-engineered for simple apps
- Requires discipline to maintain hierarchy
- Potentially more boilerplate

## When to Use Atomic Design

**Good fit**:
- Design-system-driven apps
- Large teams
- Long-term projects
- Brand consistency is critical

**Not ideal**:
- Rapid prototypes
- Very small apps
- Highly custom, one-off UIs
- Exploratory projects

## Comparison to Other Patterns

**vs. Feature-Based**:
- Atomic: Organized by UI hierarchy
- Feature: Organized by business domain
- Trade-off: Reusability vs. cohesion

**vs. Container/Presentational**:
- Similar separation of concerns
- Atomic adds more granular levels (atoms/molecules)
- Container pattern is flatter

**vs. Component-Library**:
- Atomic Design IS a component library structure
- Often used to build design systems
