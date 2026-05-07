import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ProjectService } from '../../../core/application/services/project.service';
import { CreateProjectDto } from '../dto/project.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { User } from '../../../core/domain/entities/user.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: User) {
    const project = await this.projectService.create({
      ...dto,
      ownerId: user.id,
    });
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  @Get()
  async list(@CurrentUser() user: User) {
    const projects = await this.projectService.listByOwner(user.id);
    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      ownerId: p.ownerId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
