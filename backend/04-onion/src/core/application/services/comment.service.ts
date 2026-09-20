import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../../domain/entities/comment.entity';
import { ICommentRepository } from '../interfaces/comment-repository.interface';
import { ITaskRepository } from '../interfaces/task-repository.interface';
import { ProjectService } from './project.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject('ICommentRepository') private readonly commentRepository: ICommentRepository,
    @Inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    private readonly projectService: ProjectService,
  ) {}

  async create(content: string, taskId: string, userId: string): Promise<Comment> {
    await this.requireAccessibleTask(taskId, userId);
    return this.commentRepository.create(Comment.create(content, taskId, userId));
  }

  async listByTask(taskId: string, userId: string): Promise<Comment[]> {
    await this.requireAccessibleTask(taskId, userId);
    return this.commentRepository.findByTaskId(taskId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!comment.isAuthoredBy(userId)) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.commentRepository.delete(id);
  }

  private async requireAccessibleTask(taskId: string, userId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.projectService.requireOwnedProject(task.projectId, userId);
    return task;
  }
}
