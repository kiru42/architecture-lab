import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskRepository, Task } from '../../core/domain';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Task | null> {
    const prismaTask = await this.prisma.task.findUnique({ where: { id } });
    if (!prismaTask) return null;
    
    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.completed,
      prismaTask.dueDate,
      prismaTask.projectId,
      prismaTask.assigneeId,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }

  async findAllByProjectId(projectId: string): Promise<Task[]> {
    const prismaTasks = await this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    
    return prismaTasks.map((t: any) => new Task(
      t.id,
      t.title,
      t.description,
      t.completed,
      t.dueDate,
      t.projectId,
      t.assigneeId,
      t.createdAt,
      t.updatedAt,
    ));
  }

  async save(task: Task): Promise<Task> {
    const data = {
      title: task.title,
      description: task.description,
      completed: task.completed,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      updatedAt: task.updatedAt,
    };

    let prismaTask;
    if (task.id) {
      // Update existing
      prismaTask = await this.prisma.task.update({
        where: { id: task.id },
        data,
      });
    } else {
      // Create new
      prismaTask = await this.prisma.task.create({ data });
    }

    return new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.completed,
      prismaTask.dueDate,
      prismaTask.projectId,
      prismaTask.assigneeId,
      prismaTask.createdAt,
      prismaTask.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }
}
