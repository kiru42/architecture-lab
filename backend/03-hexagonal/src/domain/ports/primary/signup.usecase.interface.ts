import { User } from '../../model/user.entity';

// Primary Port: Use case for user signup
export interface ISignupUseCase {
  execute(email: string, password: string, name: string): Promise<{
    user: User;
    token: string;
  }>;
}

export const ISignupUseCase = Symbol('ISignupUseCase');
