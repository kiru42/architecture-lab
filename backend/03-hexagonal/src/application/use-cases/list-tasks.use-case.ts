import { Injectable } from '@nestjs/common';
import { Task } from '../../domain';
import {
  ListTasksByProjectPort,
  TaskRepositoryPort,
} from '../../ports';

@Injectable()
export class ListTasksByProjectUseCase implements ListTasksByProjectPort {
  constructor(private readonly taskRepository: TaskRepositoryPort) {}

  async execute(projectId: string): Promise<Task[]> {
    return this.taskRepository.findByProjectId(projectId);
  }
}
