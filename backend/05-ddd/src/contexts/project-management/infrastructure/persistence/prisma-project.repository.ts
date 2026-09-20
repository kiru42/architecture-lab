import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared-kernel/infrastructure/prisma.service';
import { IProjectRepository } from '../../domain/repositories/project.repository';
import { Project } from '../../domain/aggregates/project.aggregate';
import { ProjectId } from '../../domain/value-objects/project-id.vo';
import { ProjectName } from '../../domain/value-objects/project-name.vo';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(project: Project): Promise<void> {
    const id = project.getId().getValue();
    await this.prisma.project.upsert({
      where: { id },
      create: {
        id,
        name: project.getName().getValue(),
        archived: project.isArchived(),
        userId: project.getUserId(),
        createdAt: project.getCreatedAt(),
        updatedAt: project.getUpdatedAt(),
      },
      update: {
        name: project.getName().getValue(),
        archived: project.isArchived(),
        updatedAt: project.getUpdatedAt(),
      },
    });
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const row = await this.prisma.project.findUnique({ where: { id: id.getValue() } });
    return row ? PrismaProjectRepository.toDomain(row) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    const rows = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(PrismaProjectRepository.toDomain);
  }

  private static toDomain(row: {
    id: string;
    name: string;
    archived: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return Project.reconstitute(
      ProjectId.create(row.id),
      ProjectName.create(row.name),
      row.archived,
      row.userId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
