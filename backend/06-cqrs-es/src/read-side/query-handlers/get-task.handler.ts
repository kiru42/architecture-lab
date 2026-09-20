import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetTaskQuery } from '../queries/task.queries';
import { InMemoryProjectReadRepository } from '../../infrastructure/read-models/in-memory-project-read-repository';
import { InMemoryTaskReadRepository } from '../../infrastructure/read-models/in-memory-task-read-repository';
import { TaskReadModel } from '../projections/task-read-model';

@QueryHandler(GetTaskQuery)
export class GetTaskHandler implements IQueryHandler<GetTaskQuery> {
  constructor(
    private readonly projectRepo: InMemoryProjectReadRepository,
    private readonly taskRepo: InMemoryTaskReadRepository,
  ) {}

  async execute(query: GetTaskQuery): Promise<TaskReadModel> {
    const task = this.taskRepo.findById(query.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = this.projectRepo.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== query.userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }
}
