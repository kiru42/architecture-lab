import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import {
  AssignTaskUseCase,
  CreateTaskUseCase,
  ListTasksUseCase,
  UpdateTaskUseCase,
} from '../../core/application';
import { AssignTaskRequestDto, CreateTaskRequestDto, UpdateTaskRequestDto } from './task.dto';

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
    @Body() dto: CreateTaskRequestDto,
  ) {
    return this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      projectId,
      userId: user.userId,
    });
  }

  @Patch('tasks/:id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateTaskRequestDto,
  ) {
    return this.updateTaskUseCase.execute(id, user.userId, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeId: dto.assigneeId,
    });
  }

  /** Kept for the assign flow exercised by notifications.feature. */
  @Post('projects/:projectId/tasks/:taskId/assign')
  async assign(
    @CurrentUser() user: CurrentUserData,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskRequestDto,
  ) {
    return this.assignTaskUseCase.execute({
      taskId,
      assigneeId: dto.assigneeId,
      userId: user.userId,
    });
  }
}
