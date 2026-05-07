import { Module } from '@nestjs/common';
import { CreateProjectUseCase, ListProjectsUseCase } from '../../core/application';
import { ProjectsController } from './projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [CreateProjectUseCase, ListProjectsUseCase],
})
export class ProjectsModule {}
