import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import {
  AssignTaskUseCase,
  CreateTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
} from '../../core/application';
import { UpdateTaskDto } from '../../core/application/dtos/update-task.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly listTasksUseCase: ListTasksUseCase,
    private readonly assignTaskUseCase: AssignTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
  ) {}

  @Get('projects/:id/tasks')
  async list(@CurrentUser() user: CurrentUserData, @Param('id') projectId: string) {
    return this.listTasksUseCase.execute(projectId, user.userId);
  }

  @Post('projects/:id/tasks')
  async create(
    @CurrentUser() user: CurrentUserData,
    @Param('id') projectId: string,
    @Body() body: { title: string; description?: string },
  ) {
    return this.createTaskUseCase.execute({
      title: body.title,
      description: body.description,
      projectId,
      userId: user.userId,
    });
  }

  @Patch('tasks/:id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
  ) {
    return this.updateTaskUseCase.execute(id, user.userId, body);
  }

  /** Kept for the assign flow exercised by notifications.feature. */
  @Post('projects/:projectId/tasks/:taskId/assign')
  async assign(
    @CurrentUser() user: CurrentUserData,
    @Param('taskId') taskId: string,
    @Body() body: { assigneeId: string },
  ) {
    return this.assignTaskUseCase.execute({
      taskId,
      assigneeId: body.assigneeId,
      userId: user.userId,
    });
  }
}
