# ADR 0023: Frontend Architecture - Atomic Design

**Date:** 2025-05-09  
**Status:** Proposed  
**Deciders:** Architecture Lab Team

## Context

Atomic Design (Brad Frost, 2013) is a methodology for creating design systems by breaking interfaces into fundamental building blocks. It organizes components into 5 levels (atoms → molecules → organisms → templates → pages), mirroring how matter is structured in chemistry.

This is Frontend #4 in the Architecture Lab comparison project.

## Decision

We implement **Atomic Design** with the following component hierarchy:

### Component Structure

```
src/
├── components/
│   ├── atoms/                 # Level 1: Basic building blocks
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── Button.test.tsx
│   │   ├── Input/
│   │   ├── Label/
│   │   ├── Checkbox/
│   │   └── Avatar/
│   ├── molecules/             # Level 2: Simple combinations of atoms
│   │   ├── FormField/         # Label + Input + Error
│   │   ├── SearchBox/         # Input + Button
│   │   ├── UserBadge/         # Avatar + Label
│   │   └── ProjectCard/       # Atoms composed for project display
│   ├── organisms/             # Level 3: Complex UI sections
│   │   ├── Header/            # Logo + Nav + UserBadge
│   │   ├── SignInForm/        # FormFields + Button
│   │   ├── ProjectList/       # Multiple ProjectCards
│   │   ├── TaskList/          # Multiple TaskCards
│   │   └── CommentSection/    # CommentList + CommentForm
│   ├── templates/             # Level 4: Page layouts (wireframes)
│   │   ├── AuthLayout/        # Centered form layout
│   │   ├── DashboardLayout/   # Header + Sidebar + Main
│   │   └── DetailLayout/      # Header + Content + Sidebar
│   └── pages/                 # Level 5: Specific instances of templates
│       ├── SignInPage/
│       ├── SignUpPage/
│       ├── ProjectsPage/
│       └── TasksPage/
├── hooks/                     # State management
│   ├── useAuth.ts
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useComments.ts
├── services/                  # API layer
│   └── api.ts
├── types/
│   └── index.ts
└── App.tsx
```

### Atomic Hierarchy Rules

**Composition Flow:**

```
Atoms
  ↓ (used by)
Molecules
  ↓ (used by)
Organisms
  ↓ (used by)
Templates
  ↓ (used by)
Pages
```

**Import Rules:**
- **Atoms**: No component imports (only external libs)
- **Molecules**: Import atoms only
- **Organisms**: Import atoms + molecules
- **Templates**: Import atoms + molecules + organisms
- **Pages**: Import all levels + hooks + services

### Implementation Details

**Technology Stack:**
- React 18+ (functional components)
- React Router 7+ (navigation)
- TypeScript 5+ (strict mode)
- Tailwind CSS 3+ (styling)
- Storybook (optional, for component showcase)

**Atoms (Pure UI):**
```tsx
// components/atoms/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  const baseClasses = 'font-medium rounded transition';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**Molecules (Composite UI):**
```tsx
// components/molecules/FormField/FormField.tsx
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';

interface FormFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FormField({ label, type = 'text', value, onChange, error }: FormFieldProps) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        error={!!error}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

**Organisms (Business Logic + UI):**
```tsx
// components/organisms/SignInForm/SignInForm.tsx
import { useState } from 'react';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Email" type="email" value={email} onChange={setEmail} />
      <FormField label="Password" type="password" value={password} onChange={setPassword} />
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
```

**Templates (Layout Structure):**
```tsx
// components/templates/AuthLayout/AuthLayout.tsx
interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}
```

**Pages (Route Components):**
```tsx
// components/pages/SignInPage/SignInPage.tsx
import { AuthLayout } from '@/components/templates/AuthLayout';
import { SignInForm } from '@/components/organisms/SignInForm';

export function SignInPage() {
  return (
    <AuthLayout title="Sign In to TaskFlow">
      <SignInForm />
    </AuthLayout>
  );
}
```

## Consequences

### Advantages

✅ **Design System Clarity**: Clear component hierarchy matches designer thinking  
✅ **Reusability**: Atoms/molecules highly reusable across pages  
✅ **Consistency**: Enforces UI consistency through shared atoms  
✅ **Storybook Integration**: Perfect for component documentation  
✅ **Designer-Developer Collaboration**: Shared mental model

