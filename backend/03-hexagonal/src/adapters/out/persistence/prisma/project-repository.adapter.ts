import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { IProjectRepository } from '../../../../domain/ports/secondary/project.repository.interface';
import { Project } from '../../../../domain/model/project.entity';
import { PrismaService } from './prisma.service';

/** Driven adapter: implements the IProjectRepository port on top of Prisma. */
@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, userId: string): Promise<Project> {
    const row = await this.prisma.project.create({ data: { name, userId } });
    return new Project(row);
  }

  async findById(id: string): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id } });
    return row ? new Project(row) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => new Project(row));
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    const patch: Prisma.ProjectUpdateInput = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.archived !== undefined) patch.archived = data.archived;

    const row = await this.prisma.project.update({ where: { id }, data: patch });
    return new Project(row);
  }
}
