import { apiClient } from '../../../shared/api/client';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../../shared/types';

export const taskApi = {
  async getByProject(projectId: string): Promise<{ tasks: Task[] }> {
    return apiClient.get<{ tasks: Task[] }>(`/tasks?projectId=${projectId}`);
  },

  async create(data: CreateTaskDto): Promise<{ task: Task }> {
    return apiClient.post<{ task: Task }>('/tasks', data);
  },

  async update(id: string, data: UpdateTaskDto): Promise<{ task: Task }> {
    return apiClient.patch<{ task: Task }>(`/tasks/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/tasks/${id}`);
  },
};
