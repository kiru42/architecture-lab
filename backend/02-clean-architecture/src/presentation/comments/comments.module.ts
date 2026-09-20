import { Module } from '@nestjs/common';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
} from '../../core/application';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [CommentsController],
  providers: [CreateCommentUseCase, ListCommentsUseCase, DeleteCommentUseCase],
})
export class CommentsModule {}
