import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Task } from '../../domain';
import {
  AssignTaskCommand,
  AssignTaskPort,
  TaskRepositoryPort,
  ProjectRepositoryPort,
  UserRepositoryPort,
} from '../../ports';

@Injectable()
export class AssignTaskUseCase implements AssignTaskPort {
  constructor(
    private readonly taskRepository: TaskRepositoryPort,
    private readonly projectRepository: ProjectRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: AssignTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.belongsToProject(command.projectId)) {
      throw new ForbiddenException('Task does not belong to this project');
    }

    const user = await this.userRepository.findById(command.assignedToId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedTask = task.assignTo(command.assignedToId);
    return this.taskRepository.update(updatedTask);
  }
}
