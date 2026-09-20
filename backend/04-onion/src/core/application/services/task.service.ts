import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../interfaces/task-repository.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';
import { ProjectService } from './project.service';

export interface CreateTaskCommand {
  title: string;
  description?: string;
  dueDate?: Date;
  assigneeId?: string;
}

export interface UpdateTaskCommand {
  title?: string;
  description?: string;
  completed?: boolean;
  dueDate?: Date;
  assigneeId?: string;
}

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly projectService: ProjectService,
  ) {}

  async create(projectId: string, userId: string, command: CreateTaskCommand): Promise<Task> {
    await this.projectService.requireOwnedProject(projectId, userId);

    if (command.assigneeId) {
      await this.requireExistingUser(command.assigneeId);
    }

    return this.taskRepository.create(
      Task.create(command.title, projectId, {
        description: command.description ?? null,
        dueDate: command.dueDate ?? null,
        assigneeId: command.assigneeId ?? null,
      }),
    );
  }

  async listByProject(projectId: string, userId: string): Promise<Task[]> {
    await this.projectService.requireOwnedProject(projectId, userId);
    return this.taskRepository.findByProjectId(projectId);
  }

  async update(id: string, userId: string, command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    // Ownership is derived from the project the task belongs to.
    await this.projectService.requireOwnedProject(task.projectId, userId);

    if (command.assigneeId) {
      await this.requireExistingUser(command.assigneeId);
    }

    let updated = task;
    if (command.title !== undefined) updated = updated.rename(command.title);
    if (command.description !== undefined) updated = updated.describe(command.description);
    if (command.dueDate !== undefined) updated = updated.reschedule(command.dueDate);
    if (command.assigneeId !== undefined) updated = updated.reassign(command.assigneeId);
    if (command.completed !== undefined) {
      updated = command.completed ? updated.markCompleted() : updated.markIncomplete();
    }

    return this.taskRepository.update(updated);
  }

  private async requireExistingUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }
}
