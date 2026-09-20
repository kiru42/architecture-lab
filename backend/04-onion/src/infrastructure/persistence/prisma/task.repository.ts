import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Task } from '../../../core/domain/entities/task.entity';
import { ITaskRepository } from '../../../core/application/interfaces/task-repository.interface';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(task: Task): Promise<Task> {
    const raw = await this.prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
      },
    });
    return PrismaTaskRepository.toDomain(raw);
  }

  async findById(id: string): Promise<Task | null> {
    const raw = await this.prisma.task.findUnique({ where: { id } });
    return raw ? PrismaTaskRepository.toDomain(raw) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const raws = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map(PrismaTaskRepository.toDomain);
  }

  async update(task: Task): Promise<Task> {
    const raw = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        completed: task.completed,
        dueDate: task.dueDate,
        assigneeId: task.assigneeId,
      },
    });
    return PrismaTaskRepository.toDomain(raw);
  }

  private static toDomain(raw: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
    dueDate: Date | null;
    projectId: string;
    assigneeId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      raw.id,
      raw.title,
      raw.description,
      raw.completed,
      raw.dueDate,
      raw.projectId,
      raw.assigneeId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
