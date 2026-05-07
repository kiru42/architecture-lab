import { User } from '../../domain';

export interface RegisterCommand {
  email: string;
  password: string;
  name: string;
}

export interface LoginCommand {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
}

export interface RegisterUserPort {
  execute(command: RegisterCommand): Promise<AuthResult>;
}

export interface LoginUserPort {
  execute(command: LoginCommand): Promise<AuthResult>;
}
