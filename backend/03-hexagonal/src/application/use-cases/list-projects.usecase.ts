import { Inject, Injectable } from '@nestjs/common';
import { IListProjectsUseCase } from '@domain/ports/primary/list-projects.usecase.interface';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '@domain/ports/secondary/project.repository.interface';
import { Project } from '@domain/model/project.entity';

@Injectable()
export class ListProjectsUseCase implements IListProjectsUseCase {
  constructor(
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(userId: string): Promise<Project[]> {
    return await this.projectRepository.findByUserId(userId);
  }
}
