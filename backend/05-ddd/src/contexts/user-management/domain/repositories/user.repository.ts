import { User } from '../aggregates/user.aggregate';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
