import { Module } from '@nestjs/common';
import { TaskController } from '../../adapters/in/http/tasks/task.controller';
import { CreateTaskUseCase, AssignTaskUseCase, ListTasksByProjectUseCase } from '../../application';
import { PrismaModule } from '../infrastructure/prisma.module';

export const CREATE_TASK_PORT = 'CreateTaskPort';
export const ASSIGN_TASK_PORT = 'AssignTaskPort';
export const LIST_TASKS_BY_PROJECT_PORT = 'ListTasksByProjectPort';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [
    {
      provide: CREATE_TASK_PORT,
      useClass: CreateTaskUseCase,
    },
    {
      provide: ASSIGN_TASK_PORT,
      useClass: AssignTaskUseCase,
    },
    {
      provide: LIST_TASKS_BY_PROJECT_PORT,
      useClass: ListTasksByProjectUseCase,
    },
  ],
})
export class TaskModule {}
