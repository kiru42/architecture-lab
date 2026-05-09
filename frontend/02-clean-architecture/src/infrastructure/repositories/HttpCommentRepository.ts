import { ICommentRepository } from '@domain/ports';
import { Comment } from '@domain/entities';
import { apiClient } from '../api/api-client';

export class HttpCommentRepository implements ICommentRepository {
  async list(taskId: string, token: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/comments?taskId=${taskId}`, token);
  }

  async create(data: { content: string; taskId: string }, token: string): Promise<Comment> {
    return apiClient.post<Comment>('/comments', data, token);
  }

  async delete(id: string, token: string): Promise<void> {
    return apiClient.delete<void>(`/comments/${id}`, token);
  }
}
