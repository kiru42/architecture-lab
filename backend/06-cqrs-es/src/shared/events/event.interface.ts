export interface IEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}
