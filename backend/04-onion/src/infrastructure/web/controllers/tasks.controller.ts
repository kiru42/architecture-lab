import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TaskService } from '../../../core/application/services/task.service';
import { CreateTaskDto, AssignTaskDto } from '../dto/task.dto';
import { JwtAuthGuard } from '../middleware/jwt-auth.guard';
import { CurrentUser } from '../middleware/current-user.decorator';
import { User } from '../../../core/domain/entities/user.entity';

@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    const task = await this.taskService.create({
      ...dto,
      projectId,
      createdById: user.id,
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

  @Get()
  async list(@Param('projectId') projectId: string) {
    const tasks = await this.taskService.listByProject(projectId);
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

  @Patch(':taskId/assign')
  async assign(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: AssignTaskDto,
  ) {
    const task = await this.taskService.assign({
      taskId,
      assignedToId: dto.assignedToId,
      projectId,
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
}
