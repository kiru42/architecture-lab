import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './modules/infrastructure/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/projects/project.module';
import { TaskModule } from './modules/tasks/task.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ProjectModule, TaskModule],
})
export class AppModule {}
