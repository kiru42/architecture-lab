import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { AddCommentCommand } from '../commands/comment.commands';
import { Comment } from '../aggregates/comment.aggregate';
import { Project } from '../aggregates/project.aggregate';
import { Task } from '../aggregates/task.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(AddCommentCommand)
export class AddCommentHandler implements ICommandHandler<AddCommentCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddCommentCommand): Promise<void> {
    const taskHistory = await this.eventStore.getEvents(command.taskId);
    if (taskHistory.length === 0) {
      throw new NotFoundException('Task not found');
    }
    const task = Task.fromHistory(command.taskId, taskHistory);

    const projectHistory = await this.eventStore.getEvents(task.getProjectId()!);
    const project = projectHistory.length
      ? Project.fromHistory(task.getProjectId()!, projectHistory)
      : null;
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const comment = Comment.add(command.commentId, command.content, command.taskId, command.userId);
    const events = comment.getUncommittedEvents();
    await this.eventStore.appendEvents(command.commentId, events, 0);

    for (const event of events) {
      await this.eventBus.publish(event);
    }
    comment.clearUncommittedEvents();
  }
}
