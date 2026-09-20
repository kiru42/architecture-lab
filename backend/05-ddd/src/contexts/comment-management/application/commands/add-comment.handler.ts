import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { AddCommentCommand } from './add-comment.command';
import {
  ICommentRepository,
  ICommentRepository as ICommentRepositoryToken,
} from '../../domain/repositories/comment.repository';
import {
  ITaskRepository,
  ITaskRepository as ITaskRepositoryToken,
} from '../../../task-management/domain/repositories/task.repository';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../../project-management/domain/repositories/project.repository';
import { Comment } from '../../domain/aggregates/comment.aggregate';
import { CommentId } from '../../domain/value-objects/comment-id.vo';
import { CommentContent } from '../../domain/value-objects/comment-content.vo';
import { TaskId } from '../../../task-management/domain/value-objects/task-id.vo';
import { ProjectId } from '../../../project-management/domain/value-objects/project-id.vo';

@CommandHandler(AddCommentCommand)
export class AddCommentHandler implements ICommandHandler<AddCommentCommand> {
  constructor(
    @Inject(ICommentRepositoryToken) private readonly repo: ICommentRepository,
    @Inject(ITaskRepositoryToken) private readonly taskRepo: ITaskRepository,
    @Inject(IProjectRepositoryToken) private readonly projectRepo: IProjectRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddCommentCommand): Promise<Comment> {
    const task = await this.taskRepo.findById(TaskId.create(command.taskId));
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.projectRepo.findById(ProjectId.create(task.getProjectId()));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(command.authorId)) {
      throw new ForbiddenException('Access denied');
    }

    const comment = Comment.add(
      CommentId.generate(),
      CommentContent.create(command.content),
      command.taskId,
      command.authorId,
    );

    await this.repo.save(comment);
    comment.getDomainEvents().forEach((event) => this.eventBus.publish(event));
    comment.clearDomainEvents();
    return comment;
  }
}
