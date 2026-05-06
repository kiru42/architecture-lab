import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUpdateTaskUseCase } from '@domain/ports/primary/update-task.usecase.interface';
import {
  ITaskRepository,
  ITaskRepository as ITaskRepositoryToken,
} from '@domain/ports/secondary/task.repository.interface';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '@domain/ports/secondary/project.repository.interface';
import { Task } from '@domain/model/task.entity';

@Injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      completed?: boolean;
      dueDate?: Date;
      assigneeId?: string;
    },
  ): Promise<Task> {
    // Verify task exists
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify project belongs to user
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.taskRepository.update(id, data);
  }
}
