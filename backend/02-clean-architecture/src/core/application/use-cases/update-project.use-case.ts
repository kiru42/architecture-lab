import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Project, ProjectRepository } from '../../domain';
import { UpdateProjectDto } from '../dtos/update-project.dto';

@Injectable()
export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(id: string, userId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    if (dto.name !== undefined) project.rename(dto.name);
    if (dto.archived !== undefined) {
      dto.archived ? project.archive() : project.unarchive();
    }

    return this.projectRepository.save(project);
  }
}
