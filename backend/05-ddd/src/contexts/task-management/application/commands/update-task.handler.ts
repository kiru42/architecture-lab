import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { UpdateTaskCommand } from './update-task.command';
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

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @Inject(ITaskRepositoryToken) private readonly repo: ITaskRepository,
    @Inject(IProjectRepositoryToken) private readonly projectRepo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.repo.findById(TaskId.create(command.taskId));
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Ownership is inherited from the project the task lives in.
    const project = await this.projectRepo.findById(ProjectId.create(task.getProjectId()));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(command.userId)) {
      throw new ForbiddenException('Access denied');
    }

    const c = command.changes;
    if (c.title !== undefined) task.rename(c.title);
    if (c.description !== undefined) task.describe(c.description);
    if (c.dueDate !== undefined) task.reschedule(c.dueDate);
    if (c.assigneeId !== undefined) {
      c.assigneeId === null ? task.unassign() : task.assignTo(c.assigneeId);
    }
    if (c.completed !== undefined) c.completed ? task.complete() : task.reopen();

    await this.repo.save(task);
    task.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    task.clearDomainEvents();
    return task;
  }
}
