import { User } from '../../src/contexts/user-management/domain/aggregates/user.aggregate';
import { UserId } from '../../src/contexts/user-management/domain/value-objects/user-id.vo';
import { Email } from '../../src/shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../src/contexts/user-management/domain/value-objects/user-name.vo';
import { HashedPassword } from '../../src/contexts/user-management/domain/value-objects/hashed-password.vo';

describe('User aggregate', () => {
  const parts = () => ({
    id: UserId.generate(),
    email: Email.create('test@example.com'),
    password: HashedPassword.fromHash('$2b$10$abcdefghijklmnopqrstuv'),
    name: UserName.create('John Doe'),
  });

  it('registers a new user and emits UserRegisteredEvent', () => {
    const { id, email, password, name } = parts();

    const user = User.register(id, email, password, name);

    expect(user.getId()).toBe(id);
    expect(user.getEmail().getValue()).toBe('test@example.com');
    expect(user.getName().getValue()).toBe('John Doe');
    expect(user.getDomainEvents()).toHaveLength(1);
    expect(user.getDomainEvents()[0].eventName).toBe('UserRegistered');
  });

  it('reconstitutes a user without emitting events', () => {
    const { id, email, password, name } = parts();
    const createdAt = new Date();
    const updatedAt = new Date();

    const user = User.reconstitute(id, email, password, name, createdAt, updatedAt);

    expect(user.getDomainEvents()).toHaveLength(0);
    expect(user.getCreatedAt()).toBe(createdAt);
  });

  it('keeps the password hash behind a value object', () => {
    const { id, email, password, name } = parts();

    const user = User.register(id, email, password, name);

    expect(user.getHashedPassword().getValue()).toBe('$2b$10$abcdefghijklmnopqrstuv');
  });
});
