import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listProjects', () => {
    it('should return all projects for a user', async () => {
      const userId = 'user1';
      const projects = [
        {
          id: 'proj1',
          name: 'Project 1',
          archived: false,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'proj2',
          name: 'Project 2',
          archived: false,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.project.findMany.mockResolvedValue(projects);

      const result = await service.listProjects(userId);

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(projects);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const userId = 'user1';
      const createDto = { name: 'New Project' };
      const createdProject = {
        id: 'proj1',
        name: createDto.name,
        archived: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.create.mockResolvedValue(createdProject);

      const result = await service.createProject(userId, createDto);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          userId,
        },
      });
      expect(result).toEqual(createdProject);
    });
  });

  describe('updateProject', () => {
    it('should update a project owned by user', async () => {
      const userId = 'user1';
      const projectId = 'proj1';
      const updateDto = { name: 'Updated Name', archived: true };

      const existingProject = {
        id: projectId,
        userId,
        name: 'Old Name',
        archived: false,
      };

      const updatedProject = {
        ...existingProject,
        ...updateDto,
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);
      mockPrismaService.project.update.mockResolvedValue(updatedProject);

      const result = await service.updateProject(userId, projectId, updateDto);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: updateDto,
      });
      expect(result).toEqual(updatedProject);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      const userId = 'user1';
      const projectId = 'nonexistent';
      const updateDto = { name: 'Updated' };

      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.updateProject(userId, projectId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.project.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user does not own project', async () => {
      const userId = 'user1';
      const projectId = 'proj1';
      const updateDto = { name: 'Updated' };

      const existingProject = {
        id: projectId,
        userId: 'otherUser',
      };

      mockPrismaService.project.findUnique.mockResolvedValue(existingProject);

      await expect(service.updateProject(userId, projectId, updateDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.project.update).not.toHaveBeenCalled();
    });
  });

  describe('getProjectById', () => {
    it('should return project if it exists', async () => {
      const projectId = 'proj1';
      const project = {
        id: projectId,
        name: 'Project',
        userId: 'user1',
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.project.findUnique.mockResolvedValue(project);

      const result = await service.getProjectById(projectId);

      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: projectId },
      });
      expect(result).toEqual(project);
    });

    it('should return null if project does not exist', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      const result = await service.getProjectById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
