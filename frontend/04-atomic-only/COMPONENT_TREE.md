# Component Tree Visualization

## Complete Atomic Design Hierarchy

```
App (Routing)
│
├── SignInPage (Page)
│   └── AuthLayout (Template)
│       └── SignInForm (Organism)
│           ├── FormField (Molecule)
│           │   ├── Label (Atom)
│           │   ├── Input (Atom)
│           │   └── error message
│           └── Button (Atom)
│
├── SignUpPage (Page)
│   └── AuthLayout (Template)
│       └── SignUpForm (Organism)
│           ├── FormField (Molecule)
│           │   ├── Label (Atom)
│           │   ├── Input (Atom)
│           │   └── error message
│           └── Button (Atom)
│
└── ProjectsPage (Page)
    └── DashboardLayout (Template)
        ├── Header (Organism)
        │   ├── Logo
        │   ├── UserBadge (Molecule)
        │   │   ├── Badge (Atom)
        │   │   └── Label (Atom)
        │   └── Button (Atom) - Sign Out
        │
        ├── ProjectList (Organism) [Column 1]
        │   ├── create form
        │   │   ├── Input (Atom)
        │   │   └── Button (Atom)
        │   └── ProjectCard (Molecule) × N
        │       ├── Card (Atom)
        │       ├── Label (Atom)
        │       └── Button (Atom) - Archive
        │
        ├── TaskList (Organism) [Column 2]
        │   ├── create form
        │   │   ├── Input (Atom)
        │   │   └── Button (Atom)
        │   └── TaskCard (Molecule) × N
        │       ├── Card (Atom)
        │       ├── Checkbox (Atom)
        │       └── Label (Atom)
        │
        └── CommentSection (Organism) [Column 3]
            ├── create form
            │   ├── Input (Atom)
            │   └── Button (Atom)
            └── Comment × N
                ├── Card (Atom)
                ├── content
                └── Button (Atom) - Delete
```

## Atoms Used Across Components

### Button
- SignInForm submit
- SignUpForm submit
- Header sign out
- ProjectList create/archive
- TaskList create
- CommentSection create/delete

### Input
- FormField (in forms)
- ProjectList create
- TaskList create
- CommentSection create
- SearchBox (not currently used, but available)

### Label
- FormField
- UserBadge
- ProjectCard
- TaskCard

### Card
- ProjectCard wrapper
- TaskCard wrapper
- Comment wrapper

### Checkbox
- TaskCard (for completion)

### Badge
- UserBadge (user avatar)

## Data Flow Example: Toggle Task

```
User clicks Checkbox
    ↓
TaskCard → onToggleComplete callback
    ↓
TaskList organism
    ↓
useTasks hook → toggleComplete(taskId)
    ↓
taskService.toggleComplete()
    ↓
API: PUT /api/tasks/:id { completed: !completed }
    ↓
Hook updates local state
    ↓
TaskList re-renders
    ↓
TaskCard receives updated task prop
    ↓
Checkbox shows new checked state
```

## Reusability Matrix

| Component | Used In | Count |
|-----------|---------|-------|
| Button | All forms, Header, Cards | 10+ instances |
| Input | All forms, Create forms | 8+ instances |
| Label | FormField, Cards, UserBadge | 15+ instances |
| Card | ProjectCard, TaskCard, Comments | 20+ instances |
| FormField | SignIn, SignUp | 5 instances |
| Checkbox | TaskCard | N tasks |

## Styling Hierarchy

### Design Tokens (defined in Atoms)

**Colors:**
- Primary: blue-600 (buttons, links)
- Secondary: gray-200 (secondary buttons)
- Danger: red-600 (delete, errors)
- Success: green-100 (badges)
- Neutral: gray-50/100/200/500/700/900

**Spacing:**
- Tight: gap-2, space-y-2, p-2
- Normal: gap-4, space-y-4, p-4, px-4 py-2
- Loose: gap-6, space-y-6, p-8

**Typography:**
- Small: text-xs, text-sm
- Base: text-base
- Headers: text-lg, text-xl, text-2xl

**Border Radius:**
- Small: rounded-md (inputs, buttons)
- Medium: rounded-lg (cards, logo)
- Full: rounded-full (badges)

**Shadows:**
- Cards: shadow-md
- Hover: shadow-lg

## File Size Summary

```
atoms/           6 files  ~500 bytes each   = ~3KB
molecules/       5 files  ~800 bytes each   = ~4KB
organisms/       6 files  ~2KB each         = ~12KB
templates/       2 files  ~600 bytes each   = ~1.2KB
pages/           3 files  ~900 bytes each   = ~2.7KB
hooks/           4 files  ~1.5KB each       = ~6KB
services/        5 files  ~700 bytes each   = ~3.5KB
types/           1 file   ~1KB              = ~1KB
---------------------------------------------------
Total source:                                ~33.4KB
```

## Build Output Structure

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js      (bundled React + components)
│   └── index-[hash].css     (Tailwind CSS output)
└── vite.svg
```

## Component Dependency Graph

```
Pages depend on:
  ├── Templates
  ├── Organisms
  └── Hooks

Templates depend on:
  └── Organisms

Organisms depend on:
  ├── Molecules
  ├── Atoms
  └── Hooks

Molecules depend on:
  └── Atoms

Atoms depend on:
  └── Types (for props)

Hooks depend on:
  ├── Services
  └── Types

Services depend on:
  └── Types
```

## Testing Strategy

### Atoms
- Unit tests with React Testing Library
- Test variants, states, accessibility
- Storybook stories for visual testing

### Molecules
- Integration tests with mocked atoms
- Test data flow through composition
- User interaction scenarios

### Organisms
- Integration tests with mocked hooks
- Test business logic
- Mock API responses

### Pages
- E2E tests with full flow
- Test routing
- Test authentication

### Hooks
- Unit tests isolated from UI
- Mock API services
- Test state updates

### Services
- Unit tests with mocked fetch
- Test error handling
- Test authentication headers
