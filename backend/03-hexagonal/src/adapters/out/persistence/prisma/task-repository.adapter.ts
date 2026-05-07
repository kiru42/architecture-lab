import { Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../../../../domain';
import { TaskRepositoryPort } from '../../../../ports';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTaskRepository implements TaskRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(task: Task): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
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
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) return null;
    return this.toDomain(task);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({ where: { projectId } });
    return tasks.map((t: any) => this.toDomain(t));
  }

  async update(task: Task): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedToId,
        dueDate: task.dueDate,
        updatedAt: task.updatedAt,
      },
    });
    return this.toDomain(updated);
  }

  private toDomain(prismaTask: any): Task {
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.status as TaskStatus,
      prismaTask.priority as TaskPriority,
      prismaTask.projectId,
      prismaTask.assignedToId,
      prismaTask.createdById,
      prismaTask.dueDate,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }
}
