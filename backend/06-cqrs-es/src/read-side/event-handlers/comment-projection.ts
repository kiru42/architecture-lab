import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommentAddedEvent, CommentDeletedEvent } from '../../shared/events/comment.events';
import { InMemoryCommentReadRepository } from '../../infrastructure/read-models/in-memory-comment-read-repository';
import { CommentReadModel } from '../projections/comment-read-model';

/** Keeps the comment read model in sync with the event stream. */
@EventsHandler(CommentAddedEvent, CommentDeletedEvent)
export class CommentProjection implements IEventHandler<CommentAddedEvent | CommentDeletedEvent> {
  constructor(private readonly readRepo: InMemoryCommentReadRepository) {}

  handle(event: CommentAddedEvent | CommentDeletedEvent): void {
    if (event instanceof CommentAddedEvent) {
      this.readRepo.save(
        new CommentReadModel(
          event.aggregateId,
          event.data.content,
          event.data.taskId,
          event.data.authorId,
          event.timestamp,
          event.timestamp,
        ),
      );
      return;
    }

    this.readRepo.delete(event.aggregateId);
  }
}
