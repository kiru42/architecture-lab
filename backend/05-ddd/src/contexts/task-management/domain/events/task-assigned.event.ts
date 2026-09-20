import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

/** Published when a task is assigned; the notification layer listens for this. */
export class TaskAssignedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly assigneeId: string,
    public readonly title: string,
  ) {
    super(aggregateId, 'TaskAssigned');
  }
}
