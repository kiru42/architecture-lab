import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain';
import { ProfileResultDto } from '../dtos/auth.dto';

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<ProfileResultDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // The password hash never leaves the application layer.
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
