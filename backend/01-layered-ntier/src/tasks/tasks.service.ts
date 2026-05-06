import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private projectsService: ProjectsService,
  ) {}

  async listTasks(userId: string, projectId: string): Promise<Task[]> {
    await this.verifyProjectAccess(userId, projectId);

    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(userId: string, projectId: string, dto: CreateTaskDto): Promise<Task> {
    await this.verifyProjectAccess(userId, projectId);

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assigneeId: dto.assigneeId,
        projectId,
      },
    });
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.verifyProjectAccess(userId, task.projectId);

    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.completed !== undefined) updateData.completed = dto.completed;
    if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.assigneeId !== undefined) updateData.assigneeId = dto.assigneeId;

    return this.prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  private async verifyProjectAccess(userId: string, projectId: string): Promise<void> {
    const project = await this.projectsService.getProjectById(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }
}
