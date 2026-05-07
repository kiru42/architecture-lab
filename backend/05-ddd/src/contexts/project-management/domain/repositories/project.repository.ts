import { Project } from '../aggregates/project.aggregate';
import { ProjectId } from '../value-objects/project-id.vo';

export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: ProjectId): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
}
