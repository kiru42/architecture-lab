import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { GetCommentsQuery } from './get-comments.query';
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
import { TaskId } from '../../../task-management/domain/value-objects/task-id.vo';
import { ProjectId } from '../../../project-management/domain/value-objects/project-id.vo';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    @Inject(ICommentRepositoryToken) private readonly repo: ICommentRepository,
    @Inject(ITaskRepositoryToken) private readonly taskRepo: ITaskRepository,
    @Inject(IProjectRepositoryToken) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(query: GetCommentsQuery): Promise<Comment[]> {
    const task = await this.taskRepo.findById(TaskId.create(query.taskId));
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const project = await this.projectRepo.findById(ProjectId.create(task.getProjectId()));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(query.userId)) {
      throw new ForbiddenException('Access denied');
    }
    return this.repo.findByTaskId(query.taskId);
  }
}
