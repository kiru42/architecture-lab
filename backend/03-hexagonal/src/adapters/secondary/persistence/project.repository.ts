import { Injectable } from '@nestjs/common';
import { IProjectRepository } from '@domain/ports/secondary/project.repository.interface';
import { Project } from '@domain/model/project.entity';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, userId: string): Promise<Project> {
    const project = await this.prisma.project.create({
      data: { name, userId },
    });
    return new Project(project);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });
    return project ? new Project(project) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return projects.map((p) => new Project(p));
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const project = await this.prisma.project.update({
      where: { id },
      data,
    });
    return new Project(project);
  }
}
