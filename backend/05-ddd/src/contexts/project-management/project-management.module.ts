import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';
import { ProjectsController } from './infrastructure/http/projects.controller';
import { PrismaProjectRepository } from './infrastructure/persistence/prisma-project.repository';
import { CreateProjectHandler } from './application/commands/create-project.handler';
import { GetProjectsHandler } from './application/queries/get-projects.handler';

const CommandHandlers = [CreateProjectHandler];
const QueryHandlers = [GetProjectsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ProjectsController],
  providers: [
    PrismaClient,
    { provide: 'IProjectRepository', useClass: PrismaProjectRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class ProjectManagementModule {}
