import { Comment } from '../../model/comment.entity';

// Secondary Port: Repository interface for Comment persistence
export interface ICommentRepository {
  create(content: string, taskId: string, authorId: string): Promise<Comment>;
  findByTaskId(taskId: string): Promise<Comment[]>;
  delete(id: string, authorId: string): Promise<void>;
}

// DI token for dependency injection
export const ICommentRepository = Symbol('ICommentRepository');
