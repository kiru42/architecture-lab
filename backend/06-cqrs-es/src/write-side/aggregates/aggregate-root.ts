import { IEvent } from '../../shared/events/event.interface';

export abstract class AggregateRoot {
  private _version = 0;
  private _uncommittedEvents: IEvent[] = [];

  constructor(protected readonly id: string) {}

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this._version;
  }

  getUncommittedEvents(): IEvent[] {
    return [...this._uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this._uncommittedEvents = [];
  }

  /**
   * Replay events to reconstitute aggregate state
   */
  loadFromHistory(events: IEvent[]): void {
    events.forEach((event) => {
      this.applyEvent(event, false);
      this._version = event.version;
    });
  }

  /**
   * Apply a new event (will be appended to uncommitted events)
   */
  protected applyEvent(event: IEvent, isNew = true): void {
    // Delegate to specific handler method (e.g., onUserRegistered)
    const handler = this.getEventHandler(event.eventType);
    if (handler) {
      handler.call(this, event);
    }

    if (isNew) {
      this._uncommittedEvents.push(event);
    }
  }

  /**
   * Override this to map event types to handler methods
   */
  protected abstract getEventHandler(eventType: string): ((event: IEvent) => void) | null;
}
