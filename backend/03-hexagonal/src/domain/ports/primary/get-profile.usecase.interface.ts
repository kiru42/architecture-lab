import { User } from '../../model/user.entity';

// Primary Port: Use case for getting user profile
export interface IGetProfileUseCase {
  execute(userId: string): Promise<User>;
}

export const IGetProfileUseCase = Symbol('IGetProfileUseCase');
