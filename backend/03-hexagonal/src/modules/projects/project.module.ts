import { Module } from '@nestjs/common';
import { ProjectController } from '../../adapters/in/http/projects/project.controller';
import {
  CreateProjectUseCase,
  ListProjectsUseCase,
  UpdateProjectUseCase,
} from '../../application/use-cases';
import { PrismaModule } from '../infrastructure/prisma.module';
import { ICreateProjectUseCase } from '../../domain/ports/primary/create-project.usecase.interface';
import { IListProjectsUseCase } from '../../domain/ports/primary/list-projects.usecase.interface';
import { IUpdateProjectUseCase } from '../../domain/ports/primary/update-project.usecase.interface';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectController],
  providers: [
    { provide: ICreateProjectUseCase, useClass: CreateProjectUseCase },
    { provide: IListProjectsUseCase, useClass: ListProjectsUseCase },
    { provide: IUpdateProjectUseCase, useClass: UpdateProjectUseCase },
  ],
})
export class ProjectModule {}
