import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetProfileQuery } from './get-profile.query';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '../../domain/repositories/user.repository';
import { User } from '../../domain/aggregates/user.aggregate';
import { UserId } from '../../domain/value-objects/user-id.vo';

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(@Inject(IUserRepositoryToken) private readonly userRepository: IUserRepository) {}

  async execute(query: GetProfileQuery): Promise<User> {
    const user = await this.userRepository.findById(UserId.create(query.userId));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
