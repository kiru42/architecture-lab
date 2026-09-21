import { useCallback, useEffect, useState } from 'react';
import { Project } from '@domain/entities';
import { container } from '@infrastructure/di/container';

// The container hands out a fresh instance on every call; hoisting them keeps
// the references stable, which is what the callbacks below depend on.
const listProjectsUseCase = container.listProjectsUseCase();
const createProjectUseCase = container.createProjectUseCase();
const updateProjectUseCase = container.updateProjectUseCase();

/**
 * Presentation binding for the project use cases. It owns view state only —
 * loading flags and errors — and delegates every decision to the use cases.
 */
export function useProjects(token: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      setProjects(await listProjectsUseCase.execute(token));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createProject = useCallback(
    async (name: string) => {
      if (!token) return;
      await createProjectUseCase.execute(name, token);
      await refresh();
    },
    [token, refresh],
  );

  const updateProject = useCallback(
    async (id: string, data: Partial<Project>) => {
      if (!token) return;
      await updateProjectUseCase.execute(id, data, token);
      await refresh();
    },
    [token, refresh],
  );

  return { projects, isLoading, error, createProject, updateProject };
}
