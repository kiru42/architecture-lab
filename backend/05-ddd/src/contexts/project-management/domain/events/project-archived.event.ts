import { DomainEvent } from '../../../../shared-kernel/domain/events/domain-event';

export class ProjectArchivedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super(aggregateId, 'ProjectArchived');
  }
}
