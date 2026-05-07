import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../interfaces/project-repository.interface';

export interface CreateProjectDto {
  name: string;
  description?: string;
  ownerId: string;
}

@Injectable()
export class ProjectService {
  constructor(@Inject('IProjectRepository') private readonly projectRepository: IProjectRepository) {}

  async create(dto: CreateProjectDto): Promise<Project> {
    const existing = await this.projectRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException('Project with this name already exists');
    }

    const project = Project.create(
      crypto.randomUUID(),
      dto.name,
      dto.description ?? null,
      dto.ownerId,
    );

    return this.projectRepository.create(project);
  }

  async listByOwner(ownerId: string): Promise<Project[]> {
    return this.projectRepository.findByOwnerId(ownerId);
  }
}
