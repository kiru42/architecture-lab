import { useCallback, useEffect, useState } from 'react';
import { Task } from '../types';
import { taskService } from '../services/taskService';

export function useTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { tasks } = await taskService.getTasks(projectId);
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (title: string, description: string, projectId: string) => {
    try {
      const { task } = await taskService.createTask(title, description, projectId);
      setTasks((prev) => [...prev, task]);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const { task } = await taskService.updateTask(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
      return task;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask, refetch: loadTasks };
}
