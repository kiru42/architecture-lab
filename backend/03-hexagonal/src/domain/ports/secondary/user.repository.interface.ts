import { User } from '../../model/user.entity';

// Secondary Port: Repository interface for User persistence
export interface IUserRepository {
  create(email: string, password: string, name: string): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

// DI token for dependency injection
export const IUserRepository = Symbol('IUserRepository');
