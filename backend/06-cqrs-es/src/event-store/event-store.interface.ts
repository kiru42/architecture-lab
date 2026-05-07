import { IEvent } from '../shared/events/event.interface';

export interface IEventStore {
  /**
   * Append events to the store for a specific aggregate
   * @param aggregateId - The aggregate identifier
   * @param events - Events to append
   * @param expectedVersion - Expected current version (optimistic locking)
   */
  appendEvents(aggregateId: string, events: IEvent[], expectedVersion: number): Promise<void>;

  /**
   * Get all events for an aggregate
   * @param aggregateId - The aggregate identifier
   */
  getEvents(aggregateId: string): Promise<IEvent[]>;

  /**
   * Get events for an aggregate from a specific version
   * @param aggregateId - The aggregate identifier
   * @param fromVersion - Starting version (inclusive)
   */
  getEventsFromVersion(aggregateId: string, fromVersion: number): Promise<IEvent[]>;

  /**
   * Get all events of a specific type (for projections)
   * @param eventType - Event type to filter by
   */
  getEventsByType(eventType: string): Promise<IEvent[]>;
}
