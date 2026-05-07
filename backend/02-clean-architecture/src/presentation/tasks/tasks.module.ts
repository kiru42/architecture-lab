import { Module } from '@nestjs/common';
import { CreateTaskUseCase, AssignTaskUseCase } from '../../core/application';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [CreateTaskUseCase, AssignTaskUseCase],
})
export class TasksModule {}
