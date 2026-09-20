import { Project } from '../entities';

/**
 * The contract exposes list/create/update for projects and nothing else: there
 * is no `DELETE /projects/{id}`, so this port offers no delete.
 */
export interface IProjectRepository {
  list(token: string): Promise<Project[]>;
  getById(id: string, token: string): Promise<Project>;
  create(data: { name: string }, token: string): Promise<Project>;
  update(id: string, data: Partial<Project>, token: string): Promise<Project>;
}