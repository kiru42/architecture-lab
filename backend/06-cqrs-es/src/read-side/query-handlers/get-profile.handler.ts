import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetProfileQuery } from '../queries/get-profile.query';
import { InMemoryUserReadRepository } from '../../infrastructure/read-models/in-memory-user-read-repository';
import { UserReadModel } from '../projections/user-read-model';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly readRepo: InMemoryUserReadRepository) {}

  async execute(query: GetProfileQuery): Promise<UserReadModel> {
    const user = this.readRepo.findById(query.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
