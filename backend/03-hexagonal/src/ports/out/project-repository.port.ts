import { Project } from '../../domain';

export interface ProjectRepositoryPort {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  findByName(name: string): Promise<Project | null>;
}
