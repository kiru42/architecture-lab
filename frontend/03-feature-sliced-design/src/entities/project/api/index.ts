import { apiClient } from '../../../shared/api/client';
import { Project, CreateProjectDto, UpdateProjectDto } from '../../../shared/types';

/**
 * The contract returns bare payloads: an array for a collection, the resource
 * itself for a create or an update. There is no `{ projects }` / `{ project }`
 * envelope, and destructuring one is how every list silently becomes
 * `undefined`.
 *
 * There is also no `DELETE /projects/{id}` in shared/openapi.yaml, so this
 * entity does not pretend to offer one.
 */
export const projectApi = {
  async getAll(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  },

  async create(data: CreateProjectDto): Promise<Project> {
    return apiClient.post<Project>('/projects', data);
  },

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    return apiClient.patch<Project>(`/projects/${id}`, data);
  },
};