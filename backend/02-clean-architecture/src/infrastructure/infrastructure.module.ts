import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaProjectRepository } from './repositories/prisma-project.repository';
import { PrismaTaskRepository } from './repositories/prisma-task.repository';
import { PrismaCommentRepository } from './repositories/prisma-comment.repository';
import {
  CommentRepository,
  ProjectRepository,
  TaskRepository,
  UserRepository,
} from '../core/domain';

/** Binds every driven port (the abstract repository classes) to its Prisma adapter. */
@Global()
@Module({
  providers: [
    PrismaService,
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: ProjectRepository, useClass: PrismaProjectRepository },
    { provide: TaskRepository, useClass: PrismaTaskRepository },
    { provide: CommentRepository, useClass: PrismaCommentRepository },
  ],
  exports: [PrismaService, UserRepository, ProjectRepository, TaskRepository, CommentRepository],
})
export class InfrastructureModule {}
