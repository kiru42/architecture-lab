import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import {
  CreateProjectCommand,
  UpdateProjectCommand,
} from '../../write-side/commands/project.commands';
import { GetProjectsQuery } from '../../read-side/queries/project.queries';
import { ProjectReadModel } from '../../read-side/projections/project-read-model';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

function toResponse(project: ProjectReadModel) {
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
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(@CurrentUser('userId') userId: string) {
    const projects: ProjectReadModel[] = await this.queryBus.execute(new GetProjectsQuery(userId));
    return projects.map(toResponse);
  }

  @Post()
  async create(@Body() dto: { name: string }, @CurrentUser('userId') userId: string) {
    const projectId = uuid();
    await this.commandBus.execute(new CreateProjectCommand(projectId, dto.name, userId));

    const projects: ProjectReadModel[] = await this.queryBus.execute(new GetProjectsQuery(userId));
    return toResponse(projects.find((p) => p.id === projectId)!);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: { name?: string; archived?: boolean },
    @CurrentUser('userId') userId: string,
  ) {
    await this.commandBus.execute(new UpdateProjectCommand(id, userId, dto));

    const projects: ProjectReadModel[] = await this.queryBus.execute(new GetProjectsQuery(userId));
    return toResponse(projects.find((p) => p.id === id)!);
  }
}
