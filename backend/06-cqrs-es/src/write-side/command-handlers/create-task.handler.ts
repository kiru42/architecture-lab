import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CreateTaskCommand } from '../commands/task.commands';
import { Task } from '../aggregates/task.aggregate';
import { Project } from '../aggregates/project.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTaskCommand): Promise<void> {
    // Ownership lives on the project aggregate, so it is resolved from the
    // project's own stream rather than by reaching into another context's tables.
    const projectHistory = await this.eventStore.getEvents(command.projectId);
    if (projectHistory.length === 0) {
      throw new NotFoundException('Project not found');
    }
    const project = Project.fromHistory(command.projectId, projectHistory);
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const task = Task.create(command.taskId, command.title, command.projectId, command.options);
    const events = task.getUncommittedEvents();
    await this.eventStore.appendEvents(command.taskId, events, 0);

    for (const event of events) {
      await this.eventBus.publish(event);
    }
    task.clearUncommittedEvents();
  }
}
