import { ITaskRepository } from '@domain/ports';
import { Task } from '@domain/entities';

export class ListTasksUseCase {
  constructor(private taskRepo: ITaskRepository) {}
  async execute(projectId: string, token: string): Promise<Task[]> {
    return this.taskRepo.list(projectId, token);
  }
}

export class CreateTaskUseCase {
  constructor(private taskRepo: ITaskRepository) {}
  async execute(data: Partial<Task>, token: string): Promise<Task> {
    return this.taskRepo.create(data, token);
  }
}

export class UpdateTaskUseCase {
  constructor(private taskRepo: ITaskRepository) {}
  async execute(id: string, data: Partial<Task>, token: string): Promise<Task> {
    return this.taskRepo.update(id, data, token);
  }
}

export class ToggleTaskCompletionUseCase {
  constructor(private taskRepo: ITaskRepository) {}
  async execute(task: Task, token: string): Promise<Task> {
    return this.taskRepo.update(task.id, { completed: !task.completed }, token);
  }
}

export class DeleteTaskUseCase {
  constructor(private taskRepo: ITaskRepository) {}
  async execute(id: string, token: string): Promise<void> {
    return this.taskRepo.delete(id, token);
  }
}
