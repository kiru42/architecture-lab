import { AggregateRoot } from './aggregate-root';
import { IEvent } from '../../shared/events/event.interface';
import { UserRegisteredEvent } from '../../shared/events/user-registered.event';

export class User extends AggregateRoot {
  private email: string | null = null;
  private hashedPassword: string | null = null;
  private name: string | null = null;
  private registeredAt: Date | null = null;

  private constructor(id: string) {
    super(id);
  }

  /**
   * Factory: Create new user (emits UserRegisteredEvent)
   */
  static register(
    id: string,
    email: string,
    hashedPassword: string,
    name: string,
  ): User {
    const user = new User(id);
    const event = new UserRegisteredEvent(id, email, hashedPassword, name, 1);
    user.applyEvent(event);
    return user;
  }

  /**
   * Factory: Reconstitute from event history
   */
  static fromHistory(id: string, events: IEvent[]): User {
    const user = new User(id);
    user.loadFromHistory(events);
    return user;
  }

  // Getters
  getEmail(): string | null {
    return this.email;
  }

  getName(): string | null {
    return this.name;
  }

  getHashedPassword(): string | null {
    return this.hashedPassword;
  }

  getRegisteredAt(): Date | null {
    return this.registeredAt;
  }

  // Event handlers
  protected getEventHandler(eventType: string): ((event: IEvent) => void) | null {
    switch (eventType) {
      case 'UserRegistered':
        return this.onUserRegistered;
      default:
        return null;
    }
  }

  private onUserRegistered(event: IEvent): void {
    const data = event.data as UserRegisteredEvent['data'];
    this.email = data.email;
    this.hashedPassword = data.hashedPassword;
    this.name = data.name;
    this.registeredAt = event.timestamp;
  }
}
