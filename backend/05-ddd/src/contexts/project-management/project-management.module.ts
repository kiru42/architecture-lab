import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectsController } from './infrastructure/http/projects.controller';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import { CreateProjectHandler } from './application/commands/create-project.handler';
import { UpdateProjectHandler } from './application/commands/update-project.handler';
import { GetProjectsHandler } from './application/queries/get-projects.handler';
import { IProjectRepository } from './domain/repositories/project.repository';

const CommandHandlers = [CreateProjectHandler, UpdateProjectHandler];
const QueryHandlers = [GetProjectsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProjectsController],
  providers: [
    { provide: IProjectRepository, useClass: PrismaProjectRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [IProjectRepository],
})
export class ProjectManagementModule {}
