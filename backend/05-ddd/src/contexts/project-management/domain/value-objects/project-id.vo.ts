import { EntityId } from '../../../../shared-kernel/domain/value-objects/entity-id.vo';

export class ProjectId extends EntityId {
  static create(value: string): ProjectId {
    return new ProjectId(EntityId.create(value).getValue());
  }
  static generate(): ProjectId {
    return new ProjectId(EntityId.generate().getValue());
  }
}
