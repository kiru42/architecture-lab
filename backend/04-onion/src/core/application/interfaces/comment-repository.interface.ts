import { Comment } from '../../domain/entities/comment.entity';

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  delete(id: string): Promise<void>;
}
