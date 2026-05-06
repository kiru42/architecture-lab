import { Project } from '../../model/project.entity';

// Primary Port: Use case for creating a project
export interface ICreateProjectUseCase {
  execute(name: string, userId: string): Promise<Project>;
}

export const ICreateProjectUseCase = Symbol('ICreateProjectUseCase');
