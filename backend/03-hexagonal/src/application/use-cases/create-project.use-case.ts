import { Injectable, ConflictException } from '@nestjs/common';
import { Project } from '../../domain';
import {
  CreateProjectCommand,
  CreateProjectPort,
  ProjectRepositoryPort,
} from '../../ports';

@Injectable()
export class CreateProjectUseCase implements CreateProjectPort {
  constructor(private readonly projectRepository: ProjectRepositoryPort) {}

  async execute(command: CreateProjectCommand): Promise<Project> {
    const existing = await this.projectRepository.findByName(command.name);
    if (existing) {
      throw new ConflictException('Project with this name already exists');
    }

    const project = Project.create(
      crypto.randomUUID(),
      command.name,
      command.description ?? null,
      command.ownerId,
    );

    return this.projectRepository.create(project);
  }
}
