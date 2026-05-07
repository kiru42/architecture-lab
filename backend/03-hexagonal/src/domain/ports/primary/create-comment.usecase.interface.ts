import { Comment } from '../../model/comment.entity';

// Primary Port: Use case for creating a comment
export interface ICreateCommentUseCase {
  execute(content: string, taskId: string, userId: string): Promise<Comment>;
}

export const ICreateCommentUseCase = Symbol('ICreateCommentUseCase');
