import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto } from './comment.dto';
import { ICreateCommentUseCase } from '../../../../domain/ports/primary/create-comment.usecase.interface';
import { IListCommentsUseCase } from '../../../../domain/ports/primary/list-comments.usecase.interface';
import { IDeleteCommentUseCase } from '../../../../domain/ports/primary/delete-comment.usecase.interface';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(
    @Inject(ICreateCommentUseCase) private readonly createComment: ICreateCommentUseCase,
    @Inject(IListCommentsUseCase) private readonly listComments: IListCommentsUseCase,
    @Inject(IDeleteCommentUseCase) private readonly deleteComment: IDeleteCommentUseCase,
  ) {}

  @Get('tasks/:id/comments')
  async list(@Param('id') taskId: string, @CurrentUser('userId') userId: string) {
    return this.listComments.execute(taskId, userId);
  }

  @Post('tasks/:id/comments')
  async create(
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.createComment.execute(dto.content, taskId, userId);
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string): Promise<void> {
    await this.deleteComment.execute(id, userId);
  }
}
