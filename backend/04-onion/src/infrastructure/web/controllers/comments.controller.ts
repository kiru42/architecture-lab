import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '../../../core/application/services/comment.service';
import { CreateCommentDto } from '../dto/comment.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { Comment } from '../../../core/domain/entities/comment.entity';

/** Comments and the API contract's Comment schema have the same shape. */
function toResponse(comment: Comment) {
  return {
    id: comment.id,
    content: comment.content,
    taskId: comment.taskId,
    authorId: comment.authorId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentService: CommentService) {}

  @Get('tasks/:id/comments')
  async list(@Param('id') taskId: string, @CurrentUser('userId') userId: string) {
    const comments = await this.commentService.listByTask(taskId, userId);
    return comments.map(toResponse);
  }

  @Post('tasks/:id/comments')
  async create(
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const comment = await this.commentService.create(dto.content, taskId, userId);
    return toResponse(comment);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<void> {
    await this.commentService.delete(id, userId);
  }
}
