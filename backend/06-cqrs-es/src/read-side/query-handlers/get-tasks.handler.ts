import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetTasksQuery } from '../queries/task.queries';
import { InMemoryProjectReadRepository } from '../../infrastructure/read-models/in-memory-project-read-repository';
import { InMemoryTaskReadRepository } from '../../infrastructure/read-models/in-memory-task-read-repository';
import { TaskReadModel } from '../projections/task-read-model';

@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    private readonly projectRepo: InMemoryProjectReadRepository,
    private readonly taskRepo: InMemoryTaskReadRepository,
  ) {}

  async execute(query: GetTasksQuery): Promise<TaskReadModel[]> {
    const project = this.projectRepo.findById(query.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== query.userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.taskRepo.findByProjectId(query.projectId);
  }
}
