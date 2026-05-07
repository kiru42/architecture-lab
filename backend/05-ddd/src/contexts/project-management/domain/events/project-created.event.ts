import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

export class ProjectCreatedEvent extends DomainEvent {
  constructor(aggregateId: string, public readonly name: string, public readonly ownerId: string) {
    super(aggregateId, 'ProjectCreated');
  }
}
