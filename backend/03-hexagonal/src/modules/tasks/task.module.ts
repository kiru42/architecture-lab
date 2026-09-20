import { Module } from '@nestjs/common';
import { TaskController } from '../../adapters/in/http/tasks/task.controller';
import {
  CreateTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
} from '../../application/use-cases';
import { PrismaModule } from '../infrastructure/prisma.module';
import { ICreateTaskUseCase } from '../../domain/ports/primary/create-task.usecase.interface';
import { IListTasksUseCase } from '../../domain/ports/primary/list-tasks.usecase.interface';
import { IUpdateTaskUseCase } from '../../domain/ports/primary/update-task.usecase.interface';

@Module({
  imports: [PrismaModule],
  controllers: [TaskController],
  providers: [
    { provide: ICreateTaskUseCase, useClass: CreateTaskUseCase },
    { provide: IListTasksUseCase, useClass: ListTasksUseCase },
    { provide: IUpdateTaskUseCase, useClass: UpdateTaskUseCase },
  ],
})
export class TaskModule {}
