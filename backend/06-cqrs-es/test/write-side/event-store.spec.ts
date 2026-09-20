import { InMemoryEventStore } from '../../src/infrastructure/event-store/in-memory-event-store';
import { IEvent } from '../../src/shared/events/event.interface';

describe('InMemoryEventStore', () => {
  let eventStore: InMemoryEventStore;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
  });

  it('should append events to the store', async () => {
    const event: IEvent = {
      eventId: 'e1',
      aggregateId: 'agg1',
      aggregateType: 'User',
      eventType: 'UserRegistered',
      version: 1,
      timestamp: new Date(),
      data: { email: 'test@example.com' },
    };

    await eventStore.appendEvents('agg1', [event], 0);
    const events = await eventStore.getEvents('agg1');

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe('UserRegistered');
  });

  it('should throw error on version conflict (optimistic locking)', async () => {
    const event1: IEvent = {
      eventId: 'e1',
      aggregateId: 'agg1',
      aggregateType: 'User',
      eventType: 'UserRegistered',
      version: 1,
      timestamp: new Date(),
      data: {},
    };

    await eventStore.appendEvents('agg1', [event1], 0);

    // Try to append with wrong expected version
    const event2: IEvent = { ...event1, eventId: 'e2', version: 2 };
    await expect(eventStore.appendEvents('agg1', [event2], 0)).rejects.toThrow('Version conflict');
  });

  it('should get events from specific version', async () => {
    const events: IEvent[] = [1, 2, 3, 4, 5].map((v) => ({
      eventId: `e${v}`,
      aggregateId: 'agg1',
      aggregateType: 'User',
      eventType: 'Event',
      version: v,
      timestamp: new Date(),
      data: {},
    }));

    for (let i = 0; i < events.length; i++) {
      await eventStore.appendEvents('agg1', [events[i]], i);
    }

    const fromVersion3 = await eventStore.getEventsFromVersion('agg1', 3);
    expect(fromVersion3).toHaveLength(3); // versions 3, 4, 5
    expect(fromVersion3[0].version).toBe(3);
  });
});
