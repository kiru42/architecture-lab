import { UserRegisteredHandler } from '../../src/read-side/event-handlers/user-registered.handler';
import { InMemoryUserReadRepository } from '../../src/infrastructure/read-models/in-memory-user-read-repository';
import { UserRegisteredEvent } from '../../src/shared/events/user-registered.event';

describe('User Read Model Projection', () => {
  let handler: UserRegisteredHandler;
  let readRepo: InMemoryUserReadRepository;

  beforeEach(() => {
    readRepo = new InMemoryUserReadRepository();
    handler = new UserRegisteredHandler(readRepo);
  });

  it('should build read model from UserRegisteredEvent', () => {
    const event = new UserRegisteredEvent('u1', 'test@example.com', 'hashed-pwd', 'John Doe', 1);

    handler.handle(event);

    const user = readRepo.findById('u1');
    expect(user).toBeTruthy();
    expect(user?.email).toBe('test@example.com');
    expect(user?.name).toBe('John Doe');
  });

  it('should find user by email (denormalized index)', () => {
    const event = new UserRegisteredEvent('u1', 'test@example.com', 'hashed-pwd', 'John', 1);
    handler.handle(event);

    const user = readRepo.findByEmail('test@example.com');
    expect(user).toBeTruthy();
    expect(user?.id).toBe('u1');
  });

  it('should return all users', () => {
    handler.handle(new UserRegisteredEvent('u1', 'user1@example.com', 'pwd', 'User 1', 1));
    handler.handle(new UserRegisteredEvent('u2', 'user2@example.com', 'pwd', 'User 2', 1));

    const users = readRepo.findAll();
    expect(users).toHaveLength(2);
  });
});
