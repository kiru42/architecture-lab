import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../decorators/current-user.decorator';
import { CreateTaskUseCase, AssignTaskUseCase } from '../../core/application';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly assignTaskUseCase: AssignTaskUseCase,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Param('projectId') projectId: string,
    @Body() body: { title: string; description?: string },
  ) {
    return this.createTaskUseCase.execute({
      title: body.title,
      description: body.description,
      projectId,
      userId: user.userId,
    });
  }

  @Post(':taskId/assign')
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
