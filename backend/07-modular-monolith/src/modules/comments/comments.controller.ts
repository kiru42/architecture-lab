import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:taskId/comments')
  list(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.listByTask(taskId, user.id);
  }

  @Post('tasks/:taskId/comments')
  create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, user.id, dto.content);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.delete(id, user.id);
  }
}
