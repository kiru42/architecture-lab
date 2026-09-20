import { v4 as uuid } from 'uuid';
import { IEvent } from './event.interface';

class ProjectEvent implements IEvent {
  eventId: string;
  aggregateType = 'Project';
  timestamp: Date;
  data: any;

  constructor(
    public aggregateId: string,
    public eventType: string,
    public version: number,
    data: any,
  ) {
    this.eventId = uuid();
    this.timestamp = new Date();
    this.data = data;
  }
}

export class ProjectCreatedEvent extends ProjectEvent {
  constructor(aggregateId: string, name: string, userId: string, version = 1) {
    super(aggregateId, 'ProjectCreated', version, { name, userId });
  }
}

export class ProjectRenamedEvent extends ProjectEvent {
  constructor(aggregateId: string, name: string, version = 1) {
    super(aggregateId, 'ProjectRenamed', version, { name });
  }
}

export class ProjectArchivedEvent extends ProjectEvent {
  constructor(aggregateId: string, version = 1) {
    super(aggregateId, 'ProjectArchived', version, {});
  }
}

export class ProjectUnarchivedEvent extends ProjectEvent {
  constructor(aggregateId: string, version = 1) {
    super(aggregateId, 'ProjectUnarchived', version, {});
  }
}
