import { Module } from '@nestjs/common';
import {
  AssignTaskUseCase,
  CreateTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
} from '../../core/application';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [CreateTaskUseCase, ListTasksUseCase, AssignTaskUseCase, UpdateTaskUseCase],
})
export class TasksModule {}
