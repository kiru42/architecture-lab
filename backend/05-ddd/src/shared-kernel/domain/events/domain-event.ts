export interface IDomainEvent {
  occurredOn: Date;
  aggregateId: string;
  eventName: string;
}

export abstract class DomainEvent implements IDomainEvent {
  public readonly occurredOn: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly eventName: string,
  ) {
    this.occurredOn = new Date();
  }
}
