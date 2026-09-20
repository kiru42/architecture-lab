import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import {
  AddCommentCommand,
  DeleteCommentCommand,
} from '../../write-side/commands/comment.commands';
import { GetCommentsQuery } from '../../read-side/queries/comment.queries';
import { CommentReadModel } from '../../read-side/projections/comment-read-model';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

function toResponse(comment: CommentReadModel) {
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
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('tasks/:id/comments')
  async list(@Param('id') taskId: string, @CurrentUser('userId') userId: string) {
    const comments: CommentReadModel[] = await this.queryBus.execute(
      new GetCommentsQuery(taskId, userId),
    );
    return comments.map(toResponse);
  }

  @Post('tasks/:id/comments')
  async create(
    @Param('id') taskId: string,
    @Body() dto: { content: string },
    @CurrentUser('userId') userId: string,
  ) {
    const commentId = uuid();
    await this.commandBus.execute(new AddCommentCommand(commentId, dto.content, taskId, userId));

    const comments: CommentReadModel[] = await this.queryBus.execute(
      new GetCommentsQuery(taskId, userId),
    );
    return toResponse(comments.find((c) => c.id === commentId)!);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(id, userId));
  }
}
