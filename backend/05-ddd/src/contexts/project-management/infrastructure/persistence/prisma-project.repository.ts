import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectName } from '../../domain/value-objects/project-name.vo';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(project: Project): Promise<void> {
    await this.prisma.project.upsert({
      where: { id: project.getId().getValue() },
      create: {
        id: project.getId().getValue(),
        name: project.getName().getValue(),
        description: project.getDescription(),
        ownerId: project.getOwnerId(),
        createdAt: project.getCreatedAt(),
        updatedAt: project.getUpdatedAt(),
      },
      update: {
        name: project.getName().getValue(),
        description: project.getDescription(),
        updatedAt: project.getUpdatedAt(),
      },
    });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id: id.getValue() } });
    if (!row) return null;
    return Project.reconstitute(
      ProjectId.create(row.id),
      ProjectName.create(row.name),
      row.description,
      row.ownerId,
      row.createdAt,
      row.updatedAt,
    );
  }

  async findByOwnerId(ownerId: string): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({ where: { ownerId } });
    return rows.map((r) =>
      Project.reconstitute(
        ProjectId.create(r.id),
        ProjectName.create(r.name),
        r.description,
        r.ownerId,
        r.createdAt,
        r.updatedAt,
      ),
    );
  }
}
