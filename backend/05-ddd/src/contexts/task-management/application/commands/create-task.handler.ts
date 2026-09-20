import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CreateTaskCommand } from './create-task.command';
import {
  ITaskRepository,
  ITaskRepository as ITaskRepositoryToken,
} from '../../domain/repositories/task.repository';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../../project-management/domain/repositories/project.repository';
import { Task } from '../../domain/aggregates/task.aggregate';
import { TaskId } from '../../domain/value-objects/task-id.vo';
import { ProjectId } from '../../../project-management/domain/value-objects/project-id.vo';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject(ITaskRepositoryToken) private readonly repo: ITaskRepository,
    @Inject(IProjectRepositoryToken) private readonly projectRepo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // A task may only be added to a project its author owns (anti-corruption
    // check across bounded contexts, done through the project's port).
    const project = await this.projectRepo.findById(ProjectId.create(command.projectId));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const task = Task.create(
      TaskId.generate(),
      command.title,
      command.projectId,
      command.options,
    );

    await this.repo.save(task);
    task.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    task.clearDomainEvents();
    return task;
  }
}
