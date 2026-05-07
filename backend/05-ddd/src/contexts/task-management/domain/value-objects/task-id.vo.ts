import { EntityId } from '../../../../shared-kernel/domain/value-objects/entity-id.vo';
export class TaskId extends EntityId {
  static create(value: string): TaskId { return new TaskId(EntityId.create(value).getValue()); }
  static generate(): TaskId { return new TaskId(EntityId.generate().getValue()); }
}
