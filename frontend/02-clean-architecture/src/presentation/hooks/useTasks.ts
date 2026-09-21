import { useCallback, useEffect, useState } from 'react';
import { Task } from '@domain/entities';
import { container } from '@infrastructure/di/container';

const listTasksUseCase = container.listTasksUseCase();
const createTaskUseCase = container.createTaskUseCase();
const updateTaskUseCase = container.updateTaskUseCase();
const toggleTaskCompletionUseCase = container.toggleTaskCompletionUseCase();

/**
 * Tasks are scoped to a project: with no project selected there is nothing to
 * list, so the hook empties the list instead of fetching `/projects//tasks`.
 */
export function useTasks(projectId: string | null, token: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!projectId || !token) {
      setTasks([]);
      return;
    }
    setIsLoading(true);
    try {
      setTasks(await listTasksUseCase.execute(projectId, token));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (data: Partial<Task>) => {
      if (!projectId || !token) return;
      await createTaskUseCase.execute(projectId, data, token);
      await refresh();
    },
    [projectId, token, refresh],
  );

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      if (!token) return;
      await updateTaskUseCase.execute(id, data, token);
      await refresh();
    },
    [token, refresh],
  );

  // Completion goes through its own use case, which reads the current state
  // rather than trusting a value computed by the view.
  const toggleTaskCompletion = useCallback(
    async (task: Task) => {
      if (!token) return;
      await toggleTaskCompletionUseCase.execute(task, token);
      await refresh();
    },
    [token, refresh],
  );

  return { tasks, isLoading, error, createTask, updateTask, toggleTaskCompletion };
}
