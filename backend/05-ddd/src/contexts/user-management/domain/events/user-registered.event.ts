import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

export class UserRegisteredEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    super(aggregateId, 'UserRegistered');
  }
}
