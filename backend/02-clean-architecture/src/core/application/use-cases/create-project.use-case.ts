import { Injectable, NotFoundException } from '@nestjs/common';
import { Project, ProjectRepository } from '../../domain';
import { CreateProjectDto, CreateProjectResultDto } from '../dtos/create-project.dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(dto: CreateProjectDto): Promise<CreateProjectResultDto> {
    // Create domain entity
    const project = Project.create(dto.name, dto.userId);
    
    // Persist via repository
    const saved = await this.projectRepository.save(project);
    
    // Map to result DTO
    return {
      id: saved.id,
      name: saved.name,
      archived: saved.archived,
      userId: saved.userId,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
