import { Module } from '@nestjs/common';
import { ProjectController } from '../../adapters/in/http/projects/project.controller';
import { CreateProjectUseCase, ListProjectsUseCase } from '../../application';
import { PrismaModule } from '../infrastructure/prisma.module';

export const CREATE_PROJECT_PORT = 'CreateProjectPort';
export const LIST_PROJECTS_PORT = 'ListProjectsPort';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    {
      provide: CREATE_PROJECT_PORT,
      useClass: CreateProjectUseCase,
    },
    {
      provide: LIST_PROJECTS_PORT,
      useClass: ListProjectsUseCase,
    },
  ],
})
export class ProjectModule {}
