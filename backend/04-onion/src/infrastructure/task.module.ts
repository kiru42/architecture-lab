import { Module } from '@nestjs/common';
import { TaskService } from '../core/application/services/task.service';
import { ITaskRepository } from '../core/application/interfaces/task-repository.interface';
import { IProjectRepository } from '../core/application/interfaces/project-repository.interface';
import { IUserRepository } from '../core/application/interfaces/user-repository.interface';
import { PrismaTaskRepository } from './persistence/prisma/task.repository';
import { PrismaProjectRepository } from './persistence/prisma/project.repository';
import { PrismaUserRepository } from './persistence/prisma/user.repository';
import { TasksController } from './web/controllers/tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [
    TaskService,
    { provide: 'ITaskRepository', useClass: PrismaTaskRepository },
    { provide: 'IProjectRepository', useClass: PrismaProjectRepository },
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
  ],
  exports: [TaskService],
})
export class TaskModule {}
