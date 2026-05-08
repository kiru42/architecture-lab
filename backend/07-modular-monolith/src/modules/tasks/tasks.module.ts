import { Module } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';

@Module({
  controllers: [TasksController],
  providers: [TasksRepository, TasksService],
})
export class TasksModule {}
