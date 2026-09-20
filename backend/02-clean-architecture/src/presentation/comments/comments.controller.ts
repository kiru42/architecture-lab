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
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
} from '../../core/application';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly listCommentsUseCase: ListCommentsUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  @Get('tasks/:id/comments')
  async list(@CurrentUser() user: CurrentUserData, @Param('id') taskId: string) {
    return this.listCommentsUseCase.execute({ taskId, userId: user.userId });
  }

  @Post('tasks/:id/comments')
  async create(
    @CurrentUser() user: CurrentUserData,
    @Param('id') taskId: string,
    @Body() body: { content: string },
  ) {
    return this.createCommentUseCase.execute({
      content: body.content,
      taskId,
      userId: user.userId,
    });
  }

  @Delete('comments/:id')
  @HttpCode(204)
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') commentId: string) {
    await this.deleteCommentUseCase.execute({ commentId, userId: user.userId });
  }
}
