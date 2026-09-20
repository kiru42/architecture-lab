import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly title: string,
  ) {
    super(aggregateId, 'TaskCompleted');
  }
}
