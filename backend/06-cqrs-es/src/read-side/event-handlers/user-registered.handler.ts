import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../shared/events/user-registered.event';
import { InMemoryUserReadRepository } from '../../infrastructure/read-models/in-memory-user-read-repository';
import { UserReadModel } from '../projections/user-read-model';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  constructor(private readonly readRepo: InMemoryUserReadRepository) {}

  handle(event: UserRegisteredEvent): void {
    // Build read model from event
    const user = new UserReadModel(
      event.aggregateId,
      event.data.email,
      event.data.name,
      event.timestamp,
    );

    // Save to read-side store
    this.readRepo.save(user);

    console.log(`[Projection] User ${event.aggregateId} added to read model`);
  }
}
