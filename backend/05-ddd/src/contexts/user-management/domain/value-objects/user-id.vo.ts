import { EntityId } from '../../../../shared-kernel/domain/value-objects/entity-id.vo';

export class UserId extends EntityId {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): UserId {
    const id = EntityId.create(value);
    return new UserId(id.getValue());
  }

  static generate(): UserId {
    const id = EntityId.generate();
    return new UserId(id.getValue());
  }
}
