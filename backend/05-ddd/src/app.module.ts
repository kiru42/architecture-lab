import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared-kernel/infrastructure/prisma.module';
import { UserManagementModule } from './contexts/user-management/user-management.module';
import { ProjectManagementModule } from './contexts/project-management/project-management.module';
import { TaskManagementModule } from './contexts/task-management/task-management.module';
import { CommentManagementModule } from './contexts/comment-management/comment-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    UserManagementModule,
    ProjectManagementModule,
    TaskManagementModule,
    CommentManagementModule,
  ],
})
export class AppModule {}
