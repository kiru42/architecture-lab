import { Project } from '../entities/project.entity';

export abstract class ProjectRepository {
  abstract findById(id: string): Promise<Project | null>;
  abstract findAllByUserId(userId: string): Promise<Project[]>;
  abstract save(project: Project): Promise<Project>;
  abstract delete(id: string): Promise<void>;
}
