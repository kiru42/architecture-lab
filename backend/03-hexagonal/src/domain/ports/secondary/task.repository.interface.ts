import { Task } from '../../model/task.entity';

// Secondary Port: Repository interface for Task persistence
export interface ITaskRepository {
  create(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
  }): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  update(id: string, data: Partial<Task>): Promise<Task>;
}

// DI token for dependency injection
export const ITaskRepository = Symbol('ITaskRepository');
