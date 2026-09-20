import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '../../domain';
import { CreateProjectResultDto } from '../dtos/create-project.dto';

@Injectable()
export class ListProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(userId: string): Promise<CreateProjectResultDto[]> {
    const projects = await this.projectRepository.findAllByUserId(userId);

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      archived: p.archived,
      userId: p.userId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
