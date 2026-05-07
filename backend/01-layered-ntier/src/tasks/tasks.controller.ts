import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/types/auth.types';

@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('projects/:id/tasks')
  async listTasks(@CurrentUser() user: AuthenticatedUser, @Param('id') projectId: string) {
    return this.tasksService.listTasks(user.id, projectId);
  }

  @Post('projects/:id/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(user.id, projectId, dto);
  }

  @Patch('tasks/:id')
  async updateTask(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(user.id, taskId, dto);
  }
}
