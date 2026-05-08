import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { name: string; userId: string }): Promise<Project> {
    return this.prisma.project.create({ data });
  }

  async update(id: string, data: { name?: string; archived?: boolean }): Promise<Project> {
    return this.prisma.project.update({ where: { id }, data });
  }
}
