import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { CompleteTaskCommand } from './complete-task.command';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { TaskId } from '../../domain/value-objects/task-id.vo';

@CommandHandler(CompleteTaskCommand)
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand> {
  constructor(
    @Inject('ITaskRepository') private readonly repo: ITaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: CompleteTaskCommand): Promise<void> {
    const taskId = TaskId.create(cmd.taskId);
    const task = await this.repo.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    task.complete();
    await this.repo.save(task);
    task.getDomainEvents().forEach((e) => this.eventBus.publish(e));
    task.clearDomainEvents();
  }
}
