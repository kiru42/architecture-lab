import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetProjectsQuery } from './get-projects.query';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(@Inject(IProjectRepositoryToken) private readonly repo: IProjectRepository) {}

  async execute(query: GetProjectsQuery): Promise<Project[]> {
    return this.repo.findByUserId(query.userId);
  }
}
