import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProjectRepository, Project } from '../../core/domain';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Project | null> {
    const prismaProject = await this.prisma.project.findUnique({ where: { id } });
    if (!prismaProject) return null;
    
    return new Project(
      prismaProject.id,
      prismaProject.name,
      prismaProject.archived,
      prismaProject.userId,
      prismaProject.createdAt,
      prismaProject.updatedAt,
    );
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    const prismaProjects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    
    return prismaProjects.map(p => new Project(
      p.id,
      p.name,
      p.archived,
      p.userId,
      p.createdAt,
      p.updatedAt,
    ));
  }

  async save(project: Project): Promise<Project> {
    const data = {
      name: project.name,
      archived: project.archived,
      userId: project.userId,
      updatedAt: project.updatedAt,
    };

    let prismaProject;
    if (project.id) {
      // Update existing
      prismaProject = await this.prisma.project.update({
        where: { id: project.id },
        data,
      });
    } else {
      // Create new
      prismaProject = await this.prisma.project.create({ data });
    }

    return new Project(
      prismaProject.id,
      prismaProject.name,
      prismaProject.archived,
      prismaProject.userId,
      prismaProject.createdAt,
      prismaProject.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }
}
