import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly prisma: PrismaService,
  ) {}

  private async assertProjectAccess(projectId: string, userId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Access denied');
  }

  async listByProject(projectId: string, userId: string): Promise<Task[]> {
    await this.assertProjectAccess(projectId, userId);
    return this.tasksRepository.findByProjectId(projectId);
  }

  async create(
    projectId: string,
    userId: string,
    data: { title: string; description?: string; dueDate?: string; assigneeId?: string },
  ): Promise<Task> {
    await this.assertProjectAccess(projectId, userId);
    return this.tasksRepository.create({
      ...data,
      projectId,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  }

  async update(
    id: string,
    userId: string,
    data: { title?: string; description?: string; completed?: boolean; dueDate?: string; assigneeId?: string },
  ): Promise<Task> {
    const task = await this.tasksRepository.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    await this.assertProjectAccess(task.projectId, userId);
    return this.tasksRepository.update(id, {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
  }
}
