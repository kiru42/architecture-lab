import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { DeleteCommentCommand } from './delete-comment.command';
import {
  ICommentRepository,
  ICommentRepository as ICommentRepositoryToken,
} from '../../domain/repositories/comment.repository';
import { CommentId } from '../../domain/value-objects/comment-id.vo';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject(ICommentRepositoryToken) private readonly repo: ICommentRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.repo.findById(CommentId.create(command.commentId));
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!comment.isAuthoredBy(command.userId)) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.repo.delete(comment.getId());
  }
}
