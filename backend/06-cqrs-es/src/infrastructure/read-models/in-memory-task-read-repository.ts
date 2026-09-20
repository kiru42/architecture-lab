import { Injectable } from '@nestjs/common';
import { TaskReadModel } from '../../read-side/projections/task-read-model';

@Injectable()
export class InMemoryTaskReadRepository {
  private tasks: Map<string, TaskReadModel> = new Map();

  save(task: TaskReadModel): void {
    this.tasks.set(task.id, task);
  }

  findById(id: string): TaskReadModel | null {
    return this.tasks.get(id) || null;
  }

  findByProjectId(projectId: string): TaskReadModel[] {
    return Array.from(this.tasks.values())
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  clear(): void {
    this.tasks.clear();
  }
}
