import { User } from '../../src/contexts/user-management/domain/aggregates/user.aggregate';
import { UserId } from '../../src/contexts/user-management/domain/value-objects/user-id.vo';
import { Email } from '../../src/shared-kernel/domain/value-objects/email.vo';
import { UserName } from '../../src/contexts/user-management/domain/value-objects/user-name.vo';
import { HashedPassword } from '../../src/contexts/user-management/domain/value-objects/hashed-password.vo';

describe('User Aggregate', () => {
  it('should register a new user and emit UserRegisteredEvent', () => {
    const id = UserId.generate();
    const email = Email.create('test@example.com');
    const password = HashedPassword.fromHash('$2b$10$abcdefghijklmnopqrstuv');
    const name = UserName.create('John Doe');

    const user = User.register(id, email, password, name);

    expect(user.getId()).toBe(id);
    expect(user.getEmail()).toBe(email);
    expect(user.getName()).toBe(name);
    expect(user.getDomainEvents()).toHaveLength(1);
    expect(user.getDomainEvents()[0].eventName).toBe('UserRegistered');
  });

  it('should reconstitute a user without events', () => {
    const id = UserId.generate();
    const email = Email.create('test@example.com');
    const password = HashedPassword.fromHash('$2b$10$abcdefghijklmnopqrstuv');
    const name = UserName.create('John Doe');
    const createdAt = new Date();

    const user = User.reconstitute(id, email, password, name, createdAt);

    expect(user.getDomainEvents()).toHaveLength(0);
  });
});
