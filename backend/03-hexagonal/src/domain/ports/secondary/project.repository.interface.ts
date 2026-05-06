import { Project } from '../../model/project.entity';

// Secondary Port: Repository interface for Project persistence
export interface IProjectRepository {
  create(name: string, userId: string): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  update(id: string, data: Partial<Project>): Promise<Project>;
}

// DI token for dependency injection
export const IProjectRepository = Symbol('IProjectRepository');
