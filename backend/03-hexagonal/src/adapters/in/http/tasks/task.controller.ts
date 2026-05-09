import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CreateTaskDto, AssignTaskDto } from './task.dto';
import { CreateTaskPort, AssignTaskPort, ListTasksByProjectPort } from '../../../../ports';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskPort,
    private readonly assignTaskUseCase: AssignTaskPort,
    private readonly listTasksUseCase: ListTasksByProjectPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto, @CurrentUser('userId') userId: string) {
    const task = await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      projectId: dto.projectId,
      createdById: userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      createdById: task.createdById,
      dueDate: task.dueDate,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  @Put(':taskId/assign')
  async assign(
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    const task = await this.assignTaskUseCase.execute({
      taskId,
      assignedToId: dto.assignedToId,
      projectId: '', // TODO: should validate project ownership
    });
    return {
      id: task.id,
      title: task.title,
      assignedToId: task.assignedToId,
      updatedAt: task.updatedAt,
    };
  }

  @Get('project/:projectId')
  async listByProject(@Param('projectId') projectId: string) {
    const tasks = await this.listTasksUseCase.execute(projectId);
    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      projectId: t.projectId,
      assignedToId: t.assignedToId,
      createdById: t.createdById,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }
}
