import { ITaskRepository } from '@domain/ports';
import { Task } from '@domain/entities';
import { apiClient } from '../api/api-client';

/**
 * Both listing and creating go through `/projects/{id}/tasks`: the contract has
 * no top-level `/tasks` collection. Updating is the exception, addressed by the
 * task's own id at `/tasks/{id}`.
 */
export class HttpTaskRepository implements ITaskRepository {
  async list(projectId: string, token: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/projects/${projectId}/tasks`, token);
  }

  async getById(id: string, token: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`, token);
  }

  async create(projectId: string, data: Partial<Task>, token: string): Promise<Task> {
    return apiClient.post<Task>(`/projects/${projectId}/tasks`, data, token);
  }

  async update(id: string, data: Partial<Task>, token: string): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data, token);
  }
}