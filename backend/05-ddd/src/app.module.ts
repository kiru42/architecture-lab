import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserManagementModule } from './contexts/user-management/user-management.module';
import { ProjectManagementModule } from './contexts/project-management/project-management.module';
import { TaskManagementModule } from './contexts/task-management/task-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    UserManagementModule,
    ProjectManagementModule,
    TaskManagementModule,
  ],
})
export class AppModule {}
