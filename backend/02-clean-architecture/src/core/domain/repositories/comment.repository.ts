import { Comment } from '../entities/comment.entity';

export abstract class CommentRepository {
  abstract findById(id: string): Promise<Comment | null>;
  abstract findAllByTaskId(taskId: string): Promise<Comment[]>;
  abstract save(comment: Comment): Promise<Comment>;
  abstract delete(id: string): Promise<void>;
}
