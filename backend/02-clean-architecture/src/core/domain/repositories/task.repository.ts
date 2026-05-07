import { Task } from '../entities/task.entity';

export abstract class TaskRepository {
  abstract findById(id: string): Promise<Task | null>;
  abstract findAllByProjectId(projectId: string): Promise<Task[]>;
  abstract save(task: Task): Promise<Task>;
  abstract delete(id: string): Promise<void>;
}
