import { apiClient } from '../../../shared/api/client';
import { Task, CreateTaskDto, UpdateTaskDto } from '../../../shared/types';

/**
 * Tasks live under their project in the contract: both listing and creating go
 * through `/projects/{id}/tasks`. There is no top-level `/tasks` collection, and
 * the create body carries no `projectId` — the path parameter is the parent, and
 * the backend rejects unknown fields. There is no `DELETE /tasks/{id}` either.
 */
export const taskApi = {
  async getByProject(projectId: string): Promise<Task[]> {
    return apiClient.get<Task[]>(`/projects/${projectId}/tasks`);
  },

  async create(projectId: string, data: CreateTaskDto): Promise<Task> {
    return apiClient.post<Task>(`/projects/${projectId}/tasks`, data);
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    return apiClient.patch<Task>(`/tasks/${id}`, data);
  },
};