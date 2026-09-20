import { IProjectRepository } from '@domain/ports';
import { Project } from '@domain/entities';
import { apiClient } from '../api/api-client';

/**
 * The contract returns bare payloads: an array for a collection, the resource
 * itself for a create or an update. There is no `{ projects }` envelope, and
 * destructuring one is how a list silently becomes `undefined`.
 */
export class HttpProjectRepository implements IProjectRepository {
  async list(token: string): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects', token);
  }

  async getById(id: string, token: string): Promise<Project> {
    return apiClient.get<Project>(`/projects/${id}`, token);
  }

  async create(data: { name: string }, token: string): Promise<Project> {
    return apiClient.post<Project>('/projects', data, token);
  }

  async update(id: string, data: Partial<Project>, token: string): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, data, token);
  }
}