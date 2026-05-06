import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/auth.types';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get('tasks/:id/comments')
  async listComments(@CurrentUser() user: AuthenticatedUser, @Param('id') taskId: string) {
    return this.commentsService.listComments(user.id, taskId);
  }

  @Post('tasks/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') taskId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, taskId, dto);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@CurrentUser() user: AuthenticatedUser, @Param('id') commentId: string) {
    return this.commentsService.deleteComment(user.id, commentId);
  }
}
