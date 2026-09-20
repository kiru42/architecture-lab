import { v4 as uuid } from 'uuid';
import { IEvent } from './event.interface';

class CommentEvent implements IEvent {
  eventId: string;
  aggregateType = 'Comment';
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

export class CommentAddedEvent extends CommentEvent {
  constructor(
    aggregateId: string,
    payload: { content: string; taskId: string; authorId: string },
    version = 1,
  ) {
    super(aggregateId, 'CommentAdded', version, payload);
  }
}

export class CommentDeletedEvent extends CommentEvent {
  constructor(aggregateId: string, version = 1) {
    super(aggregateId, 'CommentDeleted', version, {});
  }
}
