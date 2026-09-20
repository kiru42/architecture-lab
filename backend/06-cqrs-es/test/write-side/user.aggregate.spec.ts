import { User } from '../../src/write-side/aggregates/user.aggregate';
import { UserRegisteredEvent } from '../../src/shared/events/user-registered.event';

describe('User Aggregate (Event Sourced)', () => {
  it('should register a new user and emit UserRegisteredEvent', () => {
    const user = User.register('u1', 'test@example.com', 'hashed-pwd', 'John Doe');

    expect(user.getId()).toBe('u1');
    expect(user.getEmail()).toBe('test@example.com');
    expect(user.getName()).toBe('John Doe');
    expect(user.getVersion()).toBe(0); // version incremented by event store, not aggregate

    const events = user.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('UserRegistered');
  });

  it('should reconstitute user from event history', () => {
    const event = new UserRegisteredEvent('u1', 'test@example.com', 'hashed-pwd', 'John Doe', 1);
    event.timestamp = new Date('2024-01-01');

    const user = User.fromHistory('u1', [event]);

    expect(user.getId()).toBe('u1');
    expect(user.getEmail()).toBe('test@example.com');
    expect(user.getName()).toBe('John Doe');
    expect(user.getVersion()).toBe(1);
    expect(user.getRegisteredAt()?.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(user.getUncommittedEvents()).toHaveLength(0); // no new events when replaying
  });

  it('should clear uncommitted events after saving', () => {
    const user = User.register('u1', 'test@example.com', 'hashed-pwd', 'John');
    expect(user.getUncommittedEvents()).toHaveLength(1);

    user.clearUncommittedEvents();
    expect(user.getUncommittedEvents()).toHaveLength(0);
  });
});
