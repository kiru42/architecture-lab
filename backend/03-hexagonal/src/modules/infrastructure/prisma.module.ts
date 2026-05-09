import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../../adapters/out/persistence/prisma/prisma.service';
import {
  PrismaUserRepository,
  PrismaProjectRepository,
  PrismaTaskRepository,
} from '../../adapters/out/persistence/prisma';

// Port tokens
export const USER_REPOSITORY_PORT = 'UserRepositoryPort';
export const PROJECT_REPOSITORY_PORT = 'ProjectRepositoryPort';
export const TASK_REPOSITORY_PORT = 'TaskRepositoryPort';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: USER_REPOSITORY_PORT,
      useClass: PrismaUserRepository,
    },
    {
      provide: PROJECT_REPOSITORY_PORT,
      useClass: PrismaProjectRepository,
    },
    {
      provide: TASK_REPOSITORY_PORT,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [PrismaService, USER_REPOSITORY_PORT, PROJECT_REPOSITORY_PORT, TASK_REPOSITORY_PORT],
})
export class PrismaModule {}
