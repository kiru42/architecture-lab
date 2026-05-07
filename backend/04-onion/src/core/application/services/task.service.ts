import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { Task, TaskPriority } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../interfaces/task-repository.interface';
import { IProjectRepository } from '../interfaces/project-repository.interface';
import { IUserRepository } from '../interfaces/user-repository.interface';

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  projectId: string;
  createdById: string;
  dueDate?: Date;
}

export interface AssignTaskDto {
  taskId: string;
  assignedToId: string;
  projectId: string;
}

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository') private readonly taskRepository: ITaskRepository,
    @Inject('IProjectRepository') private readonly projectRepository: IProjectRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
  ) {}

  async create(dto: CreateTaskDto): Promise<Task> {
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = Task.create(
      crypto.randomUUID(),
      dto.title,
      dto.description ?? null,
      dto.priority,
      dto.projectId,
      dto.createdById,
      dto.dueDate ?? null,
    );

    return this.taskRepository.create(task);
  }

  async assign(dto: AssignTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (!task.belongsToProject(dto.projectId)) {
      throw new ForbiddenException('Task does not belong to this project');
    }

    const user = await this.userRepository.findById(dto.assignedToId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = task.assignTo(dto.assignedToId);
    return this.taskRepository.update(updated);
  }

  async listByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.findByProjectId(projectId);
  }
}
