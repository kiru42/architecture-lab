import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProjectsQuery } from '../queries/project.queries';
import { InMemoryProjectReadRepository } from '../../infrastructure/read-models/in-memory-project-read-repository';
import { ProjectReadModel } from '../projections/project-read-model';

@QueryHandler(GetProjectsQuery)
export class GetProjectsHandler implements IQueryHandler<GetProjectsQuery> {
  constructor(private readonly readRepo: InMemoryProjectReadRepository) {}

  async execute(query: GetProjectsQuery): Promise<ProjectReadModel[]> {
    return this.readRepo.findByUserId(query.userId);
  }
}
