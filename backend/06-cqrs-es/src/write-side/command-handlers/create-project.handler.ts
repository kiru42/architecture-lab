import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateProjectCommand } from '../commands/project.commands';
import { Project } from '../aggregates/project.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(CreateProjectCommand)
export class CreateProjectHandler implements ICommandHandler<CreateProjectCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateProjectCommand): Promise<void> {
    const project = Project.create(command.projectId, command.name, command.userId);
    const events = project.getUncommittedEvents();
    await this.eventStore.appendEvents(command.projectId, events, 0);

    // Publish so the projections update; without this the read side stays empty.
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    project.clearUncommittedEvents();
  }
}
