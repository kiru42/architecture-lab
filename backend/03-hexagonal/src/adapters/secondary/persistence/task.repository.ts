import { Injectable } from '@nestjs/common';
import { ITaskRepository } from '@domain/ports/secondary/task.repository.interface';
import { Task } from '@domain/model/task.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
  }): Promise<Task> {
    const task = await this.prisma.task.create({
      data,
    });
    return new Task(task);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });
    return task ? new Task(task) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return tasks.map((t) => new Task(t));
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const task = await this.prisma.task.update({
      where: { id },
      data,
    });
    return new Task(task);
  }
}
