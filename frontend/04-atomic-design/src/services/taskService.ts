import { Task } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Tasks live under their project in the contract: both listing and creating go
 * through `/projects/{id}/tasks`. There is no top-level `/tasks` collection, and
 * no `DELETE /tasks/{id}`.
 */
export const taskService = {
  async getTasks(projectId: string): Promise<Task[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }
    return response.json();
  },

  async createTask(title: string, description: string, projectId: string): Promise<Task> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description }),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
    return response.json();
  },

  async updateTask(
    id: string,
    data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Task> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    return response.json();
  },
};