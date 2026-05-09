import { Project } from '../entities';

export interface IProjectRepository {
  list(token: string): Promise<Project[]>;
  getById(id: string, token: string): Promise<Project>;
  create(data: { name: string }, token: string): Promise<Project>;
  update(id: string, data: Partial<Project>, token: string): Promise<Project>;
  delete(id: string, token: string): Promise<void>;
}
