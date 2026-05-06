import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import {
  ICreateTaskUseCase,
  ICreateTaskUseCase as ICreateTaskUseCaseToken,
} from '@domain/ports/primary/create-task.usecase.interface';
import {
  IListTasksUseCase,
  IListTasksUseCase as IListTasksUseCaseToken,
} from '@domain/ports/primary/list-tasks.usecase.interface';
import {
  IUpdateTaskUseCase,
  IUpdateTaskUseCase as IUpdateTaskUseCaseToken,
} from '@domain/ports/primary/update-task.usecase.interface';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(
    @Inject(ICreateTaskUseCaseToken)
    private readonly createTaskUseCase: ICreateTaskUseCase,
    @Inject(IListTasksUseCaseToken)
    private readonly listTasksUseCase: IListTasksUseCase,
    @Inject(IUpdateTaskUseCaseToken)
    private readonly updateTaskUseCase: IUpdateTaskUseCase,
  ) {}

  @Get('projects/:id/tasks')
  async list(@Request() req, @Param('id') projectId: string) {
    return await this.listTasksUseCase.execute(projectId, req.user.userId);
  }

  @Post('projects/:id/tasks')
  async create(
    @Request() req,
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return await this.createTaskUseCase.execute({
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      projectId,
      assigneeId: dto.assigneeId,
      userId: req.user.userId,
    });
  }

  @Patch('tasks/:id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return await this.updateTaskUseCase.execute(id, req.user.userId, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeId: dto.assigneeId,
    });
  }
}
