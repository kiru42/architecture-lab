import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/aggregates/task.aggregate';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';

/** Maps between the aggregate and the frozen Task table. The only place the
 *  \`completed\` boolean and the TaskStatus value object meet. */
@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(task: Task): Promise<void> {
    const id = task.getId().getValue();
    await this.prisma.task.upsert({
      where: { id },
      create: {
        id,
        title: task.getTitle(),
        description: task.getDescription(),
        completed: task.isCompleted(),
        dueDate: task.getDueDate(),
        projectId: task.getProjectId(),
        assigneeId: task.getAssigneeId(),
        createdAt: task.getCreatedAt(),
        updatedAt: task.getUpdatedAt(),
      },
      update: {
        title: task.getTitle(),
        description: task.getDescription(),
        completed: task.isCompleted(),
        dueDate: task.getDueDate(),
        assigneeId: task.getAssigneeId(),
        updatedAt: task.getUpdatedAt(),
      },
    });
  }

  async findById(id: TaskId): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id: id.getValue() } });
    return row ? PrismaTaskRepository.toDomain(row) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const rows = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(PrismaTaskRepository.toDomain);
  }

  private static toDomain(row: {
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
    return Task.reconstitute(
      TaskId.create(row.id),
      row.title,
      row.description,
      TaskStatus.fromCompleted(row.completed),
      row.dueDate,
      row.projectId,
      row.assigneeId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
