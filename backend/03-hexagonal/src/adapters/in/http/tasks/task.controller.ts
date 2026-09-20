import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './task.dto';
import { ICreateTaskUseCase } from '../../../../domain/ports/primary/create-task.usecase.interface';
import { IListTasksUseCase } from '../../../../domain/ports/primary/list-tasks.usecase.interface';
import { IUpdateTaskUseCase } from '../../../../domain/ports/primary/update-task.usecase.interface';
import { JwtAuthGuard } from '../../../out/auth/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    @Inject(ICreateTaskUseCase) private readonly createTask: ICreateTaskUseCase,
    @Inject(IListTasksUseCase) private readonly listTasks: IListTasksUseCase,
    @Inject(IUpdateTaskUseCase) private readonly updateTask: IUpdateTaskUseCase,
  ) {}

  @Get('projects/:id/tasks')
  async list(@Param('id') projectId: string, @CurrentUser('userId') userId: string) {
    return this.listTasks.execute(projectId, userId);
  }

  @Post('projects/:id/tasks')
  async create(
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.createTask.execute({
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      projectId,
      assigneeId: dto.assigneeId,
      userId,
    });
  }

  @Patch('tasks/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.updateTask.execute(id, userId, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeId: dto.assigneeId,
    });
  }
}
