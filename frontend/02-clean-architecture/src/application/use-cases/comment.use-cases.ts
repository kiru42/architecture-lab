import { ICommentRepository } from '@domain/ports';
import { Comment } from '@domain/entities';

export class ListCommentsUseCase {
  constructor(private commentRepo: ICommentRepository) {}
  async execute(taskId: string, token: string): Promise<Comment[]> {
    return this.commentRepo.list(taskId, token);
  }
}

export class CreateCommentUseCase {
  constructor(private commentRepo: ICommentRepository) {}
  async execute(content: string, taskId: string, token: string): Promise<Comment> {
    return this.commentRepo.create(taskId, content, token);
  }
}

export class DeleteCommentUseCase {
  constructor(private commentRepo: ICommentRepository) {}
  async execute(id: string, token: string): Promise<void> {
    return this.commentRepo.delete(id, token);
  }
}