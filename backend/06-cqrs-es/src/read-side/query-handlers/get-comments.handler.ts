import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GetCommentsQuery } from '../queries/comment.queries';
import { InMemoryCommentReadRepository } from '../../infrastructure/read-models/in-memory-comment-read-repository';
import { InMemoryProjectReadRepository } from '../../infrastructure/read-models/in-memory-project-read-repository';
import { InMemoryTaskReadRepository } from '../../infrastructure/read-models/in-memory-task-read-repository';
import { CommentReadModel } from '../projections/comment-read-model';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    private readonly commentRepo: InMemoryCommentReadRepository,
    private readonly taskRepo: InMemoryTaskReadRepository,
    private readonly projectRepo: InMemoryProjectReadRepository,
  ) {}

  async execute(query: GetCommentsQuery): Promise<CommentReadModel[]> {
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
    return this.commentRepo.findByTaskId(query.taskId);
  }
}
