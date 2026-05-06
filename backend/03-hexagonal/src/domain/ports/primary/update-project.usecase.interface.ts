import { Project } from '../../model/project.entity';

// Primary Port: Use case for updating a project
export interface IUpdateProjectUseCase {
  execute(
    id: string,
    userId: string,
    data: { name?: string; archived?: boolean },
  ): Promise<Project>;
}

export const IUpdateProjectUseCase = Symbol('IUpdateProjectUseCase');
