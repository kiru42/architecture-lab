import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../../domain';
import { DeleteCommentDto } from '../dtos/comment.dto';

@Injectable()
export class DeleteCommentUseCase {
  constructor(private readonly commentRepository: CommentRepository) {}

  async execute(dto: DeleteCommentDto): Promise<void> {
    const comment = await this.commentRepository.findById(dto.commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!comment.isAuthoredBy(dto.userId)) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    await this.commentRepository.delete(dto.commentId);
  }
}
