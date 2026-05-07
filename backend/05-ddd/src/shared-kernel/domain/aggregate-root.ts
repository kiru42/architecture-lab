import { DomainEvent } from './events/domain-event';

export abstract class AggregateRoot<T> {
  private _domainEvents: DomainEvent[] = [];

  protected constructor(protected readonly id: T) {}

  getId(): T {
    return this.id;
  }

  getDomainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
}
