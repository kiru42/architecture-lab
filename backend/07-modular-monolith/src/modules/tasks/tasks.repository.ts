import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    return this.prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    assigneeId?: string;
    projectId: string;
  }): Promise<Task> {
    return this.prisma.task.create({ data });
  }

  async update(
    id: string,
    data: { title?: string; description?: string; completed?: boolean; dueDate?: Date; assigneeId?: string },
  ): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data });
  }
}
