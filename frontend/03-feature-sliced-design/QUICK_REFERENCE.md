# Feature-Sliced Design Quick Reference

## 🚀 Adding New Features

### 1. Adding a New Entity (e.g., "Team")

```bash
# Create entity structure
mkdir -p src/entities/team/{model,api}
```

**Step 1: Define types** (`shared/types/index.ts`)
```typescript
export interface Team {
  id: string;
  name: string;
  // ... other fields
}
```

**Step 2: Create API** (`entities/team/api/index.ts`)
```typescript
import { apiClient } from '../../../shared/api/client';
import { Team } from '../../../shared/types';

export const teamApi = {
  async getAll(): Promise<{ teams: Team[] }> {
    return apiClient.get('/teams');
  },
  // ... other methods
};
```

**Step 3: Create Store** (`entities/team/model/store.ts`)
```typescript
import { create } from 'zustand';
import { Team } from '../../../shared/types';

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  setTeams: (teams: Team[]) => void;
  // ... other actions
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  isLoading: false,
  error: null,
  setTeams: (teams) => set({ teams }),
  // ... other actions
}));
```

### 2. Adding a New Feature (e.g., "Team Settings")

```bash
# Create feature structure
mkdir -p src/features/team-settings/ui
```

**Create component** (`features/team-settings/ui/TeamSettingsForm.tsx`)
```typescript
import React, { useState } from 'react';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { teamApi } from '../../../entities/team/api';
import { useTeamStore } from '../../../entities/team/model/store';

export const TeamSettingsForm: React.FC = () => {
  const [name, setName] = useState('');
  const updateTeam = useTeamStore((state) => state.updateTeam);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await teamApi.update({ name });
    updateTeam(response.team);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Button type="submit">Save</Button>
    </form>
  );
};
```

### 3. Adding a New Widget

```bash
# Create widget file
touch src/widgets/TeamDashboard.tsx
```

**Compose features** (`widgets/TeamDashboard.tsx`)
```typescript
import React from 'react';
import { TeamList } from '../features/teams/ui/TeamList';
import { TeamSettingsForm } from '../features/team-settings/ui/TeamSettingsForm';
import { Card } from '../shared/ui/Card';

export const TeamDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <h2>Team Settings</h2>
        <TeamSettingsForm />
      </Card>
      <Card>
        <h2>Team Members</h2>
        <TeamList />
      </Card>
    </div>
  );
};
```

### 4. Adding a New Page

```bash
# Create page structure
mkdir -p src/pages/teams
touch src/pages/teams/index.tsx
```

**Create page** (`pages/teams/index.tsx`)
```typescript
import React from 'react';
import { TeamDashboard } from '../../widgets/TeamDashboard';

const TeamsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Teams</h1>
      <TeamDashboard />
    </div>
  );
};

export default TeamsPage;
```

**Add route** (`app/App.tsx`)
```typescript
import TeamsPage from '../pages/teams';

// In Routes:
<Route
  path="/teams"
  element={
    <ProtectedRoute>
      <TeamsPage />
    </ProtectedRoute>
  }
/>
```

## 🎯 Common Patterns

### Fetching Data on Mount

```typescript
import { useEffect } from 'react';
import { useProjectStore } from '../entities/project/model/store';
import { projectApi } from '../entities/project/api';

export const ProjectList: React.FC = () => {
  const { projects, setProjects, setLoading } = useProjectStore();

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const response = await projectApi.getAll();
        setProjects(response.projects);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [setProjects, setLoading]);

  return <div>{/* Render projects */}</div>;
};
```

### Form with Validation

```typescript
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!title.trim()) {
    setError('Title is required');
    return;
  }

  setError('');
  setLoading(true);

  try {
    const response = await taskApi.create({ title });
    addTask(response.task);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed');
  } finally {
    setLoading(false);
  }
};
```

### Delete with Confirmation

```typescript
const handleDelete = async () => {
  if (!confirm('Are you sure?')) return;

  setLoading(true);
  try {
    await projectApi.delete(id);
    removeProject(id);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### Conditional Rendering

```typescript
if (isLoading) {
  return <div>Loading...</div>;
}

if (error) {
  return <div>Error: {error}</div>;
}

if (projects.length === 0) {
  return <div>No projects found</div>;
}

return <div>{/* Render projects */}</div>;
```

## 📐 Layer Import Rules

### ✅ Allowed
```typescript
// Higher → Lower
import { Button } from '../../../shared/ui/Button';           // ✅ feature → shared
import { useProjectStore } from '../../../entities/project';   // ✅ feature → entities
import { ProjectItem } from '../features/projects/ui';         // ✅ widget → feature

