import { Comment } from '../aggregates/comment.aggregate';
import { CommentId } from '../value-objects/comment-id.vo';

export interface ICommentRepository {
  save(comment: Comment): Promise<void>;
  findById(id: CommentId): Promise<Comment | null>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  delete(id: CommentId): Promise<void>;
}

/** DI token. The interface is the port; this Symbol is how Nest finds it. */
export const ICommentRepository = Symbol('ICommentRepository');
