import { Task } from '../entities';

/**
 * Tasks live under their parent project in the contract: listing and creating
 * both go through `/projects/{id}/tasks`. There is no top-level `/tasks`
 * collection and the contract defines no `DELETE /tasks/{id}`, so this port
 * exposes neither.
 */
export interface ITaskRepository {
  list(projectId: string, token: string): Promise<Task[]>;
  getById(id: string, token: string): Promise<Task>;
  create(projectId: string, data: Partial<Task>, token: string): Promise<Task>;
  update(id: string, data: Partial<Task>, token: string): Promise<Task>;
}