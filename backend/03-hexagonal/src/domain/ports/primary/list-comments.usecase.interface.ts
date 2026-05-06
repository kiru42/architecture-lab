import { Comment } from '../../model/comment.entity';

// Primary Port: Use case for listing comments
export interface IListCommentsUseCase {
  execute(taskId: string, userId: string): Promise<Comment[]>;
}

export const IListCommentsUseCase = Symbol('IListCommentsUseCase');
