import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/aggregates/task.aggregate';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(task: Task): Promise<void> {
    await this.prisma.task.upsert({
      where: { id: task.getId().getValue() },
      create: {
        id: task.getId().getValue(),
        title: task.getTitle(),
        description: task.getDescription(),
        status: task.getStatus().getValue(),
        projectId: task.getProjectId(),
        createdAt: new Date(),
      },
      update: {
        title: task.getTitle(),
        description: task.getDescription(),
        status: task.getStatus().getValue(),
      },
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return Task.reconstitute(
      TaskId.create(row.id),
      row.title,
      row.description,
      TaskStatus.create(row.status),
      row.projectId,
      row.createdAt,
    );
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({ where: { projectId } });
    return rows.map((r) =>
      Task.reconstitute(
        TaskId.create(r.id),
        r.title,
        r.description,
        TaskStatus.create(r.status),
        r.projectId,
        r.createdAt,
      ),
    );
  }
}
