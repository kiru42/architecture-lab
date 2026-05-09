# Quick Start Guide

## Installation

```bash
cd /home/kiru42/architecture-lab/frontend/04-atomic-only
npm install
```

## Development

```bash
npm run dev
```

Application will start on **http://localhost:5004**

## Project Structure

```
src/
├── atoms/              # Basic UI elements (Button, Input, etc.)
├── molecules/          # Composed components (FormField, ProjectCard, etc.)
├── organisms/          # Complex components with state (Header, ProjectList, etc.)
├── templates/          # Page layouts (AuthLayout, DashboardLayout)
├── pages/              # Route-specific pages (SignInPage, ProjectsPage, etc.)
├── hooks/              # Custom React hooks (useAuth, useProjects, etc.)
├── services/           # API services (authService, projectService, etc.)
├── types/              # TypeScript interfaces
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## Available Routes

- `/signin` - Sign in page
- `/signup` - Sign up page
- `/projects` - Main dashboard (protected)
- `/` - Redirects to projects

## Building Components

### Creating a New Atom

```tsx
// src/atoms/NewAtom.tsx
import React from 'react';

interface NewAtomProps {
  children: React.ReactNode;
  className?: string;
}

export const NewAtom: React.FC<NewAtomProps> = ({ children, className = '' }) => {
  return (
    <div className={`base-styles ${className}`}>
      {children}
    </div>
  );
};
```

Don't forget to export from `src/atoms/index.ts`:
```tsx
export { NewAtom } from './NewAtom';
```

### Creating a New Molecule

```tsx
// src/molecules/NewMolecule.tsx
import React from 'react';
import { Button, Input } from '../atoms';

export const NewMolecule: React.FC = () => {
  return (
    <div className="flex gap-2">
      <Input type="text" placeholder="Enter text" />
      <Button>Submit</Button>
    </div>
  );
};
```

### Creating a New Organism

```tsx
// src/organisms/NewOrganism.tsx
import React from 'react';
import { NewMolecule } from '../molecules';
import { useCustomHook } from '../hooks';

export const NewOrganism: React.FC = () => {
  const { data, loading } = useCustomHook();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h2>Organism Title</h2>
      <NewMolecule />
    </div>
  );
};
```

### Creating a New Hook

```tsx
// src/hooks/useCustom.ts
import { useState, useEffect } from 'react';
import { customService } from '../services';

export const useCustom = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    customService.getData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
};
```

### Creating a New Service

```tsx
// src/services/customService.ts
import { apiClient } from './apiClient';

export const customService = {
  async getData() {
    return apiClient.get('/api/custom');
  },
  
  async postData(data: any) {
    return apiClient.post('/api/custom', data);
  },
};
```

## Common Tasks

### Add a new page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
```tsx
<Route path="/new" element={<NewPage />} />
```

### Add authentication to a route

Wrap with `ProtectedRoute`:
```tsx
<Route
  path="/protected"
  element={
    <ProtectedRoute>
      <ProtectedPage />
    </ProtectedRoute>
  }
/>
```

### Style with Tailwind

Use utility classes directly:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
  Content
</div>
```

Responsive design:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>
```

### Handle forms

Use FormField molecule:
```tsx
<FormField
  label="Email"
  id="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

## API Configuration

Backend URL is configured in `src/services/apiClient.ts`:
```tsx
const API_BASE_URL = 'http://localhost:5004';
```

Change this if your backend runs on a different port.

## Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

Preview production build:
```bash
npm run preview
```

## TypeScript

All components use TypeScript. Define props interfaces:

```tsx
interface ComponentProps {
  title: string;
  count: number;
  onClick: () => void;
  optional?: string;
}

export const Component: React.FC<ComponentProps> = ({
  title,
  count,
  onClick,
  optional
}) => {
  // ...
};
```

## Best Practices

### 1. Keep atoms simple and reusable
- No business logic
- Accept props for customization
- Use Tailwind for styling

### 2. Molecules should be presentational
- Combine atoms logically
- Pass data via props
- No API calls

### 3. Organisms handle logic
- Use custom hooks for data
- Manage local state
- Coordinate molecules

### 4. Pages orchestrate
- Use templates for layout
- Pass data to organisms
- Handle routing

### 5. Hooks for business logic
- Keep UI-agnostic
- Return data and actions
- Handle loading/error states

### 6. Services for API
- One service per domain
- Return typed responses
- Handle errors

## Debugging

### React DevTools
Install React DevTools browser extension to inspect component tree.

### Network Tab
Check API calls in browser DevTools Network tab.

### Console Logging
Add logs in hooks to debug data flow:
```tsx
useEffect(() => {
  console.log('Data changed:', data);
}, [data]);
```

## Common Issues

### Port already in use
```bash
# Kill process on port 5004
lsof -ti:5004 | xargs kill -9
```

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
Check `tsconfig.json` is properly configured and run:
```bash
npm run build
```

## Resources

- [Atomic Design by Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
