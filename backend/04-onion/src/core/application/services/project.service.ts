import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Project } from '../../domain/entities/project.entity';
import { IProjectRepository } from '../interfaces/project-repository.interface';

export interface CreateProjectCommand {
  name: string;
  userId: string;
}

export interface UpdateProjectCommand {
  name?: string;
  archived?: boolean;
}

@Injectable()
export class ProjectService {
  constructor(
    @Inject('IProjectRepository') private readonly projectRepository: IProjectRepository,
  ) {}

  async create(command: CreateProjectCommand): Promise<Project> {
    return this.projectRepository.create(Project.create(command.name, command.userId));
  }

  async listByUser(userId: string): Promise<Project[]> {
    return this.projectRepository.findByUserId(userId);
  }

  async update(id: string, userId: string, command: UpdateProjectCommand): Promise<Project> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }

    let updated = project;
    if (command.name !== undefined) updated = updated.rename(command.name);
    if (command.archived !== undefined) {
      updated = command.archived ? updated.archive() : updated.unarchive();
    }

    return this.projectRepository.update(updated);
  }

  /** Used by the task service to enforce ownership before touching tasks. */
  async requireOwnedProject(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (!project.isOwnedBy(userId)) {
      throw new ForbiddenException('Access denied');
    }
    return project;
  }
}
