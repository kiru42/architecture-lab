import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Comment, CommentRepository, ProjectRepository, TaskRepository } from '../../domain';
import { ListCommentsDto } from '../dtos/comment.dto';

@Injectable()
export class ListCommentsUseCase {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(dto: ListCommentsDto): Promise<Comment[]> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(dto.userId)) {
      throw new ForbiddenException('Access denied');
    }

    return this.commentRepository.findAllByTaskId(dto.taskId);
  }
}
