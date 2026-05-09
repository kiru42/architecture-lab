import { apiClient } from '../../../shared/api/client';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../../shared/types';

export const projectApi = {
  async getAll(): Promise<{ projects: Project[] }> {
    return apiClient.get<{ projects: Project[] }>('/projects');
  },

  async create(data: CreateProjectDto): Promise<{ project: Project }> {
    return apiClient.post<{ project: Project }>('/projects', data);
  },

  async update(id: string, data: UpdateProjectDto): Promise<{ project: Project }> {
    return apiClient.patch<{ project: Project }>(`/projects/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  },
};
