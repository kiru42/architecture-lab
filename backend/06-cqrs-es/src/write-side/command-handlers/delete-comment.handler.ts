import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { DeleteCommentCommand } from '../commands/comment.commands';
import { Comment } from '../aggregates/comment.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentHandler implements ICommandHandler<DeleteCommentCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<void> {
    const history = await this.eventStore.getEvents(command.commentId);
    if (history.length === 0) {
      throw new NotFoundException('Comment not found');
    }

    const comment = Comment.fromHistory(command.commentId, history);
    if (!comment.isAuthoredBy(command.userId)) {
      throw new ForbiddenException('Only the author can delete this comment');
    }

    comment.remove();
    const events = comment.getUncommittedEvents();
    await this.eventStore.appendEvents(command.commentId, events, history.length);

    for (const event of events) {
      await this.eventBus.publish(event);
    }
    comment.clearUncommittedEvents();
  }
}
