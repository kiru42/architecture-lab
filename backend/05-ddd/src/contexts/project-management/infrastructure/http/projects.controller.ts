import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';
import { CreateProjectCommand } from '../../application/commands/create-project.command';
import { UpdateProjectCommand } from '../../application/commands/update-project.command';
import { GetProjectsQuery } from '../../application/queries/get-projects.query';
import { Project } from '../../domain/aggregates/project.aggregate';
import { JwtAuthGuard } from '../../../../shared-kernel/infrastructure/http/jwt-auth.guard';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/http/current-user.decorator';

/** The aggregate is shaped like the frozen Project schema, so this is a 1:1 map. */
function toResponse(project: Project) {
  return {
    id: project.getId().getValue(),
    name: project.getName().getValue(),
    archived: project.isArchived(),
    userId: project.getUserId(),
    createdAt: project.getCreatedAt(),
    updatedAt: project.getUpdatedAt(),
  };
}

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser('userId') userId: string) {
    const project: Project = await this.commandBus.execute(
      new CreateProjectCommand(dto.name, userId),
    );
    return toResponse(project);
  }

  @Get()
  async list(@CurrentUser('userId') userId: string) {
    const projects: Project[] = await this.queryBus.execute(new GetProjectsQuery(userId));
    return projects.map(toResponse);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('userId') userId: string,
  ) {
    const project: Project = await this.commandBus.execute(
      new UpdateProjectCommand(id, userId, dto),
    );
    return toResponse(project);
  }
}
