import { Project } from '../aggregates/project.aggregate';
import { ProjectId } from '../value-objects/project-id.vo';

export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
}

/** DI token. The interface is the port; this Symbol is how Nest finds it. */
export const IProjectRepository = Symbol('IProjectRepository');
