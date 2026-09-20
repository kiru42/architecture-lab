import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../adapters/out/persistence/prisma/prisma.service';
import {
  PrismaCommentRepository,
  PrismaProjectRepository,
  PrismaTaskRepository,
  PrismaUserRepository,
} from '../../adapters/out/persistence/prisma';
import { IUserRepository } from '../../domain/ports/secondary/user.repository.interface';
import { IProjectRepository } from '../../domain/ports/secondary/project.repository.interface';
import { ITaskRepository } from '../../domain/ports/secondary/task.repository.interface';
import { ICommentRepository } from '../../domain/ports/secondary/comment.repository.interface';

/**
 * Wires the driven (secondary) ports to their Prisma adapters.
 *
 * Each Symbol token below is the port; the class is the adapter. Nothing above
 * this line knows that Prisma exists.
 */
@Global()
@Module({
  providers: [
    PrismaService,
    { provide: IUserRepository, useClass: PrismaUserRepository },
    { provide: IProjectRepository, useClass: PrismaProjectRepository },
    { provide: ITaskRepository, useClass: PrismaTaskRepository },
    { provide: ICommentRepository, useClass: PrismaCommentRepository },
  ],
  exports: [
    PrismaService,
    IUserRepository,
    IProjectRepository,
    ITaskRepository,
    ICommentRepository,
  ],
})
export class PrismaModule {}
