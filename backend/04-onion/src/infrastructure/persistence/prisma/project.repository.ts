import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Project } from '../../../core/domain/entities/project.entity';
import { IProjectRepository } from '../../../core/application/interfaces/project-repository.interface';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(project: Project): Promise<Project> {
    const raw = await this.prisma.project.create({
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
      raw.id,
      raw.name,
      raw.description,
      raw.ownerId,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const raw = await this.prisma.project.findUnique({ where: { id } });
    if (!raw) return null;
    return new Project(
      raw.id,
      raw.name,
      raw.description,
      raw.ownerId,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const raws = await this.prisma.project.findMany({ where: { ownerId } });
    return raws.map(
      (raw: any) => new Project(raw.id, raw.name, raw.description, raw.ownerId, raw.createdAt, raw.updatedAt),
    );
  }

  async findByName(name: string): Promise<Project | null> {
    const raw = await this.prisma.project.findFirst({ where: { name } });
    if (!raw) return null;
    return new Project(
      raw.id,
      raw.name,
      raw.description,
      raw.ownerId,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