### Trade-offs

⚠️ **Ambiguous Boundaries**: Hard to decide if something is a molecule or organism  
⚠️ **Over-Componentization**: Temptation to create atoms for everything  
⚠️ **Business Logic Placement**: No clear place for state/API calls (usually in organisms/hooks)  
⚠️ **Scalability**: Large apps still need feature-based grouping on top of Atomic Design  
⚠️ **Folder Depth**: Deep nesting (atoms/Button/Button.tsx)

### Comparison to Other Patterns

| Aspect | Atomic Design | Component-Layered | Feature-Sliced Design |
|--------|--------------|-------------------|-----------------------|
| **Organization** | By UI complexity | By technical role | By feature + layer |
| **Mental model** | Chemistry metaphor | Simple folders | Business domains |
| **Reusability** | Excellent (atoms) | Medium | Good |
| **Scalability** | Medium | Poor | Excellent |
| **Design system** | Built-in | None | `shared/ui/` |
| **Storybook fit** | Perfect | Good | Medium |

## When to Use

✅ **Design system projects** (component libraries)  
✅ **UI-heavy apps** (complex interfaces, many variants)  
✅ **Designer-developer teams** (shared terminology)  
✅ **Storybook documentation** (natural fit for hierarchy)  
✅ **Brand consistency** (enforce design tokens via atoms)

❌ Avoid for:
- Business logic-heavy apps (no place for domain rules)
- Rapid prototyping (too much upfront design)
- Small teams without designers (unnecessary abstraction)

## Common Pitfalls

1. **Atom Overload**: Creating atoms for `<div>`, `<span>`, etc. (use raw HTML instead)
2. **Molecule Confusion**: "Is this a molecule or organism?" (no strict rule, team consensus needed)
3. **Business Logic in Organisms**: Mixing UI and data fetching (use hooks or services instead)
4. **Ignoring Features**: Large apps need feature grouping:
   ```
   components/
     atoms/
     molecules/
     organisms/
       auth/          # Group by feature
       projects/
       tasks/
   ```

## Hybrid Approaches

**Atomic Design + Feature Grouping:**
```
src/
├── components/
│   ├── atoms/       # Global atoms (Button, Input)
│   └── molecules/   # Global molecules (FormField)
├── features/
│   ├── auth/
│   │   ├── organisms/   # SignInForm, SignUpForm
│   │   ├── templates/   # AuthLayout
│   │   └── pages/       # SignInPage
│   ├── projects/
│   │   ├── organisms/   # ProjectList, ProjectForm
│   │   └── pages/       # ProjectsPage
```

## Testing Strategy

**Atoms**: Visual regression tests (Storybook + Chromatic)  
**Molecules**: Unit tests (React Testing Library)  
**Organisms**: Integration tests (mock hooks/services)  
**Templates**: Snapshot tests (ensure layout consistency)  
**Pages**: E2E tests (Playwright/Cypress)

## Migration Path

**From Component-Layered:**
1. Extract reusable UI → `atoms/` (Button, Input)
2. Combine atoms → `molecules/` (FormField)
3. Group complex components → `organisms/`
4. Extract layouts → `templates/`
5. Pages reference organisms/templates

**To Storybook:**
```tsx
// Button.stories.tsx
export default {
  title: 'Atoms/Button',
  component: Button,
};

export const Primary = () => <Button variant="primary">Click Me</Button>;
export const Secondary = () => <Button variant="secondary">Cancel</Button>;
export const Danger = () => <Button variant="danger">Delete</Button>;
```

## Status

**Proposed** - Not yet implemented. This ADR documents the planned architecture.

## References

- [Atomic Design Methodology (Brad Frost)](https://bradfrost.com/blog/post/atomic-web-design/)
- [Atomic Design Book](https://atomicdesign.bradfrost.com/)
- [Storybook for Atomic Design](https://storybook.js.org/blog/atomic-design-with-storybook/)
- [Critique of Atomic Design](https://github.com/daneden/blog/blob/main/content/blog/2018-02-11-atomic-design-is-messy.mdx)
