import { v4 as uuid } from 'uuid';
import { IEvent } from './event.interface';

class TaskEvent implements IEvent {
  eventId: string;
  aggregateType = 'Task';
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

export class TaskCreatedEvent extends TaskEvent {
  constructor(
    aggregateId: string,
    payload: {
      title: string;
      description: string | null;
      dueDate: Date | null;
      assigneeId: string | null;
      projectId: string;
    },
    version = 1,
  ) {
    super(aggregateId, 'TaskCreated', version, payload);
  }
}

export class TaskUpdatedEvent extends TaskEvent {
  constructor(
    aggregateId: string,
    payload: { title?: string; description?: string | null; dueDate?: Date | null },
    version = 1,
  ) {
    super(aggregateId, 'TaskUpdated', version, payload);
  }
}

export class TaskCompletedEvent extends TaskEvent {
  constructor(aggregateId: string, version = 1) {
    super(aggregateId, 'TaskCompleted', version, {});
  }
}

export class TaskReopenedEvent extends TaskEvent {
  constructor(aggregateId: string, version = 1) {
    super(aggregateId, 'TaskReopened', version, {});
  }
}

export class TaskAssignedEvent extends TaskEvent {
  constructor(
    aggregateId: string,
    assigneeId: string | null,
    version = 1,
  ) {
    super(aggregateId, 'TaskAssigned', version, { assigneeId });
  }
}
