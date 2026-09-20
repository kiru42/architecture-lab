import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TasksController } from './infrastructure/http/tasks.controller';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskHandler } from './application/commands/create-task.handler';
import { UpdateTaskHandler } from './application/commands/update-task.handler';
import { GetTasksHandler } from './application/queries/get-tasks.handler';
import { ITaskRepository } from './domain/repositories/task.repository';
import { ProjectManagementModule } from '../project-management/project-management.module';

const CommandHandlers = [CreateTaskHandler, UpdateTaskHandler];
const QueryHandlers = [GetTasksHandler];

@Module({
  imports: [CqrsModule, ProjectManagementModule],
  controllers: [TasksController],
  providers: [
    { provide: ITaskRepository, useClass: PrismaTaskRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ITaskRepository],
})
export class TaskManagementModule {}
