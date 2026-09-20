import { Comment } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const commentService = {
  async getComments(taskId: string): Promise<{ comments: Comment[] }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  async createComment(content: string, taskId: string): Promise<{ comment: Comment }> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content, taskId }),
    });
    if (!response.ok) {
      throw new Error('Failed to create comment');
    }
    return response.json();
  },

  async deleteComment(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },
};
