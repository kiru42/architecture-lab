import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ICreateTaskUseCase } from '@domain/ports/primary/create-task.usecase.interface';
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
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @Inject(ITaskRepositoryToken)
    private readonly taskRepository: ITaskRepository,
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(data: {
    title: string;
    description?: string;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
    userId: string;
  }): Promise<Task> {
    // Verify project exists and belongs to user
    const project = await this.projectRepository.findById(data.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== data.userId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.taskRepository.create({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      projectId: data.projectId,
      assigneeId: data.assigneeId,
    });
  }
}
