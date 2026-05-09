import { IProjectRepository } from '@domain/ports';
import { Project } from '@domain/entities';

export class ListProjectsUseCase {
  constructor(private projectRepo: IProjectRepository) {}
  async execute(token: string): Promise<Project[]> {
    return this.projectRepo.list(token);
  }
}

export class CreateProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}
  async execute(name: string, token: string): Promise<Project> {
    return this.projectRepo.create({ name }, token);
  }
}

export class UpdateProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}
  async execute(id: string, data: Partial<Project>, token: string): Promise<Project> {
    return this.projectRepo.update(id, data, token);
  }
}

export class DeleteProjectUseCase {
  constructor(private projectRepo: IProjectRepository) {}
  async execute(id: string, token: string): Promise<void> {
    return this.projectRepo.delete(id, token);
  }
}
