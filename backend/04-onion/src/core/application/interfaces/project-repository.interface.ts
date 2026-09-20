import { Project } from '../../domain/entities/project.entity';

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  update(project: Project): Promise<Project>;
}
