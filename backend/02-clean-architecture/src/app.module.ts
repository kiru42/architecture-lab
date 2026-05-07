import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './presentation/auth/auth.module';
import { ProjectsModule } from './presentation/projects/projects.module';
import { TasksModule } from './presentation/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
})
export class AppModule {}
