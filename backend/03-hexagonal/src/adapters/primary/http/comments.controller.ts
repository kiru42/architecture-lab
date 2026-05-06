import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/comment.dto';
import {
  ICreateCommentUseCase,
  ICreateCommentUseCase as ICreateCommentUseCaseToken,
} from '@domain/ports/primary/create-comment.usecase.interface';
import {
  IListCommentsUseCase,
  IListCommentsUseCase as IListCommentsUseCaseToken,
} from '@domain/ports/primary/list-comments.usecase.interface';
import {
  IDeleteCommentUseCase,
  IDeleteCommentUseCase as IDeleteCommentUseCaseToken,
} from '@domain/ports/primary/delete-comment.usecase.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    @Inject(ICreateCommentUseCaseToken)
    private readonly createCommentUseCase: ICreateCommentUseCase,
    @Inject(IListCommentsUseCaseToken)
    private readonly listCommentsUseCase: IListCommentsUseCase,
    @Inject(IDeleteCommentUseCaseToken)
    private readonly deleteCommentUseCase: IDeleteCommentUseCase,
  ) {}

  @Get('tasks/:id/comments')
  async list(@Request() req, @Param('id') taskId: string) {
    return await this.listCommentsUseCase.execute(taskId, req.user.userId);
  }

  @Post('tasks/:id/comments')
  async create(
    @Request() req,
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.createCommentUseCase.execute(
      dto.content,
      taskId,
      req.user.userId,
    );
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async delete(@Request() req, @Param('id') id: string) {
    await this.deleteCommentUseCase.execute(id, req.user.userId);
  }
}
