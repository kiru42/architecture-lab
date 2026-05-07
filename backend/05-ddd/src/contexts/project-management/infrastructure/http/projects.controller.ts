import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateProjectCommand } from '../../application/commands/create-project.command';
import { GetProjectsQuery } from '../../application/queries/get-projects.query';

class CreateProjectDto {
  name: string;
  description?: string;
  ownerId: string;
}

@Controller('projects')
export class ProjectsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    const projectId = await this.commandBus.execute(new CreateProjectCommand(dto.name, dto.description || null, dto.ownerId));
    return { projectId };
  }

  @Get()
  async list(@Query('ownerId') ownerId: string) {
    return this.queryBus.execute(new GetProjectsQuery(ownerId));
  }
}
