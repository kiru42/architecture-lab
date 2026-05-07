import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CreateProjectDto } from './project.dto';
import { CreateProjectPort, ListProjectsPort } from '../../../../ports';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectPort,
    private readonly listProjectsUseCase: ListProjectsPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser('userId') userId: string) {
    const project = await this.createProjectUseCase.execute({
      name: dto.name,
      description: dto.description,
      ownerId: userId,
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
  async list(@CurrentUser('userId') userId: string) {
    const projects = await this.listProjectsUseCase.execute({ ownerId: userId });
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
