import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './prisma/user.repository';
import { PrismaProjectRepository } from './prisma/project.repository';
import { PrismaTaskRepository } from './prisma/task.repository';
import { PrismaCommentRepository } from './prisma/comment.repository';

/**
 * Onion layer: Infrastructure.
 *
 * Binds every driven port to its Prisma implementation. The application layer
 * only ever sees the interface; nothing above this line imports @prisma/client.
 */
@Global()
@Module({
  providers: [
    { provide: PrismaClient, useClass: PrismaService },
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
    { provide: 'IProjectRepository', useClass: PrismaProjectRepository },
    { provide: 'ITaskRepository', useClass: PrismaTaskRepository },
    { provide: 'ICommentRepository', useClass: PrismaCommentRepository },
  ],
  exports: [
    PrismaClient,
    'IUserRepository',
    'IProjectRepository',
    'ITaskRepository',
    'ICommentRepository',
  ],
})
export class PrismaModule {}
