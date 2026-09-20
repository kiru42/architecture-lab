import { Comment } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Comments hang off their task: `GET` and `POST` go through
 * `/tasks/{id}/comments`. The body is `{ content }` only — the backend runs a
 * validation pipe with `forbidNonWhitelisted`, so a stray `taskId` field is a
 * 400. Deletion is the one place the contract exposes a top-level resource,
 * `/comments/{id}`.
 */
export const commentService = {
  async getComments(taskId: string): Promise<Comment[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  async createComment(content: string, taskId: string): Promise<Comment> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
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
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },
};