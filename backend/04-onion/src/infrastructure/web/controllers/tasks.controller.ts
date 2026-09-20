import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TaskService } from '../../../core/application/services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { Task } from '../../../core/domain/entities/task.entity';

/** Tasks and the API contract's Task schema have the same shape. */
function toResponse(task: Task) {
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
  constructor(private readonly taskService: TaskService) {}

  @Get('projects/:id/tasks')
  async list(@Param('id') projectId: string, @CurrentUser('userId') userId: string) {
    const tasks = await this.taskService.listByProject(projectId, userId);
    return tasks.map(toResponse);
  }

  @Post('projects/:id/tasks')
  async create(
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    const task = await this.taskService.create(projectId, userId, {
      title: dto.title,
      description: dto.description,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeId: dto.assigneeId,
    });
    return toResponse(task);
  }

  @Patch('tasks/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    const task = await this.taskService.update(id, userId, {
      title: dto.title,
      description: dto.description,
      completed: dto.completed,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      assigneeId: dto.assigneeId,
    });
    return toResponse(task);
  }
}
