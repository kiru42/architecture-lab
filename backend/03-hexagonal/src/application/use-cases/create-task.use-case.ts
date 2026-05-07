import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskPriority } from '../../domain';
import {
  CreateTaskCommand,
  CreateTaskPort,
  TaskRepositoryPort,
  ProjectRepositoryPort,
} from '../../ports';

@Injectable()
export class CreateTaskUseCase implements CreateTaskPort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly projectRepository: ProjectRepositoryPort,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = Task.create(
      crypto.randomUUID(),
      command.title,
      command.description ?? null,
      command.priority as TaskPriority,
      command.projectId,
      command.createdById,
      command.dueDate ?? null,
    );

    return this.taskRepository.create(task);
  }
}
