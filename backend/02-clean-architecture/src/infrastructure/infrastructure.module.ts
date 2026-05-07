import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaProjectRepository } from './repositories/prisma-project.repository';
import { PrismaTaskRepository } from './repositories/prisma-task.repository';
import { UserRepository, ProjectRepository, TaskRepository } from '../core/domain';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: ProjectRepository,
      useClass: PrismaProjectRepository,
    },
    {
      provide: TaskRepository,
      useClass: PrismaTaskRepository,
    },
  ],
  exports: [
    PrismaService,
    UserRepository,
    ProjectRepository,
    TaskRepository,
  ],
})
export class InfrastructureModule {}
