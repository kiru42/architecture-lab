import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { InMemoryUserReadRepository } from '../../infrastructure/read-models/in-memory-user-read-repository';
import { UserReadModel } from '../projections/user-read-model';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly readRepo: InMemoryUserReadRepository) {}

  async execute(query: GetUserByIdQuery): Promise<UserReadModel> {
    const user = this.readRepo.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
