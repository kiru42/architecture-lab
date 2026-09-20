import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Project } from '../../../core/domain/entities/project.entity';
import { IProjectRepository } from '../../../core/application/interfaces/project-repository.interface';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(project: Project): Promise<Project> {
    const raw = await this.prisma.project.create({
      data: { name: project.name, userId: project.userId },
    });
    return PrismaProjectRepository.toDomain(raw);
  }

  async findById(id: string): Promise<Project | null> {
    const raw = await this.prisma.project.findUnique({ where: { id } });
    return raw ? PrismaProjectRepository.toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const raws = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return raws.map(PrismaProjectRepository.toDomain);
  }

  async update(project: Project): Promise<Project> {
    const raw = await this.prisma.project.update({
      where: { id: project.id },
      data: { name: project.name, archived: project.archived },
    });
    return PrismaProjectRepository.toDomain(raw);
  }

  private static toDomain(raw: {
    id: string;
    name: string;
    archived: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return new Project(raw.id, raw.name, raw.archived, raw.userId, raw.createdAt, raw.updatedAt);
  }
}
