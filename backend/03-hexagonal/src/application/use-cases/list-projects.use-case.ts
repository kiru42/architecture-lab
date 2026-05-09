import { Injectable } from '@nestjs/common';
import { Project } from '../../domain';
import { ListProjectsQuery, ListProjectsPort, ProjectRepositoryPort } from '../../ports';

@Injectable()
export class ListProjectsUseCase implements ListProjectsPort {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  async execute(query: ListProjectsQuery): Promise<Project[]> {
    return this.projectRepository.findByOwnerId(query.ownerId);
  }
}
