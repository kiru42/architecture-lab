import { Module } from '@nestjs/common';
import { CommentController } from '../../adapters/in/http/comments/comment.controller';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  ListCommentsUseCase,
} from '../../application/use-cases';
import { PrismaModule } from '../infrastructure/prisma.module';
import { ICreateCommentUseCase } from '../../domain/ports/primary/create-comment.usecase.interface';
import { IListCommentsUseCase } from '../../domain/ports/primary/list-comments.usecase.interface';
import { IDeleteCommentUseCase } from '../../domain/ports/primary/delete-comment.usecase.interface';

@Module({
  imports: [PrismaModule],
  controllers: [CommentController],
  providers: [
    { provide: ICreateCommentUseCase, useClass: CreateCommentUseCase },
    { provide: IListCommentsUseCase, useClass: ListCommentsUseCase },
    { provide: IDeleteCommentUseCase, useClass: DeleteCommentUseCase },
  ],
})
export class CommentModule {}
