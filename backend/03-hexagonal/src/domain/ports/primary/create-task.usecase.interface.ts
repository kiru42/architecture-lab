import { Task } from '../../model/task.entity';

// Primary Port: Use case for creating a task
export interface ICreateTaskUseCase {
  execute(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
    userId: string;
  }): Promise<Task>;
}

export const ICreateTaskUseCase = Symbol('ICreateTaskUseCase');
