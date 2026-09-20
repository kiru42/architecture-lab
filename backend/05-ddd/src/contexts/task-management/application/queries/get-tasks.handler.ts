import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { GetTasksQuery } from './get-tasks.query';
import {
  ITaskRepository,
  ITaskRepository as ITaskRepositoryToken,
} from '../../domain/repositories/task.repository';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../../project-management/domain/repositories/project.repository';
import { Task } from '../../domain/aggregates/task.aggregate';
import { ProjectId } from '../../../project-management/domain/value-objects/project-id.vo';

@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    @Inject(ITaskRepositoryToken) private readonly repo: ITaskRepository,
    @Inject(IProjectRepositoryToken) private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(query: GetTasksQuery): Promise<Task[]> {
    const project = await this.projectRepo.findById(ProjectId.create(query.projectId));
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(query.userId)) {
      throw new ForbiddenException('Access denied');
    }
    return this.repo.findByProjectId(query.projectId);
  }
}
