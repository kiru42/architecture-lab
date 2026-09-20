import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUsersQuery } from '../queries/get-users.query';
import { InMemoryUserReadRepository } from '../../infrastructure/read-models/in-memory-user-read-repository';
import { UserReadModel } from '../projections/user-read-model';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly readRepo: InMemoryUserReadRepository) {}

  async execute(): Promise<UserReadModel[]> {
    return this.readRepo.findAll();
  }
}
