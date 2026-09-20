import { Module } from '@nestjs/common';
import { ProjectService } from '../core/application/services/project.service';
import { ProjectsController } from './web/controllers/projects.controller';
import { PrismaModule } from './persistence/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
