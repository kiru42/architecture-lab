import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';
import { TasksController } from './infrastructure/http/tasks.controller';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma-task.repository';
import { CreateTaskHandler } from './application/commands/create-task.handler';
import { CompleteTaskHandler } from './application/commands/complete-task.handler';
import { GetTasksHandler } from './application/queries/get-tasks.handler';

const CommandHandlers = [CreateTaskHandler, CompleteTaskHandler];
const QueryHandlers = [GetTasksHandler];

@Module({
  imports: [CqrsModule],
  controllers: [TasksController],
  providers: [
    PrismaClient,
    { provide: 'ITaskRepository', useClass: PrismaTaskRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class TaskManagementModule {}
