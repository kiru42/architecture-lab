import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetTasksQuery } from './get-tasks.query';
import { ITaskRepository } from '../../domain/repositories/task.repository';

export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: string;
}

@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(@Inject('ITaskRepository') private readonly repo: ITaskRepository) {}

  async execute(query: GetTasksQuery): Promise<TaskDto[]> {
    const tasks = await this.repo.findByProjectId(query.projectId);
    return tasks.map((t) => ({
      id: t.getId().getValue(),
      title: t.getTitle(),
      description: t.getDescription(),
      status: t.getStatus().getValue(),
    }));
  }
}
