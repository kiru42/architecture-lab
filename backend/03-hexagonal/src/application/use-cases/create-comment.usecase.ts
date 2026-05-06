import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICreateCommentUseCase } from '@domain/ports/primary/create-comment.usecase.interface';
import {
  ICommentRepository,
  ICommentRepository as ICommentRepositoryToken,
} from '@domain/ports/secondary/comment.repository.interface';
import {
  ITaskRepository,
  ITaskRepository as ITaskRepositoryToken,
} from '@domain/ports/secondary/task.repository.interface';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '@domain/ports/secondary/project.repository.interface';
import { Comment } from '@domain/model/comment.entity';

@Injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @Inject(ICommentRepositoryToken)
    private readonly commentRepository: ICommentRepository,
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    content: string,
    taskId: string,
    userId: string,
  ): Promise<Comment> {
    // Verify task exists
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify user has access to the project
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.commentRepository.create(content, taskId, userId);
  }
}
