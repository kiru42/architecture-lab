import { IEvent } from './event.interface';
import { v4 as uuid } from 'uuid';

export class UserRegisteredEvent implements IEvent {
  eventId: string;
  aggregateId: string;
  aggregateType = 'User';
  eventType = 'UserRegistered';
  version: number;
  timestamp: Date;
  data: {
    email: string;
    hashedPassword: string;
    name: string;
  };

  constructor(
    aggregateId: string,
    email: string,
    hashedPassword: string,
    name: string,
    version = 1,
  ) {
    this.eventId = uuid();
    this.aggregateId = aggregateId;
    this.version = version;
    this.timestamp = new Date();
    this.data = { email, hashedPassword, name };
  }
}
