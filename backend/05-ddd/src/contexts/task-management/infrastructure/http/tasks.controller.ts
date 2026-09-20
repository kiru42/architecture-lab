import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { CreateTaskCommand } from '../../application/commands/create-task.command';
import { UpdateTaskCommand } from '../../application/commands/update-task.command';
import { GetTasksQuery } from '../../application/queries/get-tasks.query';
import { Task } from '../../domain/aggregates/task.aggregate';
import { JwtAuthGuard } from '../../../../shared-kernel/infrastructure/http/jwt-auth.guard';
import { CurrentUser } from '../../../../shared-kernel/infrastructure/http/current-user.decorator';

/** The aggregate is shaped like the frozen Task schema, so this is a 1:1 map. */
function toResponse(task: Task) {
  return {
    id: task.getId().getValue(),
    title: task.getTitle(),
    description: task.getDescription(),
    completed: task.isCompleted(),
    dueDate: task.getDueDate(),
    projectId: task.getProjectId(),
    assigneeId: task.getAssigneeId(),
    createdAt: task.getCreatedAt(),
    updatedAt: task.getUpdatedAt(),
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('projects/:id/tasks')
  async list(@Param('id') projectId: string, @CurrentUser('userId') userId: string) {
    const tasks: Task[] = await this.queryBus.execute(new GetTasksQuery(projectId, userId));
    return tasks.map(toResponse);
  }

  @Post('projects/:id/tasks')
  async create(
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    const task: Task = await this.commandBus.execute(
      new CreateTaskCommand(dto.title, projectId, userId, {
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assigneeId: dto.assigneeId ?? null,
      }),
    );
    return toResponse(task);
  }

  @Patch('tasks/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    const task: Task = await this.commandBus.execute(
      new UpdateTaskCommand(id, userId, {
        title: dto.title,
        description: dto.description,
        completed: dto.completed,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
      }),
    );
    return toResponse(task);
  }
}
