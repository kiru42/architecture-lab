import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskRepository, ProjectRepository, UserRepository } from '../../domain';
import { AssignTaskDto, AssignTaskResultDto } from '../dtos/assign-task.dto';

@Injectable()
export class AssignTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(dto: AssignTaskDto): Promise<AssignTaskResultDto> {
    // Load task
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    
    // Verify project ownership
    const project = await this.projectRepository.findById(task.projectId);
    if (!project || !project.isOwnedBy(dto.userId)) {
      throw new ForbiddenException('You do not own this project');
    }
    
    // Verify assignee exists
    const assignee = await this.userRepository.findById(dto.assigneeId);
    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }
    
    // Business logic in domain entity
    task.assignTo(dto.assigneeId);
    
    // Persist
    await this.taskRepository.save(task);
    
    return { success: true };
  }
}
