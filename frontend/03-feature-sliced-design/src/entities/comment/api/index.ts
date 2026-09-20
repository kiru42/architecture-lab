import { apiClient } from '../../../shared/api/client';
import { Comment, CreateCommentDto } from '../../../shared/types';

/**
 * Comments hang off their task: both listing and creating go through
 * `/tasks/{id}/comments`, and the create body is `{ content }` alone. Deletion
 * is the one place the contract exposes a top-level resource, `/comments/{id}`.
 */
export const commentApi = {
  async getByTask(taskId: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
  },

  async create(taskId: string, data: CreateCommentDto): Promise<Comment> {
    return apiClient.post<Comment>(`/tasks/${taskId}/comments`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/comments/${id}`);
  },
};