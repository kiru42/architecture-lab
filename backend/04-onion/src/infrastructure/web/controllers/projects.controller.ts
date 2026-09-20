import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '../../../core/application/services/project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { Project } from '../../../core/domain/entities/project.entity';

/** Projects and the API contract's Project schema have the same shape. */
function toResponse(project: Project) {
  return {
    id: project.id,
    name: project.name,
    archived: project.archived,
    userId: project.userId,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser('userId') userId: string) {
    const project = await this.projectService.create({ name: dto.name, userId });
    return toResponse(project);
  }

  @Get()
  async list(@CurrentUser('userId') userId: string) {
    const projects = await this.projectService.listByUser(userId);
    return projects.map(toResponse);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('userId') userId: string,
  ) {
    const project = await this.projectService.update(id, userId, dto);
    return toResponse(project);
  }
}
