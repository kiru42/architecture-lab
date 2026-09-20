import { Task } from '../aggregates/task.aggregate';
import { TaskId } from '../value-objects/task-id.vo';

export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
}

/** DI token. The interface is the port; this Symbol is how Nest finds it. */
export const ITaskRepository = Symbol('ITaskRepository');
