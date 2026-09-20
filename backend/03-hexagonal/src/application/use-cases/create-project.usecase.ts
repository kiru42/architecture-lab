import { Inject, Injectable } from '@nestjs/common';
import { ICreateProjectUseCase } from '../../domain/ports/primary/create-project.usecase.interface';
import {
  IProjectRepository,
  IProjectRepository as IProjectRepositoryToken,
} from '../../domain/ports/secondary/project.repository.interface';
import { Project } from '../../domain/model/project.entity';

@Injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @Inject(IProjectRepositoryToken)
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(name: string, userId: string): Promise<Project> {
    return await this.projectRepository.create(name, userId);
  }
}
