import { User } from '../../model/user.entity';

// Primary Port: Use case for user signin
export interface ISigninUseCase {
  execute(
    email: string,
    password: string,
  ): Promise<{
    user: User;
    token: string;
  }>;
}

export const ISigninUseCase = Symbol('ISigninUseCase');
