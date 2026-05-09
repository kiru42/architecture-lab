import { Project } from '../types';

const API_BASE = 'http://localhost:5001/api';

export const projectService = {
  async getProjects(): Promise<{ projects: Project[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    return response.json();
  },

  async createProject(name: string): Promise<{ project: Project }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error('Failed to create project');
    }
    return response.json();
  },

  async updateProject(id: string, data: { name?: string; archived?: boolean }): Promise<{ project: Project }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update project');
    }
    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete project');
    }
  },
};
