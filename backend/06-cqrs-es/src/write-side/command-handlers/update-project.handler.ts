import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateProjectCommand } from '../commands/project.commands';
import { Project } from '../aggregates/project.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(UpdateProjectCommand)
export class UpdateProjectHandler implements ICommandHandler<UpdateProjectCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateProjectCommand): Promise<void> {
    const history = await this.eventStore.getEvents(command.projectId);
    if (history.length === 0) {
      throw new NotFoundException('Project not found');
    }

    const project = Project.fromHistory(command.projectId, history);
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    if (command.changes.name !== undefined) project.rename(command.changes.name);
    if (command.changes.archived !== undefined) {
      command.changes.archived ? project.archive() : project.unarchive();
    }

    const events = project.getUncommittedEvents();
    if (events.length === 0) return;

    await this.eventStore.appendEvents(command.projectId, events, history.length);
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    project.clearUncommittedEvents();
  }
}
