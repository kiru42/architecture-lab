import { apiClient } from '../../../shared/api/client';
import { Comment, CreateCommentDto } from '../../../shared/types';

export const commentApi = {
  async getByTask(taskId: string): Promise<{ comments: Comment[] }> {
    return apiClient.get<{ comments: Comment[] }>(`/comments?taskId=${taskId}`);
  },

  async create(data: CreateCommentDto): Promise<{ comment: Comment }> {
    return apiClient.post<{ comment: Comment }>('/comments', data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/comments/${id}`);
  },
};
