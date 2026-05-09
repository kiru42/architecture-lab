const API_URL = '/api';

export const commentService = {
  async getComments(taskId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/comments?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch comments');
    return res.json();
  },

  async createComment(content: string, taskId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, taskId }),
    });
    if (!res.ok) throw new Error('Failed to create comment');
    return res.json();
  },

  async deleteComment(id: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete comment');
  },
};
