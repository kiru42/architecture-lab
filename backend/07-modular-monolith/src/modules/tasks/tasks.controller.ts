import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  list(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.tasksService.listByProject(projectId, user.id);
  }

  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, user.id, dto);
  }

  @Patch('tasks/:id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, user.id, dto);
  }
}
