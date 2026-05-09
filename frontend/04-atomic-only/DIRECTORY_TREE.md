# Directory Tree

## Complete Project Structure

```
04-atomic-only/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── tsconfig.node.json        # TypeScript for Node files
│   ├── vite.config.ts            # Vite configuration (port 5004)
│   ├── tailwind.config.js        # Tailwind design tokens
│   ├── postcss.config.js         # PostCSS plugins
│   ├── eslint.config.js          # ESLint rules
│   ├── .gitignore                # Git ignore patterns
│   └── index.html                # HTML entry point
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── ARCHITECTURE.md           # Atomic Design explained
│   ├── COMPONENT_TREE.md         # Visual component hierarchy
│   ├── QUICKSTART.md             # Getting started guide
│   ├── COMPARISON.md             # vs other architectures
│   ├── IMPLEMENTATION_SUMMARY.md # This implementation summary
│   └── DIRECTORY_TREE.md         # This file
│
└── 📁 src/
    │
    ├── 🔹 Entry Points
    │   ├── main.tsx              # React app entry point
    │   ├── App.tsx               # Router and protected routes
    │   ├── index.css             # Tailwind directives
    │   └── vite-env.d.ts         # Vite type definitions
    │
    ├── ⚛️ atoms/ (Basic Building Blocks)
    │   ├── Button.tsx            # Variants: primary, secondary, danger
    │   ├── Input.tsx             # Types: text, email, password, date
    │   ├── Label.tsx             # Form labels with required indicator
    │   ├── Checkbox.tsx          # Checkbox with optional label
    │   ├── Card.tsx              # Container with shadow
    │   ├── Badge.tsx             # Status indicators
    │   └── index.ts              # Barrel export
    │
    ├── 🧩 molecules/ (Atom Combinations)
    │   ├── FormField.tsx         # Label + Input + error
    │   ├── SearchBox.tsx         # Input + Button
    │   ├── UserBadge.tsx         # Badge + Label (user display)
    │   ├── ProjectCard.tsx       # Card + Button + Label
    │   ├── TaskCard.tsx          # Card + Checkbox + Label
    │   └── index.ts              # Barrel export
    │
    ├── 🦠 organisms/ (Complex Components with State)
    │   ├── Header.tsx            # Logo + UserBadge + SignOut
    │   ├── SignInForm.tsx        # FormFields + validation + hook
    │   ├── SignUpForm.tsx        # FormFields + validation + hook
    │   ├── ProjectList.tsx       # ProjectCards + create + useProjects
    │   ├── TaskList.tsx          # TaskCards + create + useTasks
    │   ├── CommentSection.tsx    # Comments + form + useComments
    │   └── index.ts              # Barrel export
    │
    ├── 📐 templates/ (Page Layouts)
    │   ├── AuthLayout.tsx        # Centered card layout
    │   ├── DashboardLayout.tsx   # Header + 3-column grid
    │   └── index.ts              # Barrel export
    │
    ├── 📄 pages/ (Specific Instances)
    │   ├── SignInPage.tsx        # AuthLayout + SignInForm
    │   ├── SignUpPage.tsx        # AuthLayout + SignUpForm
    │   ├── ProjectsPage.tsx      # DashboardLayout + all organisms
    │   └── index.ts              # Barrel export
    │
    ├── 🪝 hooks/ (Business Logic)
    │   ├── useAuth.ts            # Auth state and actions
    │   ├── useProjects.ts        # Project CRUD
    │   ├── useTasks.ts           # Task CRUD
    │   ├── useComments.ts        # Comment CRUD
    │   └── index.ts              # Barrel export
    │
    ├── 🌐 services/ (API Layer)
    │   ├── apiClient.ts          # Shared HTTP client
    │   ├── authService.ts        # Auth endpoints
    │   ├── projectService.ts     # Project endpoints
    │   ├── taskService.ts        # Task endpoints
    │   ├── commentService.ts     # Comment endpoints
    │   └── index.ts              # Barrel export
    │
    └── 📝 types/
        └── index.ts              # TypeScript interfaces
            ├── User
            ├── Project
            ├── Task
            ├── Comment
            ├── AuthResponse
            ├── SignUpData
            ├── SignInData
            ├── ButtonVariant
            └── InputType
```

## File Relationships

### Dependency Flow (Bottom to Top)

```
types/
  ↓
atoms/ ←────────────┐
  ↓                 │
molecules/ ←────────┤
  ↓                 │
organisms/ ←────────┤
  ↑                 │
hooks/ ←────────────┤
  ↑                 │
services/ ──────────┘
  ↑
templates/
  ↑
pages/
  ↑
App.tsx
  ↑
main.tsx
```

### Import Relationships

#### Atoms Import:
- `types/` (for prop interfaces)

#### Molecules Import:
- `atoms/`
- `types/`

#### Organisms Import:
- `molecules/`
- `atoms/`
- `hooks/`
- `types/`

#### Templates Import:
- `organisms/`
- `types/`

#### Pages Import:
- `templates/`
- `organisms/`
- `hooks/`
- `types/`

#### Hooks Import:
- `services/`
- `types/`

#### Services Import:
- `types/`

### Component Usage Matrix

