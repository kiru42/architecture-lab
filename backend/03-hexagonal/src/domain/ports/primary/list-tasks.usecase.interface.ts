import { Task } from '../../model/task.entity';

// Primary Port: Use case for listing tasks
export interface IListTasksUseCase {
  execute(projectId: string, userId: string): Promise<Task[]>;
}

export const IListTasksUseCase = Symbol('IListTasksUseCase');
