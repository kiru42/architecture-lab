import { Task } from '../../model/task.entity';

// Primary Port: Use case for updating a task
export interface IUpdateTaskUseCase {
  execute(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      completed?: boolean;
      dueDate?: Date;
      assigneeId?: string;
    },
  ): Promise<Task>;
}

export const IUpdateTaskUseCase = Symbol('IUpdateTaskUseCase');
