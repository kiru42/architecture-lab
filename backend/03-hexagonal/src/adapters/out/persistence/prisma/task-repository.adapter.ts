import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ITaskRepository } from '../../../../domain/ports/secondary/task.repository.interface';
import { Task } from '../../../../domain/model/task.entity';
import { PrismaService } from './prisma.service';

/** Driven adapter: implements the ITaskRepository port on top of Prisma. */
@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
  }): Promise<Task> {
    const row = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        dueDate: data.dueDate ?? null,
        projectId: data.projectId,
        assigneeId: data.assigneeId ?? null,
      },
    });
    return new Task(row);
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id } });
    return row ? new Task(row) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => new Task(row));
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    // UncheckedUpdateInput is the variant that takes scalar foreign keys
    // (assigneeId) instead of relation objects (assignee).
    const patch: Prisma.TaskUncheckedUpdateInput = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    if (data.completed !== undefined) patch.completed = data.completed;
    if (data.dueDate !== undefined) patch.dueDate = data.dueDate;
    if (data.assigneeId !== undefined) patch.assigneeId = data.assigneeId;

    const row = await this.prisma.task.update({ where: { id }, data: patch });
    return new Task(row);
  }
}
