import { Inject, Injectable } from '@nestjs/common';
import { IDeleteCommentUseCase } from '@domain/ports/primary/delete-comment.usecase.interface';
import {
  ICommentRepository,
  ICommentRepository as ICommentRepositoryToken,
} from '@domain/ports/secondary/comment.repository.interface';

@Injectable()
export class DeleteCommentUseCase implements IDeleteCommentUseCase {
  constructor(
    @Inject(ICommentRepositoryToken)
    private readonly commentRepository: ICommentRepository,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    // Repository will handle authorization (only author can delete)
    await this.commentRepository.delete(id, userId);
  }
}