```
Button:
  ├── Used in: SignInForm, SignUpForm, Header, ProjectList, TaskList, CommentSection
  └── Variants: primary (default), secondary, danger

Input:
  ├── Used in: FormField, ProjectList, TaskList, CommentSection
  └── Types: text, email, password, date

Label:
  ├── Used in: FormField, UserBadge, ProjectCard, TaskCard
  └── Features: required indicator

Card:
  ├── Used in: ProjectCard, TaskCard, CommentSection
  └── Features: shadow, hover, onClick

Checkbox:
  ├── Used in: TaskCard
  └── Features: label, checked state

Badge:
  ├── Used in: UserBadge
  └── Variants: default, success, warning, danger

FormField:
  ├── Used in: SignInForm, SignUpForm
  └── Combines: Label + Input + error message

ProjectCard:
  ├── Used in: ProjectList
  └── Combines: Card + Button + Label

TaskCard:
  ├── Used in: TaskList
  └── Combines: Card + Checkbox + Label

UserBadge:
  ├── Used in: Header
  └── Combines: Badge + Label
```

## File Size Breakdown

```
Category          Files    Avg Size    Total
────────────────────────────────────────────
Atoms               6      ~600 bytes   ~3.6 KB
Molecules           5      ~900 bytes   ~4.5 KB
Organisms           6      ~2.2 KB      ~13 KB
Templates           2      ~650 bytes   ~1.3 KB
Pages               3      ~950 bytes   ~2.8 KB
Hooks               4      ~1.8 KB      ~7.2 KB
Services            5      ~800 bytes   ~4 KB
Types               1      ~1.1 KB      ~1.1 KB
Entry Points        3      ~500 bytes   ~1.5 KB
────────────────────────────────────────────
Total Source       35                   ~39 KB
Config              8                   ~3 KB
Documentation       7                   ~38 KB
────────────────────────────────────────────
Grand Total        50                   ~80 KB
```

## Naming Conventions

### Components
- **PascalCase**: `Button.tsx`, `FormField.tsx`, `SignInPage.tsx`
- **Descriptive**: Name describes what it is/does
- **Singular**: `Button` not `Buttons`

### Hooks
- **camelCase**: `useAuth.ts`, `useProjects.ts`
- **Prefix `use`**: All custom hooks start with `use`
- **Descriptive**: Name describes what data/logic it manages

### Services
- **camelCase**: `authService.ts`, `projectService.ts`
- **Suffix `Service`**: All services end with `Service`
- **Domain**: Named after business domain

### Files
- **Component name = file name**: `Button.tsx` exports `Button`
- **Index files**: `index.ts` for barrel exports
- **TypeScript**: `.tsx` for JSX, `.ts` for logic

### Props Interfaces
- **ComponentNameProps**: `ButtonProps`, `FormFieldProps`
- **Co-located**: Defined in same file as component
- **Exported**: Can be reused by parent components

## Barrel Exports (index.ts)

Each layer has an `index.ts` for clean imports:

```typescript
// Instead of:
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

// Use:
import { Button, Input, Label } from '../atoms';
```

**Files with barrel exports**:
- `src/atoms/index.ts`
- `src/molecules/index.ts`
- `src/organisms/index.ts`
- `src/templates/index.ts`
- `src/pages/index.ts`
- `src/hooks/index.ts`
- `src/services/index.ts`

## Color Coding Legend

- 📄 = Configuration files
- 📚 = Documentation
- 📁 = Directory
- 🔹 = Entry point
- ⚛️ = Atoms (smallest components)
- 🧩 = Molecules (atom combinations)
- 🦠 = Organisms (complex components)
- 📐 = Templates (layouts)
- 📄 = Pages (route components)
- 🪝 = Hooks (business logic)
- 🌐 = Services (API layer)
- 📝 = Types (TypeScript interfaces)

## Quick Navigation

**Finding Components**:
1. Start with `pages/` to see top-level routes
2. Look at templates used in pages
3. Check organisms in templates
4. Follow to molecules and atoms

**Finding Logic**:
1. Start with `hooks/` for business logic
2. Follow to `services/` for API calls
3. Check `types/` for data structures

**Finding Styles**:
1. Check `atoms/` for base design tokens
2. Look at Tailwind classes in components
3. See `tailwind.config.js` for theme

**Adding Features**:
1. Define types in `types/`
2. Create service in `services/`
3. Create hook in `hooks/`
4. Build organism with hook
5. Add to page

## Tree Traversal Examples

### "Where is the Sign In button styled?"

```
SignInPage.tsx (page)
  → SignInForm.tsx (organism)
    → Button.tsx (atom)
      → Tailwind classes define style
        → tailwind.config.js for tokens
```

### "How does task completion work?"

```
User clicks checkbox
  → TaskCard.tsx (molecule)
    → Checkbox.tsx (atom)
      → onToggleComplete callback
        → TaskList.tsx (organism)
          → useTasks hook
            → taskService.toggleComplete()
              → API: PUT /api/tasks/:id
```

### "Where are colors defined?"

```
tailwind.config.js (theme.extend.colors)
  ↓
Atoms (use Tailwind classes)
  ↓
Molecules (inherit from atoms)
  ↓
Organisms (inherit from molecules)
```

---

**Last Updated**: 2026-05-09
**Total Files**: 50
**Total Directories**: 10
**Lines of Code**: ~1,500 (source)
