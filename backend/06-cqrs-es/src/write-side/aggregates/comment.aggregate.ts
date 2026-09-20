import { AggregateRoot } from './aggregate-root';
import { IEvent } from '../../shared/events/event.interface';
import { CommentAddedEvent, CommentDeletedEvent } from '../../shared/events/comment.events';

export class Comment extends AggregateRoot {
  private content: string | null = null;
  private taskId: string | null = null;
  private authorId: string | null = null;
  private createdAt: Date = new Date();
  private deleted = false;

  private constructor(id: string) {
    super(id);
  }

  static add(id: string, content: string, taskId: string, authorId: string): Comment {
    const comment = new Comment(id);
    comment.applyEvent(new CommentAddedEvent(id, { content, taskId, authorId }, 1));
    return comment;
  }

  static fromHistory(id: string, events: IEvent[]): Comment {
    const comment = new Comment(id);
    comment.loadFromHistory(events);
    return comment;
  }

  remove(): void {
    if (this.deleted) return;
    this.applyEvent(new CommentDeletedEvent(this.id, this._nextVersion()));
  }

  getContent(): string | null {
    return this.content;
  }
  getTaskId(): string | null {
    return this.taskId;
  }
  getAuthorId(): string | null {
    return this.authorId;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  isDeleted(): boolean {
    return this.deleted;
  }
  isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }

  private _nextVersion(): number {
    return this.getVersion() + this.getUncommittedEvents().length + 1;
  }

  protected getEventHandler(eventType: string): ((event: IEvent) => void) | null {
    switch (eventType) {
      case 'CommentAdded':
        return this.onAdded;
      case 'CommentDeleted':
        return this.onDeleted;
      default:
        return null;
    }
  }

  private onAdded(event: IEvent): void {
    this.content = event.data.content;
    this.taskId = event.data.taskId;
    this.authorId = event.data.authorId;
    this.createdAt = event.timestamp;
    this.deleted = false;
  }

  private onDeleted(): void {
    this.deleted = true;
  }
}
