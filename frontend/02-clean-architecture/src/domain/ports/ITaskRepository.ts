import { Task } from '../entities';

export interface ITaskRepository {
  list(projectId: string, token: string): Promise<Task[]>;
  getById(id: string, token: string): Promise<Task>;
  create(data: Partial<Task>, token: string): Promise<Task>;
  update(id: string, data: Partial<Task>, token: string): Promise<Task>;
  delete(id: string, token: string): Promise<void>;
}
