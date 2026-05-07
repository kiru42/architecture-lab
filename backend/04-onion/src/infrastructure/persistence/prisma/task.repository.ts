import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Task, TaskStatus, TaskPriority } from '../../../core/domain/entities/task.entity';
import { ITaskRepository } from '../../../core/application/interfaces/task-repository.interface';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(raw: any): Task {
    return new Task(
      raw.id,
      raw.title,
      raw.description,
      raw.status as TaskStatus,
      raw.priority as TaskPriority,
      raw.projectId,
      raw.assignedToId,
      raw.createdById,
      raw.dueDate,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async create(task: Task): Promise<Task> {
    const raw = await this.prisma.task.create({
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
    return this.toDomain(raw);
  }

  async findById(id: string): Promise<Task | null> {
    const raw = await this.prisma.task.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({ where: { projectId } });
    return raws.map((raw: any) => this.toDomain(raw));
  }

  async update(task: Task): Promise<Task> {
    const raw = await this.prisma.task.update({
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
    return this.toDomain(raw);
  }
}
