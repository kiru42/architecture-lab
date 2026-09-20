import { Module } from '@nestjs/common';
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
} from '../../core/application';
import { ProjectsController } from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [CreateProjectUseCase, ListProjectsUseCase, UpdateProjectUseCase],
})
export class ProjectsModule {}
