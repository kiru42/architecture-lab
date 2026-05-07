import { Module } from '@nestjs/common';
import { ProjectService } from '../core/application/services/project.service';
import { IProjectRepository } from '../core/application/interfaces/project-repository.interface';
import { IUserRepository } from '../core/application/interfaces/user-repository.interface';
import { PrismaProjectRepository } from './persistence/prisma/project.repository';
import { PrismaUserRepository } from './persistence/prisma/user.repository';
import { ProjectsController } from './web/controllers/projects.controller';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectService,
    { provide: 'IProjectRepository', useClass: PrismaProjectRepository },
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
  ],
  exports: [ProjectService],
})
export class ProjectModule {}
