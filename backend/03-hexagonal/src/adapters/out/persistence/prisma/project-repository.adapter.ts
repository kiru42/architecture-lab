import { Injectable } from '@nestjs/common';
import { Project } from '../../../../domain';
import { ProjectRepositoryPort } from '../../../../ports';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaProjectRepository implements ProjectRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(project: Project): Promise<Project> {
    const created = await this.prisma.project.create({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        ownerId: project.ownerId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
    });
    return new Project(
      created.id,
      created.name,
      created.description,
      created.ownerId,
      created.createdAt,
      created.updatedAt,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) return null;
    return new Project(
      project.id,
      project.name,
      project.description,
      project.ownerId,
      project.createdAt,
      project.updatedAt,
    );
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({ where: { ownerId } });
    return projects.map(
      (p: any) => new Project(p.id, p.name, p.description, p.ownerId, p.createdAt, p.updatedAt),
    );
  }

  async findByName(name: string): Promise<Project | null> {
    const project = await this.prisma.project.findUnique({ where: { name } });
    if (!project) return null;
    return new Project(
      project.id,
      project.name,
      project.description,
      project.ownerId,
      project.createdAt,
      project.updatedAt,
    );
  }
}
