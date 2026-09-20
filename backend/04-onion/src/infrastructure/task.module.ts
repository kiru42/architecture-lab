import { Module } from '@nestjs/common';
import { TaskService } from '../core/application/services/task.service';
import { TasksController } from './web/controllers/tasks.controller';
import { PrismaModule } from './persistence/prisma.module';
import { ProjectModule } from './project.module';

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [TasksController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
