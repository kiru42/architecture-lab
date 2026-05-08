import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async listByUser(userId: string): Promise<Project[]> {
    return this.projectsRepository.findByUserId(userId);
  }

  async create(userId: string, name: string): Promise<Project> {
    return this.projectsRepository.create({ name, userId });
  }

  async update(id: string, userId: string, data: { name?: string; archived?: boolean }): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Access denied');
    return this.projectsRepository.update(id, data);
  }

  async findByIdForUser(id: string, userId: string): Promise<Project> {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Access denied');
    return project;
  }
}
