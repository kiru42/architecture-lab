import { ICommentRepository } from '@domain/ports';
import { Comment } from '@domain/entities';
import { apiClient } from '../api/api-client';

/**
 * Comments hang off their task, so listing and creating go through
 * `/tasks/{id}/comments`. The create body is `{ content }` and nothing else:
 * the backend runs a validation pipe that rejects unknown fields with a 400.
 */
export class HttpCommentRepository implements ICommentRepository {
  async list(taskId: string, token: string): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/tasks/${taskId}/comments`, token);
  }

  async create(taskId: string, content: string, token: string): Promise<Comment> {
    return apiClient.post<Comment>(`/tasks/${taskId}/comments`, { content }, token);
  }

  async delete(id: string, token: string): Promise<void> {
    return apiClient.delete<void>(`/comments/${id}`, token);
  }
}