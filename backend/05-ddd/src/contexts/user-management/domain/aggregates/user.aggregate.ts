import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { UserId } from '../value-objects/user-id.vo';
import { Email } from '../../../../shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../value-objects/user-name.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { UserRegisteredEvent } from '../events/user-registered.event';

export class User extends AggregateRoot<UserId> {
  private constructor(
    id: UserId,
    private readonly email: Email,
    private readonly hashedPassword: HashedPassword,
    private readonly name: UserName,
    private readonly createdAt: Date,
  ) {
    super(id);
  }

  static register(
    id: UserId,
    email: Email,
    hashedPassword: HashedPassword,
    name: UserName,
  ): User {
    const user = new User(id, email, hashedPassword, name, new Date());
    user.addDomainEvent(
      new UserRegisteredEvent(id.getValue(), email.getValue(), name.getValue()),
    );
    return user;
  }

  static reconstitute(
    id: UserId,
    email: Email,
    hashedPassword: HashedPassword,
    name: UserName,
    createdAt: Date,
  ): User {
    return new User(id, email, hashedPassword, name, createdAt);
  }

  getEmail(): Email {
    return this.email;
  }

  getName(): UserName {
    return this.name;
  }

  getHashedPassword(): HashedPassword {
    return this.hashedPassword;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
