import { AggregateRoot } from '../../../../shared-kernel/domain/aggregate-root';
import { CommentId } from '../value-objects/comment-id.vo';
import { CommentContent } from '../value-objects/comment-content.vo';
import { CommentAddedEvent } from '../events/comment-added.event';

/** Aggregate root for the Comment bounded context. */
export class Comment extends AggregateRoot<CommentId> {
  private constructor(
    id: CommentId,
    private readonly content: CommentContent,
    private readonly taskId: string,
    private readonly authorId: string,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {
    super(id);
  }

  static add(id: CommentId, content: CommentContent, taskId: string, authorId: string): Comment {
    const now = new Date();
    const comment = new Comment(id, content, taskId, authorId, now, now);
    comment.addDomainEvent(new CommentAddedEvent(id.getValue(), taskId, authorId));
    return comment;
  }

  static reconstitute(
    id: CommentId,
    content: CommentContent,
    taskId: string,
    authorId: string,
    createdAt: Date,
    updatedAt: Date,
  ): Comment {
    return new Comment(id, content, taskId, authorId, createdAt, updatedAt);
  }

  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }

  getId(): CommentId { return this.id; }
  getContent(): CommentContent { return this.content; }
  getTaskId(): string { return this.taskId; }
  getAuthorId(): string { return this.authorId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}
