import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository, Task, TaskRepository } from '../../domain';
import { UpdateTaskDto } from '../dtos/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(id: string, userId: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Ownership is inherited from the project the task lives in.
    const project = await this.projectRepository.findById(task.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;
    if (dto.assigneeId !== undefined) {
      dto.assigneeId === null ? task.unassign() : task.assignTo(dto.assigneeId);
    }
    if (dto.completed !== undefined) {
      dto.completed ? task.complete() : task.uncomplete();
    }

    return this.taskRepository.save(task);
  }
}
