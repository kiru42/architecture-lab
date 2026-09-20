import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateTaskCommand } from '../commands/task.commands';
import { Task } from '../aggregates/task.aggregate';
import { Project } from '../aggregates/project.aggregate';
import { IEventStore } from '../../event-store/event-store.interface';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @Inject('IEventStore') private readonly eventStore: IEventStore,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<void> {
    const history = await this.eventStore.getEvents(command.taskId);
    if (history.length === 0) {
      throw new NotFoundException('Task not found');
    }

    const task = Task.fromHistory(command.taskId, history);

    const projectHistory = await this.eventStore.getEvents(task.getProjectId()!);
    if (projectHistory.length === 0) {
      throw new NotFoundException('Project not found');
    }
    const project = Project.fromHistory(task.getProjectId()!, projectHistory);
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const c = command.changes;
    if (c.title !== undefined || c.description !== undefined || c.dueDate !== undefined) {
      task.update({ title: c.title, description: c.description, dueDate: c.dueDate });
    }
    if (c.completed !== undefined) c.completed ? task.complete() : task.reopen();
    if (c.assigneeId !== undefined) task.assignTo(c.assigneeId);

    const events = task.getUncommittedEvents();
    if (events.length === 0) return;

    await this.eventStore.appendEvents(command.taskId, events, history.length);
    for (const event of events) {
      await this.eventBus.publish(event);
    }
    task.clearUncommittedEvents();
  }
}
