import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTaskCommand } from './create-task.command';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/aggregates/task.aggregate';
import { TaskId } from '../../domain/value-objects/task-id.vo';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject('ITaskRepository') private readonly repo: ITaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(cmd: CreateTaskCommand): Promise<string> {
    const taskId = TaskId.generate();
    const task = Task.create(taskId, cmd.title, cmd.description, cmd.projectId);
    await this.repo.save(task);
    task.getDomainEvents().forEach((e) => this.eventBus.publish(e));
    task.clearDomainEvents();
    return taskId.getValue();
  }
}
