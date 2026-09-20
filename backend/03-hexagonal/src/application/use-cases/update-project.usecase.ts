import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUpdateProjectUseCase } from '../../domain/ports/primary/update-project.usecase.interface';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../domain/ports/secondary/project.repository.interface';
import { Project } from '../../domain/model/project.entity';

@Injectable()
export class UpdateProjectUseCase implements IUpdateProjectUseCase {
  constructor(
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    data: { name?: string; archived?: boolean },
  ): Promise<Project> {
    // Verify project exists and belongs to user
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.projectRepository.update(id, data);
  }
}
