export class EntityId {
  protected constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EntityId cannot be empty');
    }
  }

  static create(value: string): EntityId {
    return new EntityId(value);
  }

  static generate(): EntityId {
    return new EntityId(crypto.randomUUID());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EntityId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
