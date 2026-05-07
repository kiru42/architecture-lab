import { Injectable, ConflictException } from '@nestjs/common';
import { IEventStore } from '../../event-store/event-store.interface';
import { IEvent } from '../../shared/events/event.interface';

@Injectable()
export class InMemoryEventStore implements IEventStore {
  private events: Map<string, IEvent[]> = new Map();
  private allEvents: IEvent[] = [];

  async appendEvents(
    aggregateId: string,
    events: IEvent[],
    expectedVersion: number,
  ): Promise<void> {
    const existing = this.events.get(aggregateId) || [];
    const currentVersion = existing.length;

    // Optimistic concurrency check
    if (currentVersion !== expectedVersion) {
      throw new ConflictException(
        `Version conflict: expected ${expectedVersion}, got ${currentVersion}`,
      );
    }

    // Append events
    const newEvents = events.map((e, i) => ({
      ...e,
      version: currentVersion + i + 1,
      timestamp: new Date(),
    }));

    this.events.set(aggregateId, [...existing, ...newEvents]);
    this.allEvents.push(...newEvents);
  }

  async getEvents(aggregateId: string): Promise<IEvent[]> {
    return this.events.get(aggregateId) || [];
  }

  async getEventsFromVersion(aggregateId: string, fromVersion: number): Promise<IEvent[]> {
    const events = this.events.get(aggregateId) || [];
    return events.filter((e) => e.version >= fromVersion);
  }

  async getEventsByType(eventType: string): Promise<IEvent[]> {
    return this.allEvents.filter((e) => e.eventType === eventType);
  }

  // Helper for testing
  clear(): void {
    this.events.clear();
    this.allEvents = [];
  }

  // Get all events (for debugging/projections rebuild)
  getAllEvents(): IEvent[] {
    return [...this.allEvents];
  }
}
