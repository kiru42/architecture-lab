import { Project } from '../../model/project.entity';

// Primary Port: Use case for listing projects
export interface IListProjectsUseCase {
  execute(userId: string): Promise<Project[]>;
}

export const IListProjectsUseCase = Symbol('IListProjectsUseCase');
