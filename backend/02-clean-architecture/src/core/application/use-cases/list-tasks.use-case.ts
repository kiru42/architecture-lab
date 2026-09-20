import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository, Task, TaskRepository } from '../../domain';

@Injectable()
export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(projectId: string, userId: string): Promise<Task[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    return this.taskRepository.findAllByProjectId(projectId);
  }
}
