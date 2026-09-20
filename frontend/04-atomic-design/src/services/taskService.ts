const API_URL = '/api';

export const taskService = {
  async getTasks(projectId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(title: string, description: string, projectId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, projectId }),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  // `any` here used to trip the strict lint gate; the shape is the caller's
  // business, we only forward it.
  async updateTask(id: string, data: unknown) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(id: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },
};