// Same layer, different slice
import { useUserStore } from '../user/model/store';           // ✅ entity → entity
import { SignInForm } from '../auth/ui/SignInForm';           // ✅ feature → feature
```

### ❌ Forbidden
```typescript
// Lower → Higher
import { ProjectList } from '../widgets/ProjectList';         // ❌ entity → widget
import { ProjectsPage } from '../pages/projects';             // ❌ feature → page

// Circular dependencies
import { ProjectItem } from '../features/projects/ui';
// if ProjectItem imports back → ❌
```

## 🗂️ File Organization

### Naming Conventions
- **Components**: `PascalCase.tsx`
- **Stores**: `store.ts`
- **API modules**: `index.ts`
- **Pages**: `index.tsx` (for route matching)

### Folder Structure
```
entity-name/
├── model/
│   └── store.ts          # Zustand store
├── api/
│   └── index.ts          # API calls
└── ui/ (optional)
    └── Component.tsx     # Entity-specific UI
```

```
feature-name/
├── ui/
│   ├── Form.tsx          # Create/edit form
│   └── Item.tsx          # List item component
├── model/ (optional)
│   └── hooks.ts          # Feature-specific hooks
└── lib/ (optional)
    └── helpers.ts        # Feature-specific utils
```

## 🔍 Debugging Tips

### Check Zustand State
```typescript
// In component
const state = useProjectStore();
console.log('Projects:', state.projects);
console.log('Loading:', state.isLoading);
```

### Network Debugging
```typescript
// shared/api/client.ts
async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log('API Request:', endpoint, options);  // Add this
  const response = await fetch(url, config);
  console.log('API Response:', response.status);   // Add this
  // ...
}
```

### Route Debugging
```typescript
// app/App.tsx
import { useLocation } from 'react-router-dom';

function DebugRouter() {
  const location = useLocation();
  console.log('Current route:', location.pathname);
  return null;
}

// Add in Routes
<DebugRouter />
```

## 🧪 Testing Pattern

### Entity Store Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useProjectStore } from './store';

test('adds project', () => {
  const { result } = renderHook(() => useProjectStore());
  
  act(() => {
    result.current.addProject({ id: '1', name: 'Test' });
  });
  
  expect(result.current.projects).toHaveLength(1);
});
```

### Feature Component Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectForm } from './ProjectForm';

test('submits form', async () => {
  render(<ProjectForm />);
  
  const input = screen.getByLabelText('Project Name');
  fireEvent.change(input, { target: { value: 'New Project' } });
  
  const button = screen.getByText('Create Project');
  fireEvent.click(button);
  
  // Assert API call or state change
});
```

## 📦 Bundle Optimization

### Lazy Loading Pages
```typescript
// app/App.tsx
import { lazy, Suspense } from 'react';

const ProjectsPage = lazy(() => import('../pages/projects'));
const TasksPage = lazy(() => import('../pages/tasks/[projectId]'));

// In Routes:
<Route
  path="/projects"
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectsPage />
    </Suspense>
  }
/>
```

### Code Splitting by Route
Each page is automatically split when using `lazy()`.

## 🎨 Styling Best Practices

### Use Tailwind Utilities
```typescript
// ✅ Good
<div className="flex justify-between items-center">

// ❌ Avoid inline styles
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
```

### Component Variants
```typescript
// shared/ui/Button.tsx
const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700',
  secondary: 'bg-gray-200 hover:bg-gray-300',
  danger: 'bg-red-600 hover:bg-red-700',
};
```

## 🚨 Common Mistakes

### ❌ Don't do this
```typescript
// Business logic in shared layer
export const calculateTotal = (projects: Project[]) => { /* ... */ }  // ❌

// Importing up the layer hierarchy
import { ProjectList } from '../../widgets/ProjectList';  // ❌ in entity

// Mixing concerns
export const ProjectFormWithAPI = () => {
  const [data, setData] = useState();
  useEffect(() => { fetch('/api/projects'); }, []);  // ❌ API in UI
};
```

### ✅ Do this instead
```typescript
// Business logic in entities
export const useProjectCalculations = () => { /* ... */ }  // ✅

// Import down or same level
import { Button } from '../../../shared/ui/Button';  // ✅

// Separate API from UI
const { projects } = useProjectStore();  // ✅ Use store in UI
// API calls in entities/project/api/index.ts
```

## 📚 Resources

- **FSD Official**: https://feature-sliced.design/
- **Zustand Docs**: https://zustand-demo.pmnd.rs/
- **React Router**: https://reactrouter.com/
- **Tailwind CSS**: https://tailwindcss.com/

## 💡 Pro Tips

1. **Keep features small** - One feature = one user action
2. **Don't over-abstract** - Wait until you need it 3 times
3. **Use TypeScript** - Catch errors at compile time
4. **Test user flows** - Not implementation details
5. **Document decisions** - Future you will thank you

---

**Happy coding with FSD! 🎉**
