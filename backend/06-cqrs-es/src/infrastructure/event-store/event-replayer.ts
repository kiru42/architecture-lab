import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { IEventStore } from '../../event-store/event-store.interface';
import { IEvent } from '../../shared/events/event.interface';
import { UserRegisteredEvent } from '../../shared/events/user-registered.event';
import {
  ProjectArchivedEvent,
  ProjectCreatedEvent,
  ProjectRenamedEvent,
  ProjectUnarchivedEvent,
} from '../../shared/events/project.events';
import {
  TaskAssignedEvent,
  TaskCompletedEvent,
  TaskCreatedEvent,
  TaskReopenedEvent,
  TaskUpdatedEvent,
} from '../../shared/events/task.events';
import { CommentAddedEvent, CommentDeletedEvent } from '../../shared/events/comment.events';

/**
 * Rebuilds every read model from the event stream on startup.
 *
 * Note: the stored events are plain objects (the store spreads them to stamp a
 * version), so they lose their prototype and can no longer be matched by
 * `instanceof` in the projections. They are therefore reconstructed here into
 * real domain-event instances before being republished.
 */
@Injectable()
export class EventReplayer implements OnModuleInit {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.replayAllEvents();
  }

  async replayAllEvents(): Promise<void> {
    const allEvents = (this.eventStore as any).getAllEvents?.() ?? [];
    if (allEvents.length === 0) return;

    console.log(`[EventReplayer] Rebuilding read models from ${allEvents.length} events...`);

    for (const event of allEvents) {
      const domainEvent = this.toDomainEvent(event);
      if (domainEvent) {
        await this.eventBus.publish(domainEvent);
      }
    }

    console.log('[EventReplayer] Read models rebuilt.');
  }

  private toDomainEvent(event: any): IEvent | null {
    const d = event.data ?? {};
    switch (event.eventType) {
      case 'UserRegistered':
        return new UserRegisteredEvent(
          event.aggregateId,
          d.email,
          d.hashedPassword,
          d.name,
          event.version,
        );
      case 'ProjectCreated':
        return new ProjectCreatedEvent(event.aggregateId, d.name, d.userId, event.version);
      case 'ProjectRenamed':
        return new ProjectRenamedEvent(event.aggregateId, d.name, event.version);
      case 'ProjectArchived':
        return new ProjectArchivedEvent(event.aggregateId, event.version);
      case 'ProjectUnarchived':
        return new ProjectUnarchivedEvent(event.aggregateId, event.version);
      case 'TaskCreated':
        return new TaskCreatedEvent(event.aggregateId, d, event.version);
      case 'TaskUpdated':
        return new TaskUpdatedEvent(event.aggregateId, d, event.version);
      case 'TaskCompleted':
        return new TaskCompletedEvent(event.aggregateId, event.version);
      case 'TaskReopened':
        return new TaskReopenedEvent(event.aggregateId, event.version);
      case 'TaskAssigned':
        return new TaskAssignedEvent(event.aggregateId, d.assigneeId, event.version);
      case 'CommentAdded':
        return new CommentAddedEvent(event.aggregateId, d, event.version);
      case 'CommentDeleted':
        return new CommentDeletedEvent(event.aggregateId, event.version);
      default:
        return null;
    }
  }
}
