import { EntityId } from '../../../../shared-kernel/domain/value-objects/entity-id.vo';

export class CommentId extends EntityId {
  static create(value: string): CommentId {
    return new CommentId(EntityId.create(value).getValue());
  }

  static generate(): CommentId {
    return new CommentId(EntityId.generate().getValue());
  }
}
