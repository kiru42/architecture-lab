import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGetProfileUseCase } from '@domain/ports/primary/get-profile.usecase.interface';
import {
  IUserRepository,
  IUserRepository as IUserRepositoryToken,
} from '@domain/ports/secondary/user.repository.interface';
import { User } from '@domain/model/user.entity';

@Injectable()
export class GetProfileUseCase implements IGetProfileUseCase {
  constructor(
    @Inject(IUserRepositoryToken)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
