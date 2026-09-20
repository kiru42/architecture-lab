import { Project } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * The contract returns bare payloads: an array for a collection, the resource
 * itself for a create or an update. There is no `{ project }` envelope, and
 * destructuring one is how a list silently becomes `undefined`.
 *
 * There is also no `DELETE /projects/{id}` in shared/openapi.yaml, so this
 * service does not pretend to offer one.
 */
export const projectService = {
  async getProjects(): Promise<Project[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async createProject(name: string): Promise<Project> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  async updateProject(id: string, data: { name?: string; archived?: boolean }): Promise<Project> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },
};