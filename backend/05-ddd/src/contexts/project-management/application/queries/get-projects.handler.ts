import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProjectsQuery } from './get-projects.query';
import { IProjectRepository } from '../../domain/repositories/project.repository';

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
}

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(@Inject('IProjectRepository') private readonly repo: IProjectRepository) {}

  async execute(query: GetProjectsQuery): Promise<ProjectDto[]> {
    const projects = await this.repo.findByOwnerId(query.ownerId);
    return projects.map((p) => ({
      id: p.getId().getValue(),
      name: p.getName().getValue(),
      description: p.getDescription(),
      ownerId: p.getOwnerId(),
    }));
  }
}
