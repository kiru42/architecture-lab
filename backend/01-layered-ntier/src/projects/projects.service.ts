import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { Project } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async listProjects(userId: string): Promise<Project[]> {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProject(userId: string, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        userId,
      },
    });
  }

  async updateProject(userId: string, projectId: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id: projectId },
    });
  }
}
