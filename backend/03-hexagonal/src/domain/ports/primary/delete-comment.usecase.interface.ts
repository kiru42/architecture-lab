// Primary Port: Use case for deleting a comment
export interface IDeleteCommentUseCase {
  execute(id: string, userId: string): Promise<void>;
}

export const IDeleteCommentUseCase = Symbol('IDeleteCommentUseCase');
