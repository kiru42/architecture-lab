import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

export class CommentAddedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly taskId: string,
    public readonly authorId: string,
  ) {
    super(aggregateId, 'CommentAdded');
  }
}
