import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommentDto } from './comment.dto';
import { AddCommentCommand } from '../../application/commands/add-comment.command';
import { DeleteCommentCommand } from '../../application/commands/delete-comment.command';
import { GetCommentsQuery } from '../../application/queries/get-comments.query';
import { Comment } from '../../domain/aggregates/comment.aggregate';
import { JwtAuthGuard } from '../../../../shared-kernel/infrastructure/http/jwt-auth.guard';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/http/current-user.decorator';

/** The aggregate is shaped like the frozen Comment schema, so this is a 1:1 map. */
function toResponse(comment: Comment) {
  return {
    id: comment.getId().getValue(),
    content: comment.getContent().getValue(),
    taskId: comment.getTaskId(),
    authorId: comment.getAuthorId(),
    createdAt: comment.getCreatedAt(),
    updatedAt: comment.getUpdatedAt(),
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('tasks/:id/comments')
  async list(@Param('id') taskId: string, @CurrentUser('userId') userId: string) {
    const comments: Comment[] = await this.queryBus.execute(new GetCommentsQuery(taskId, userId));
    return comments.map(toResponse);
  }

  @Post('tasks/:id/comments')
  async create(
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const comment: Comment = await this.commandBus.execute(
      new AddCommentCommand(dto.content, taskId, userId),
    );
    return toResponse(comment);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }
}
