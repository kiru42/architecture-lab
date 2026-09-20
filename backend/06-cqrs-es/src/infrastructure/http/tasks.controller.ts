import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { CreateTaskCommand, UpdateTaskCommand } from '../../write-side/commands/task.commands';
import { GetTaskQuery, GetTasksQuery } from '../../read-side/queries/task.queries';
import { TaskReadModel } from '../../read-side/projections/task-read-model';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

/** The read model is shaped like the frozen Task schema, so this is a 1:1 map. */
function toResponse(task: TaskReadModel) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    completed: task.completed,
    dueDate: task.dueDate,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
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
    const tasks: TaskReadModel[] = await this.queryBus.execute(
      new GetTasksQuery(projectId, userId),
    );
    return tasks.map(toResponse);
  }

  @Post('projects/:id/tasks')
  async create(
    @Param('id') projectId: string,
    @Body() dto: { title: string; description?: string; dueDate?: string; assigneeId?: string },
    @CurrentUser('userId') userId: string,
  ) {
    const taskId = uuid();
    await this.commandBus.execute(
      new CreateTaskCommand(taskId, dto.title, projectId, userId, {
        description: dto.description ?? null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assigneeId: dto.assigneeId ?? null,
      }),
    );

    const task: TaskReadModel = await this.queryBus.execute(new GetTaskQuery(taskId, userId));
    return toResponse(task);
  }

  @Patch('tasks/:id')
  async update(
    @Param('id') id: string,
    @Body()
    dto: {
      title?: string;
      description?: string;
      completed?: boolean;
      dueDate?: string;
      assigneeId?: string;
    },
    @CurrentUser('userId') userId: string,
  ) {
    await this.commandBus.execute(
      new UpdateTaskCommand(id, userId, {
        title: dto.title,
        description: dto.description,
        completed: dto.completed,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        assigneeId: dto.assigneeId,
      }),
    );

    const task: TaskReadModel = await this.queryBus.execute(new GetTaskQuery(id, userId));
    return toResponse(task);
  }
}
