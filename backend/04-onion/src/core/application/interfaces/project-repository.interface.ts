import { Project } from '../../domain/entities/project.entity';

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  findByName(name: string): Promise<Project | null>;
}
