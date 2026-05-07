import { Controller, Post, Get, Patch, Body, Query, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../../application/commands/create-task.command';
import { CompleteTaskCommand } from '../../application/commands/complete-task.command';
import { GetTasksQuery } from '../../application/queries/get-tasks.query';

class CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
}

@Controller('tasks')
export class TasksController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    const taskId = await this.commandBus.execute(new CreateTaskCommand(dto.title, dto.description || null, dto.projectId));
    return { taskId };
  }

  @Get()
  async list(@Query('projectId') projectId: string) {
    return this.queryBus.execute(new GetTasksQuery(projectId));
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    await this.commandBus.execute(new CompleteTaskCommand(id));
    return { status: 'completed' };
  }
}
