import { ITaskRepository } from '@domain/ports';
import { Task } from '@domain/entities';
import { apiClient } from '../api/api-client';

export class HttpTaskRepository implements ITaskRepository {
  async list(projectId: string, token: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/tasks?projectId=${projectId}`, token);
  }

  async getById(id: string, token: string): Promise<Task> {
    return apiClient.get<Task>(`/tasks/${id}`, token);
  }

  async create(data: Partial<Task>, token: string): Promise<Task> {
    return apiClient.post<Task>('/tasks', data, token);
  }

  async update(id: string, data: Partial<Task>, token: string): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data, token);
  }

  async delete(id: string, token: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`, token);
  }
}
