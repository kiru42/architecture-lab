import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Task, TaskRepository, ProjectRepository } from '../../domain';
import { CreateTaskDto, CreateTaskResultDto } from '../dtos/create-task.dto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(dto: CreateTaskDto): Promise<CreateTaskResultDto> {
    // Verify project exists and user owns it
    const project = await this.projectRepository.findById(dto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    
    if (!project.isOwnedBy(dto.userId)) {
      throw new ForbiddenException('You do not own this project');
    }
    
    // Create domain entity
    const task = Task.create(dto.title, dto.projectId, dto.description);
    
    // Persist
    const saved = await this.taskRepository.save(task);
    
    return {
      id: saved.id,
      title: saved.title,
      description: saved.description,
      completed: saved.completed,
      dueDate: saved.dueDate,
      projectId: saved.projectId,
      assigneeId: saved.assigneeId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
