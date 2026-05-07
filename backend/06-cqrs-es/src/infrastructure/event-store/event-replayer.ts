import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IEventStore } from '../../event-store/event-store.interface';
import { UserRegisteredEvent } from '../../shared/events/user-registered.event';

@Injectable()
export class EventReplayer implements OnModuleInit {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async onModuleInit() {
    // Rebuild read models from event store on startup
    await this.replayAllEvents();
  }

  async replayAllEvents(): Promise<void> {
    console.log('[EventReplayer] Rebuilding read models from event store...');

    const allEvents = (this.eventStore as any).getAllEvents();

    for (const event of allEvents) {
      // Map stored events back to domain event classes
      const domainEvent = this.toDomainEvent(event);
      if (domainEvent) {
        this.eventBus.publish(domainEvent);
      }
    }

    console.log(`[EventReplayer] Replayed ${allEvents.length} events`);
  }

  private toDomainEvent(event: any): any {
    switch (event.eventType) {
      case 'UserRegistered':
        return new UserRegisteredEvent(
          event.aggregateId,
          event.data.email,
          event.data.hashedPassword,
          event.data.name,
          event.version,
        );
      default:
        return null;
    }
  }
}
