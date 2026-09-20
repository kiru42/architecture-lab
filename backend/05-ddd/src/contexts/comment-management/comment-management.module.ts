import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommentsController } from './infrastructure/http/comments.controller';
import { PrismaCommentRepository } from './infrastructure/persistence/prisma-comment.repository';
import { AddCommentHandler } from './application/commands/add-comment.handler';
import { DeleteCommentHandler } from './application/commands/delete-comment.handler';
import { GetCommentsHandler } from './application/queries/get-comments.handler';
import { ICommentRepository } from './domain/repositories/comment.repository';
import { ProjectManagementModule } from '../project-management/project-management.module';
import { TaskManagementModule } from '../task-management/task-management.module';

const CommandHandlers = [AddCommentHandler, DeleteCommentHandler];
const QueryHandlers = [GetCommentsHandler];

@Module({
  imports: [CqrsModule, ProjectManagementModule, TaskManagementModule],
  controllers: [CommentsController],
  providers: [
    { provide: ICommentRepository, useClass: PrismaCommentRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class CommentManagementModule {}
