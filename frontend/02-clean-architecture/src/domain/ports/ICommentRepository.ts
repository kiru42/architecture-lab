import { Comment } from '../entities';

export interface ICommentRepository {
  list(taskId: string, token: string): Promise<Comment[]>;
  create(data: { content: string; taskId: string }, token: string): Promise<Comment>;
  delete(id: string, token: string): Promise<void>;
}
